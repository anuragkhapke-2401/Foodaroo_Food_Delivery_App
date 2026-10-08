import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import { randomInt } from "node:crypto";
import registrationOtpModel from "../models/registrationOtpModel.js";
import { sendRegistrationOtp as sendOtpEmail } from "../config/sendgrid.js";

const createToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET);
const saltRounds = () => Number(process.env.SALT) || 10;

const loginForRole = async (req, res, role) => {
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";
  try {
    const user = await userModel.findOne({ email });
    if (!user || user.role !== role || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    const token = createToken(user._id);
    return res.json({ success: true, token, role: user.role });
  } catch {
    console.error("Login failed");
    return res.status(500).json({ success: false, message: "Unable to log in right now" });
  }
};

const loginUser = (req, res) => loginForRole(req, res, "user");
const loginAdmin = (req, res) => loginForRole(req, res, "admin");

const requestRegistrationOtp = async (req, res) => {
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body.password === "string" ? req.body.password : "";
  try {
    if (!name || name.length > 80 || !validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Enter a valid name and email" });
    }
    if (password.length < 8 || Buffer.byteLength(password) > 72) {
      return res.status(400).json({ success: false, message: "Password must be 8 or more characters and at most 72 bytes" });
    }
    if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
      return res.status(503).json({ success: false, message: "Email verification is not configured" });
    }

    if (await userModel.exists({ email })) {
      return res.status(409).json({ success: false, message: "An account already exists for this email" });
    }

    const existingOtp = await registrationOtpModel.findOne({ email });
    if (existingOtp && Date.now() - existingOtp.sentAt.getTime() < 60_000) {
      return res.status(429).json({ success: false, message: "Wait one minute before requesting another code" });
    }

    const otp = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const [passwordHash, otpHash] = await Promise.all([
      bcrypt.hash(password, saltRounds()),
      bcrypt.hash(otp, saltRounds()),
    ]);
    const now = new Date();
    await registrationOtpModel.findOneAndUpdate(
      { email },
      { name, passwordHash, otpHash, attempts: 0, sentAt: now, expiresAt: new Date(now.getTime() + 10 * 60_000) },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    try {
      await sendOtpEmail(email, otp);
    } catch {
      await registrationOtpModel.deleteOne({ email, otpHash });
      console.error("SendGrid failed to deliver a registration code");
      return res.status(503).json({ success: false, message: "Could not send the verification email. Check your email settings and try again" });
    }

    return res.json({ success: true, message: "Verification code sent to your email" });
  } catch {
    console.error("Registration code request failed");
    return res.status(500).json({ success: false, message: "Unable to start registration right now" });
  }
};

const verifyRegistrationOtp = async (req, res) => {
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const otp = typeof req.body.otp === "string" ? req.body.otp.trim() : "";
  if (!validator.isEmail(email) || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({ success: false, message: "Enter the six-digit code sent to your email" });
  }

  try {
    const pending = await registrationOtpModel.findOne({ email });
    if (!pending || pending.expiresAt <= new Date()) {
      if (pending) await pending.deleteOne();
      return res.status(400).json({ success: false, message: "That code has expired. Request a new one" });
    }
    if (pending.attempts >= 5) {
      await pending.deleteOne();
      return res.status(429).json({ success: false, message: "Too many attempts. Request a new code" });
    }
    if (!(await bcrypt.compare(otp, pending.otpHash))) {
      pending.attempts += 1;
      if (pending.attempts >= 5) await pending.deleteOne();
      else await pending.save();
      return res.status(400).json({ success: false, message: "Incorrect verification code" });
    }
    if (await userModel.exists({ email })) {
      await pending.deleteOne();
      return res.status(409).json({ success: false, message: "An account already exists for this email" });
    }

    const user = await userModel.create({
      name: pending.name,
      email,
      password: pending.passwordHash,
      role: "user",
    });
    await pending.deleteOne();
    return res.json({ success: true, token: createToken(user._id), role: user.role });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: "An account already exists for this email" });
    }
    console.error("Registration verification failed");
    return res.status(500).json({ success: false, message: "Unable to verify this code right now" });
  }
};

export { loginUser, loginAdmin, requestRegistrationOtp, verifyRegistrationOtp };
