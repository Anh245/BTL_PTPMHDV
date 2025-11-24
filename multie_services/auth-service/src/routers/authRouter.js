import Express from "express";
import { signIn, signOut, signUp } from "../controllers/authController.js";


const router = Express.Router();


router.post("/signup", signUp);
router.post("/signin", signIn);

router.post("/signout",signOut);


export default router;