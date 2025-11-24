import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true , trim: true ,lowercase: true },
   
    hashedPassword: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    createdAt: { type: Date, default: Date.now },
    displayName :{ type: String, trim: true, required:true},
    avatarUrl : { type: String, //link anh dai dien
                },
    avatarId : { type: String, //cloudinary id de xoa anh
               },
    bio: { type: String, maxLength: 500},
    phone:{ type: String, sparse: true},//cho phep null nhung ko trung lap
    },{
    timestamps: true,//tu dong them createdAt va updatedAt
    }

);

const User = mongoose.model('User', userSchema);

export default User;