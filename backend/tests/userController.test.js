import { describe, it, before, after, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import registrationOtpModel from "../models/registrationOtpModel.js";
import {
  loginUser,
  loginAdmin,
  requestRegistrationOtp,
  verifyRegistrationOtp,
} from "../controllers/userController.js";
import { createMockReq, createMockRes } from "./helpers.js";

describe("User Controller", () => {
  const originalSecret = process.env.JWT_SECRET;
  const originalSendgridKey = process.env.SENDGRID_API_KEY;
  const originalSendgridEmail = process.env.SENDGRID_FROM_EMAIL;
  let originalConsoleError;

  before(() => {
    process.env.JWT_SECRET = "test_user_secret_123";
    process.env.SENDGRID_API_KEY = "SG.test_key";
    process.env.SENDGRID_FROM_EMAIL = "noreply@example.com";
  });

  after(() => {
    process.env.JWT_SECRET = originalSecret;
    process.env.SENDGRID_API_KEY = originalSendgridKey;
    process.env.SENDGRID_FROM_EMAIL = originalSendgridEmail;
  });

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = () => {};
  });

  afterEach(() => {
    console.error = originalConsoleError;
    mock.reset();
  });

  describe("loginUser & loginAdmin", () => {
    it("should reject login when user does not exist", async () => {
      mock.method(userModel, "findOne", async () => null);

      const req = createMockReq({
        body: { email: "nonexistent@example.com", password: "Password123!" },
      });
      const res = createMockRes();

      await loginUser(req, res);

      assert.strictEqual(res.statusCode, 401);
      assert.deepStrictEqual(res.data, {
        success: false,
        message: "Invalid email or password",
      });
    });

    it("should reject login when role does not match (admin trying user login)", async () => {
      const mockAdminUser = {
        _id: "admin123",
        email: "admin@example.com",
        password: await bcrypt.hash("AdminPass123!", 10),
        role: "admin",
      };

      mock.method(userModel, "findOne", async () => mockAdminUser);

      const req = createMockReq({
        body: { email: "admin@example.com", password: "AdminPass123!" },
      });
      const res = createMockRes();

      await loginUser(req, res);

      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.data.success, false);
    });

    it("should reject login when password is incorrect", async () => {
      const hashedPassword = await bcrypt.hash("CorrectPassword123!", 10);
      const mockUser = {
        _id: "user123",
        email: "user@example.com",
        password: hashedPassword,
        role: "user",
      };

      mock.method(userModel, "findOne", async () => mockUser);

      const req = createMockReq({
        body: { email: "user@example.com", password: "WrongPassword!" },
      });
      const res = createMockRes();

      await loginUser(req, res);

      assert.strictEqual(res.statusCode, 401);
      assert.deepStrictEqual(res.data, {
        success: false,
        message: "Invalid email or password",
      });
    });

    it("should succeed and return token for valid user credentials", async () => {
      const plainPassword = "ValidPassword123!";
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      const mockUser = {
        _id: "user_valid_id",
        email: "user@example.com",
        password: hashedPassword,
        role: "user",
      };

      mock.method(userModel, "findOne", async () => mockUser);

      const req = createMockReq({
        body: { email: "user@example.com", password: plainPassword },
      });
      const res = createMockRes();

      await loginUser(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.role, "user");
      assert.ok(res.data.token);
    });

    it("should succeed and return token for valid admin credentials", async () => {
      const plainPassword = "AdminPassword123!";
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      const mockAdmin = {
        _id: "admin_valid_id",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
      };

      mock.method(userModel, "findOne", async () => mockAdmin);

      const req = createMockReq({
        body: { email: "admin@example.com", password: plainPassword },
      });
      const res = createMockRes();

      await loginAdmin(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.role, "admin");
      assert.ok(res.data.token);
    });
  });

  describe("requestRegistrationOtp", () => {
    it("should reject invalid email or empty name", async () => {
      const req = createMockReq({
        body: { name: "", email: "not-an-email", password: "Password123!" },
      });
      const res = createMockRes();

      await requestRegistrationOtp(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.data.message, "Enter a valid name and email");
    });

    it("should reject password shorter than 8 characters", async () => {
      const req = createMockReq({
        body: { name: "John Doe", email: "john@example.com", password: "short" },
      });
      const res = createMockRes();

      await requestRegistrationOtp(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(
        res.data.message,
        "Password must be 8 or more characters and at most 72 bytes"
      );
    });

    it("should reject if account already exists", async () => {
      mock.method(userModel, "exists", async () => ({ _id: "existing_id" }));

      const req = createMockReq({
        body: { name: "John Doe", email: "existing@example.com", password: "Password123!" },
      });
      const res = createMockRes();

      await requestRegistrationOtp(req, res);

      assert.strictEqual(res.statusCode, 409);
      assert.strictEqual(res.data.message, "An account already exists for this email");
    });

    it("should rate limit if OTP was requested less than 60 seconds ago", async () => {
      mock.method(userModel, "exists", async () => null);
      mock.method(registrationOtpModel, "findOne", async () => ({
        sentAt: new Date(Date.now() - 20_000), // 20 seconds ago
      }));

      const req = createMockReq({
        body: { name: "John Doe", email: "ratelimit@example.com", password: "Password123!" },
      });
      const res = createMockRes();

      await requestRegistrationOtp(req, res);

      assert.strictEqual(res.statusCode, 429);
      assert.strictEqual(res.data.message, "Wait one minute before requesting another code");
    });
  });

  describe("verifyRegistrationOtp", () => {
    it("should reject non 6-digit OTP", async () => {
      const req = createMockReq({
        body: { email: "john@example.com", otp: "123" },
      });
      const res = createMockRes();

      await verifyRegistrationOtp(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(
        res.data.message,
        "Enter the six-digit code sent to your email"
      );
    });

    it("should reject expired or missing OTP record", async () => {
      mock.method(registrationOtpModel, "findOne", async () => null);

      const req = createMockReq({
        body: { email: "john@example.com", otp: "123456" },
      });
      const res = createMockRes();

      await verifyRegistrationOtp(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(
        res.data.message,
        "That code has expired. Request a new one"
      );
    });

    it("should reject when attempts reach 5", async () => {
      let deleted = false;
      const mockPending = {
        attempts: 5,
        expiresAt: new Date(Date.now() + 60_000),
        deleteOne: async () => { deleted = true; },
      };
      mock.method(registrationOtpModel, "findOne", async () => mockPending);

      const req = createMockReq({
        body: { email: "john@example.com", otp: "123456" },
      });
      const res = createMockRes();

      await verifyRegistrationOtp(req, res);

      assert.strictEqual(res.statusCode, 429);
      assert.strictEqual(deleted, true);
    });

    it("should increment attempts and reject on incorrect OTP", async () => {
      let saved = false;
      const otpHash = await bcrypt.hash("654321", 10);
      const mockPending = {
        attempts: 1,
        otpHash,
        expiresAt: new Date(Date.now() + 60_000),
        save: async () => { saved = true; },
        deleteOne: async () => {},
      };
      mock.method(registrationOtpModel, "findOne", async () => mockPending);

      const req = createMockReq({
        body: { email: "john@example.com", otp: "111111" },
      });
      const res = createMockRes();

      await verifyRegistrationOtp(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.data.message, "Incorrect verification code");
      assert.strictEqual(mockPending.attempts, 2);
      assert.strictEqual(saved, true);
    });

    it("should create user and return JWT on valid OTP", async () => {
      const validOtp = "789123";
      const otpHash = await bcrypt.hash(validOtp, 10);
      let pendingDeleted = false;
      const mockPending = {
        name: "Alice",
        passwordHash: "hashed_pass_xyz",
        otpHash,
        attempts: 0,
        expiresAt: new Date(Date.now() + 60_000),
        deleteOne: async () => { pendingDeleted = true; },
      };

      mock.method(registrationOtpModel, "findOne", async () => mockPending);
      mock.method(userModel, "exists", async () => null);
      mock.method(userModel, "create", async (data) => ({
        _id: "created_user_id",
        name: data.name,
        email: data.email,
        role: "user",
      }));

      const req = createMockReq({
        body: { email: "alice@example.com", otp: validOtp },
      });
      const res = createMockRes();

      await verifyRegistrationOtp(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.role, "user");
      assert.ok(res.data.token);
      assert.strictEqual(pendingDeleted, true);
    });
  });
});
