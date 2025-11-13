import express from 'express';
import { connectDB } from './libs/db.js';

import dotenv from 'dotenv';
import authRouter from './routers/authRouter.js';
import cookieParser from 'cookie-parser';
import userRouter from './routers/userRouter.js';
import { protectedRoute } from './middleware/authMiddleware.js';
dotenv.config();
import cors from 'cors';
const app = express();
const PORT = process.env.PORT || 3000;

//fix CORS
//const cors = require("cors");

app.use(cors({
 origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true 
               // cho phép gửi cookie, header xác thực
}));
// Connect to the database

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());
//public routes

app.use ("/api/auth", authRouter);


//private routes
app.use(protectedRoute);
app.use("/api/users", userRouter);
connectDB().then(()=>{
  app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  });


});

