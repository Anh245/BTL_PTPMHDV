import jwt from 'jsonwebtoken'
import User from "../models/User.js"
export const protectedRoute = (req, res , next) => {
    try {
        // lay access trong cookie
        const authHeader = req.headers['authorization'];
        const token =authHeader && authHeader.split(" ")[1];
        if( !token)
            return res.status(500).json({message : "Khong co token , quyen truy cap bi tu choi!"});

        // xac minh token da luu

        jwt.verify(token, env.process.ACCESS_TOKEN_SECRET, async(error, decodeUser) =>{

            // xac minh token
            if(error){
                console.error("Token khong hop le ",error );
                  return res.status(403).json({ message: "Access token het han" });
            }
            // tim user

            const user = await User.findById(decodeUser.userId).select("-hashPassword");
            if (!user) {
                return res.status(404).json({ message: "Khong tim thay user !" });
            }
            //gan user vao req
            req.user = user; 
            next();
        })
    } catch (error) {
         console.error("Loi khi xac minh JWT trong authMiddleware", error);
        return res.status(401).json({ message: "Loi he thong !" });
    }
}