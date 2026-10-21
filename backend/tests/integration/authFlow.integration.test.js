import { describe, it, before, after, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../../models/userModel.js";
import { startTestServer } from "./testServer.js";

describe("Integration: Auth & Protected Routes Flow", () => {
  let testServer;
  const originalSecret = process.env.JWT_SECRET;
  const testSecret = "integration_test_jwt_secret";

  before(async () => {
    process.env.JWT_SECRET = testSecret;
    testServer = await startTestServer();
  });

  after(async () => {
    process.env.JWT_SECRET = originalSecret;
    if (testServer) await testServer.close();
  });

  afterEach(() => {
    mock.reset();
  });

  it("POST /api/user/login returns 401 for non-existent user", async () => {
    mock.method(userModel, "findOne", async () => null);

    const res = await testServer.request("/api/user/login", {
      method: "POST",
      body: { email: "missing@example.com", password: "Password123!" },
    });

    assert.strictEqual(res.status, 401);
    assert.deepStrictEqual(res.data, {
      success: false,
      message: "Invalid email or password",
    });
  });

  it("POST /api/user/login returns 401 for wrong password", async () => {
    const hashedPassword = await bcrypt.hash("CorrectPassword!", 10);
    mock.method(userModel, "findOne", async () => ({
      _id: "user_integ_1",
      email: "user@example.com",
      password: hashedPassword,
      role: "user",
    }));

    const res = await testServer.request("/api/user/login", {
      method: "POST",
      body: { email: "user@example.com", password: "WrongPassword!" },
    });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.success, false);
  });

  it("Full Auth Flow: Login -> Obtain Token -> Access Protected Cart Endpoint", async () => {
    const plainPassword = "SecretPassword123!";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const mockUser = {
      _id: "user_full_flow",
      email: "flow@example.com",
      password: hashedPassword,
      role: "user",
      cartData: { item_salad: 2 },
    };

    mock.method(userModel, "findOne", async () => mockUser);
    mock.method(userModel, "findById", async () => mockUser);

    // Step 1: Attempt accessing protected endpoint without token -> BLOCKED
    const unauthRes = await testServer.request("/api/cart/get", {
      method: "POST",
    });
    assert.deepStrictEqual(unauthRes.data, {
      success: false,
      message: "Not Authorized Login Again",
    });

    // Step 2: Attempt accessing with invalid token -> BLOCKED
    const origLog = console.log;
    console.log = () => {};
    let invalidRes;
    try {
      invalidRes = await testServer.request("/api/cart/get", {
        method: "POST",
        headers: { token: "invalid.jwt.token" },
      });
    } finally {
      console.log = origLog;
    }
    assert.deepStrictEqual(invalidRes.data, {
      success: false,
      message: "Error",
    });

    // Step 3: Perform login over HTTP
    const loginRes = await testServer.request("/api/user/login", {
      method: "POST",
      body: { email: "flow@example.com", password: plainPassword },
    });

    assert.strictEqual(loginRes.status, 200);
    assert.strictEqual(loginRes.data.success, true);
    assert.strictEqual(loginRes.data.role, "user");
    assert.ok(loginRes.data.token);

    const token = loginRes.data.token;

    // Step 4: Access protected route using the received token -> SUCCEEDS
    const authRes = await testServer.request("/api/cart/get", {
      method: "POST",
      headers: { token },
    });

    assert.strictEqual(authRes.status, 200);
    assert.strictEqual(authRes.data.success, true);
    assert.deepStrictEqual(authRes.data.cartData, { item_salad: 2 });
  });
});
