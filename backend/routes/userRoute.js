import express from "express";
import { loginUser, loginAdmin, requestRegistrationOtp, verifyRegistrationOtp } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register/send-otp", requestRegistrationOtp);
userRouter.post("/register/verify-otp", verifyRegistrationOtp);
userRouter.post("/login", loginUser);
userRouter.post("/admin/login", loginAdmin);

export default userRouter;
