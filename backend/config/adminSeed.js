import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";

export const ensureDefaultAdmin = async () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Foodaroo Admin";

  if (!email || !password) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env before starting the server");
  }
  if (!validator.isEmail(email)) {
    throw new Error("ADMIN_EMAIL must be a valid email address");
  }
  if (Buffer.byteLength(password) < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 bytes long");
  }

  const existingUser = await userModel.findOne({ email });
  if (existingUser) {
    if (existingUser.role !== "admin") {
      throw new Error("ADMIN_EMAIL belongs to a customer; choose a different admin email");
    }
    console.log(`Default admin ready: ${email}`);
    return;
  }

  const saltRounds = Number(process.env.SALT) || 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  await userModel.create({ name, email, password: passwordHash, role: "admin" });
  console.log(`Default admin created: ${email}`);
};
