import { describe, it, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import userModel from "../models/userModel.js";
import { addToCart, removeFromCart, getCart } from "../controllers/cartController.js";
import { createMockReq, createMockRes } from "./helpers.js";

describe("Cart Controller", () => {
  let originalConsoleLog;

  beforeEach(() => {
    originalConsoleLog = console.log;
    console.log = () => {};
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    mock.reset();
  });

  describe("addToCart", () => {
    it("should set count to 1 if item is not in cart", async () => {
      const mockUser = {
        _id: "user123",
        cartData: {},
      };

      let updatedData = null;
      mock.method(userModel, "findById", async () => mockUser);
      mock.method(userModel, "findByIdAndUpdate", async (_id, update) => {
        updatedData = update;
        return true;
      });

      const req = createMockReq({
        body: { userId: "user123", itemId: "item_apple" },
      });
      const res = createMockRes();

      await addToCart(req, res);

      assert.deepStrictEqual(res.data, {
        success: true,
        message: "Added to Cart",
      });
      assert.deepStrictEqual(updatedData, {
        cartData: { item_apple: 1 },
      });
    });

    it("should increment quantity if item is already in cart", async () => {
      const mockUser = {
        _id: "user123",
        cartData: { item_apple: 2 },
      };

      let updatedData = null;
      mock.method(userModel, "findById", async () => mockUser);
      mock.method(userModel, "findByIdAndUpdate", async (_id, update) => {
        updatedData = update;
        return true;
      });

      const req = createMockReq({
        body: { userId: "user123", itemId: "item_apple" },
      });
      const res = createMockRes();

      await addToCart(req, res);

      assert.deepStrictEqual(res.data, {
        success: true,
        message: "Added to Cart",
      });
      assert.deepStrictEqual(updatedData, {
        cartData: { item_apple: 3 },
      });
    });

    it("should return error if database query fails", async () => {
      mock.method(userModel, "findById", async () => {
        throw new Error("DB Connection Error");
      });

      const req = createMockReq({
        body: { userId: "user123", itemId: "item_apple" },
      });
      const res = createMockRes();

      await addToCart(req, res);

      assert.deepStrictEqual(res.data, {
        success: false,
        message: "Error",
      });
    });
  });

  describe("removeFromCart", () => {
    it("should decrement quantity if item count is greater than 1", async () => {
      const mockUser = {
        _id: "user123",
        cartData: { item_apple: 3, item_banana: 1 },
      };

      let updatedData = null;
      mock.method(userModel, "findById", async () => mockUser);
      mock.method(userModel, "findByIdAndUpdate", async (_id, update) => {
        updatedData = update;
        return true;
      });

      const req = createMockReq({
        body: { userId: "user123", itemId: "item_apple" },
      });
      const res = createMockRes();

      await removeFromCart(req, res);

      assert.deepStrictEqual(res.data, {
        success: true,
        message: "Removed from Cart",
      });
      assert.deepStrictEqual(updatedData, {
        cartData: { item_apple: 2, item_banana: 1 },
      });
    });

    it("should delete item from cartData if quantity is 1", async () => {
      const mockUser = {
        _id: "user123",
        cartData: { item_apple: 1, item_banana: 2 },
      };

      let updatedData = null;
      mock.method(userModel, "findById", async () => mockUser);
      mock.method(userModel, "findByIdAndUpdate", async (_id, update) => {
        updatedData = update;
        return true;
      });

      const req = createMockReq({
        body: { userId: "user123", itemId: "item_apple" },
      });
      const res = createMockRes();

      await removeFromCart(req, res);

      assert.deepStrictEqual(res.data, {
        success: true,
        message: "Removed from Cart",
      });
      assert.deepStrictEqual(updatedData, {
        cartData: { item_banana: 2 },
      });
      assert.strictEqual("item_apple" in updatedData.cartData, false);
    });
  });

  describe("getCart", () => {
    it("should return user's cartData", async () => {
      const mockUser = {
        _id: "user123",
        cartData: { item_apple: 2, item_orange: 5 },
      };

      mock.method(userModel, "findById", async () => mockUser);

      const req = createMockReq({
        body: { userId: "user123" },
      });
      const res = createMockRes();

      await getCart(req, res);

      assert.deepStrictEqual(res.data, {
        success: true,
        cartData: { item_apple: 2, item_orange: 5 },
      });
    });
  });
});
