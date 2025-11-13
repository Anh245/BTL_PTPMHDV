import mongoose from "mongoose";
const SessionSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true,
        index:true
    },
    refreshToken:{
        type: String,
        required: true,
        unique: true,
    },
    expiresAt:{
        type: Date,
        required: true
    }
},{
    timestamps: true,
});

SessionSchema.index({expiresAt: 1}, {expireAfterSeconds: 0});//xoa document khi qua han
//export model
const Session = mongoose.model('Session', SessionSchema);
export default Session;