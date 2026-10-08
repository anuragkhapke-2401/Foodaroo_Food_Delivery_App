import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, default:"user" },
    cartData: { type: Object, default: {} },
  },
  { minimize: false }
);

const userModel = mongoose.model.user || mongoose.model("user", userSchema);
export default userModel;
