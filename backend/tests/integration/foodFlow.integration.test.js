import { describe, it, before, after, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import userModel from "../../models/userModel.js";
import foodModel from "../../models/foodModel.js";
import fs from "fs";
import { startTestServer } from "./testServer.js";

describe("Integration: Food Catalog & Admin Flow", () => {
  let testServer;
  const testSecret = "food_integration_secret";
  const regularUserId = "user_regular_456";
  const adminUserId = "admin_super_789";
  let userToken;
  let adminToken;
  let originalSecret;
  let originalConsoleLog;

  before(async () => {
    originalSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = testSecret;
    userToken = jwt.sign({ id: regularUserId }, testSecret);
    adminToken = jwt.sign({ id: adminUserId }, testSecret);
    testServer = await startTestServer();
  });

  after(async () => {
    process.env.JWT_SECRET = originalSecret;
    if (testServer) await testServer.close();
  });

  beforeEach(() => {
    originalConsoleLog = console.log;
    console.log = () => {};
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    mock.reset();
  });

  it("Public user can GET /api/food/list without auth token", async () => {
    const mockCatalog = [
      { _id: "f_salad", name: "Greek Salad", price: 12, category: "Salad" },
      { _id: "f_pasta", name: "Tomato Pasta", price: 14, category: "Pasta" },
    ];
    mock.method(foodModel, "find", async () => mockCatalog);

    const res = await testServer.request("/api/food/list");

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.deepStrictEqual(res.data.data, mockCatalog);
  });

  it("Regular user is blocked when attempting to remove food", async () => {
    mock.method(userModel, "findById", async () => ({
      _id: regularUserId,
      role: "user",
    }));

    const res = await testServer.request("/api/food/remove", {
      method: "POST",
      headers: { token: userToken },
      body: { id: "f_salad" },
    });

    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(res.data, {
      success: false,
      message: "You are not admin",
    });
  });

  it("Admin user can successfully remove food item", async () => {
    mock.method(userModel, "findById", async () => ({
      _id: adminUserId,
      role: "admin",
    }));
    mock.method(foodModel, "findById", async () => ({
      _id: "f_salad",
      image: "salad.jpg",
    }));
    mock.method(fs.promises, "unlink", async () => {});
    let deletedId = null;
    mock.method(foodModel, "findByIdAndDelete", async (id) => {
      deletedId = id;
      return true;
    });

    const res = await testServer.request("/api/food/remove", {
      method: "POST",
      headers: { token: adminToken },
      body: { id: "f_salad" },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(deletedId, "f_salad");
    assert.deepStrictEqual(res.data, {
      success: true,
      message: "Food Removed",
    });
  });
});
