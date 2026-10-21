import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import authMiddleware from "../middleware/auth.js";
import { createMockReq, createMockRes } from "./helpers.js";

describe("Auth Middleware", () => {
  const originalSecret = process.env.JWT_SECRET;
  const testSecret = "test_jwt_secret_12345";

  before(() => {
    process.env.JWT_SECRET = testSecret;
  });

  after(() => {
    process.env.JWT_SECRET = originalSecret;
  });

  it("should return not authorized error when token header is missing", async () => {
    const req = createMockReq({ headers: {} });
    const res = createMockRes();
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    await authMiddleware(req, res, next);

    assert.strictEqual(nextCalled, false);
    assert.deepStrictEqual(res.data, {
      success: false,
      message: "Not Authorized Login Again",
    });
  });

  it("should return error when token is invalid or expired", async () => {
    const origLog = console.log;
    console.log = () => {};
    try {
      const req = createMockReq({
        headers: { token: "invalid.token.signature" },
      });
      const res = createMockRes();
      let nextCalled = false;
      const next = () => { nextCalled = true; };

      await authMiddleware(req, res, next);

      assert.strictEqual(nextCalled, false);
      assert.deepStrictEqual(res.data, {
        success: false,
        message: "Error",
      });
    } finally {
      console.log = origLog;
    }
  });

  it("should attach decoded userId and call next() on valid token", async () => {
    const userId = "user123_test_id";
    const validToken = jwt.sign({ id: userId }, testSecret);

    const req = createMockReq({
      headers: { token: validToken },
      body: {},
    });
    const res = createMockRes();
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    await authMiddleware(req, res, next);

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.body.userId, userId);
  });
});
