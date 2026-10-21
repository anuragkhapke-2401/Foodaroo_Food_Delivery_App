import { describe, it, before, after, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import userModel from "../../models/userModel.js";
import { startTestServer } from "./testServer.js";

describe("Integration: Cart Lifecycle Flow", () => {
  let testServer;
  const testSecret = "cart_integration_secret";
  const userId = "cart_user_123";
  let token;
  let originalSecret;
  let originalConsoleLog;

  before(async () => {
    originalSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = testSecret;
    token = jwt.sign({ id: userId }, testSecret);
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

  it("Full Cart Flow: Add item -> Retrieve cart -> Remove item", async () => {
    let storedCartData = {};

    mock.method(userModel, "findById", async () => ({
      _id: userId,
      cartData: storedCartData,
    }));

    mock.method(userModel, "findByIdAndUpdate", async (id, update) => {
      storedCartData = update.cartData;
      return true;
    });

    // Step 1: Add "food_item_1" to cart
    const addRes = await testServer.request("/api/cart/add", {
      method: "POST",
      headers: { token },
      body: { itemId: "food_item_1" },
    });

    assert.strictEqual(addRes.status, 200);
    assert.deepStrictEqual(addRes.data, {
      success: true,
      message: "Added to Cart",
    });
    assert.strictEqual(storedCartData.food_item_1, 1);

    // Step 2: Add "food_item_1" again (increment)
    const addSecondRes = await testServer.request("/api/cart/add", {
      method: "POST",
      headers: { token },
      body: { itemId: "food_item_1" },
    });
    assert.strictEqual(addSecondRes.data.success, true);
    assert.strictEqual(storedCartData.food_item_1, 2);

    // Step 3: Fetch cart over HTTP
    const getRes = await testServer.request("/api/cart/get", {
      method: "POST",
      headers: { token },
    });

    assert.strictEqual(getRes.status, 200);
    assert.strictEqual(getRes.data.success, true);
    assert.deepStrictEqual(getRes.data.cartData, { food_item_1: 2 });

    // Step 4: Remove "food_item_1" from cart
    const removeRes = await testServer.request("/api/cart/remove", {
      method: "POST",
      headers: { token },
      body: { itemId: "food_item_1" },
    });

    assert.strictEqual(removeRes.status, 200);
    assert.deepStrictEqual(removeRes.data, {
      success: true,
      message: "Removed from Cart",
    });
    assert.strictEqual(storedCartData.food_item_1, 1);
  });
});
