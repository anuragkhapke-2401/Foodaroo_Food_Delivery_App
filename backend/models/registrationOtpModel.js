import mongoose from "mongoose";

const registrationOtpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  passwordHash: { type: String, required: true },
  otpHash: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  sentAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
});

const registrationOtpModel = mongoose.model.registrationOtp || mongoose.model("registrationOtp", registrationOtpSchema);
export default registrationOtpModel;
