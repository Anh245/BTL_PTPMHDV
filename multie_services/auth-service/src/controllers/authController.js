import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Session from "../models/Session.js";
const ACCESS_TOKEN_TTL = '30m';
const REFRESH_TOKEN_TTL =  14 * 24 * 60 *60 * 1000;
export const signUp =  async (req, res) => {
    try {
        const {firstname, lastname,username,email, password} = req.body;
        if(!username || !password || !email || !firstname || !lastname){
            return res.status(400).json({message: "thong tin khong du"});
        }
        //kiem tra user da ton tai chua
        const duplicate = await User.findOne({ $or: [{ username }, { email }] });
        if(duplicate){
            return res.status(409).json({message: "Username hoặc email đã tồn tại"});
        }
        //ma hoa mat khau
        const hashedPassword = await bcrypt.hash(password, 10);// so lan ma hoa lap di lap lai

        //tao user moi luu vao db

        await User.create({
            username,
            hashedPassword,
            email,
            displayName: `${firstname} ${lastname}`,

        });
        //return success
        return res.status(201).json({message: "Đăng ký thành công."});
    } catch (error) {
        console.error("Loi dang ky user", error);
        return res.status(500).json({message: "loi server"});
    }
    
};
export const signIn = async (req, res) => {

    try {
        //lay input

        // Support login with username or email
        const { username: loginIdentifier, password } = req.body;
        if(!loginIdentifier || !password){
            return res.status(400).json({message: "thieu thong tin dang nhap"});
        }

        //get hashed password from db

        const user = await  User.findOne({ $or: [{username: loginIdentifier}, {email: loginIdentifier}] });

        if(!user){
            return res.status(401).json({message: "Tên đăng nhập hoặc mật khẩu không đúng"});
        }

        const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);

        if(!passwordCorrect){
            return res.status(401).json({message: "Tên đăng nhập hoặc mật khẩu không đúng"});
        }

        //neu khop, tao  accessToken = jwt
        const accessToken = jwt.sign({userId: user._id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: ACCESS_TOKEN_TTL});
        //tao refresh token 
        const refreshToken = crypto.randomBytes(64).toString("hex");
        //tao session luu refresh token
        await Session.create({
            userId: user._id,
            refreshToken,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
        });
        //tra ve refresh token cho cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite:"none",//backend, frontend khac domain
            maxAge: REFRESH_TOKEN_TTL,
        });

        //tra ve access token cho response
        return res.status(200).json({message:`user ${user.displayName} dang nhap thanh cong`, accessToken});


       



    } catch (error) {
        console.error("Loi dang nhap user", error);
        return res.status(500).json({message: "loi khi goi sign in"});
    }
};
export const signOut = async (req, res) => {
    try {
        //lay refresh token tu cookie
        const token = req.cookies?.refreshToken;
        if(token){
            //xoa refresh token trong session
            await Session.deleteOne({refreshToken: token});
        }
        //xoa  refresh token tren cookie
        res.clearCookie("refreshToken");
        return res.status(204).send();
    } catch (error) {
        console.error("Loi dang xuat user", error);
        return res.status(500).json({message: "loi khi goi sign out"});
    }



};

// tao refresh token tu access token
export const refreshToken = async (req, res) => {
    try {
        //lay token tu cookie
        const token = req.cookies?.refreshToken;
        if(!token){
            return res.status(401).json({message: "khong tim thay refresh token(khong ton tai)"});
        }
        //so sanh refresh token voi db
        const session = await Session.findOne({refreshToken: token});
        if(!session){
            return res.status(403).json({message: "refresh token khong hop le (ko tim thay trong db)"});
        }

        //kiem tra token het han chua
        if(session.expiresAt < new Date()){
            //xoa token het han
            await Session.deleteOne({refreshToken: token});
            return res.status(403).json({message: "refresh token het han (da het han)"});
        }

        //tao access token moi
        const accessToken = jwt.sign({userId: session.userId}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: ACCESS_TOKEN_TTL});

        return res.status(200).json({accessToken});
    } catch (error) {
        console.error("Loi refresh token", error);
        return res.status(500).json({message: "loi he thong (loi khi refresh token)"});
    }
};
