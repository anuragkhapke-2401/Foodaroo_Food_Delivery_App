import { describe, it, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";
import { addFood, listFood, removeFood } from "../controllers/foodController.js";
import { createMockReq, createMockRes } from "./helpers.js";

describe("Food Controller", () => {
  let originalConsoleLog;

  beforeEach(() => {
    originalConsoleLog = console.log;
    console.log = () => {};
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    mock.reset();
  });

  describe("addFood", () => {
    it("should reject if user is not admin", async () => {
      mock.method(userModel, "findById", async () => ({ role: "user" }));

      const req = createMockReq({
        body: { userId: "user123", name: "Pizza", price: 12 },
      });
      const res = createMockRes();

      await addFood(req, res);

      assert.deepStrictEqual(res.data, {
        success: false,
        message: "You are not admin",
      });
    });

    it("should allow admin to add food item", async () => {
      mock.method(userModel, "findById", async () => ({ role: "admin" }));
      mock.method(fs.promises, "writeFile", async () => {});
      mock.method(foodModel.prototype, "save", async function () {
        return this;
      });

      const req = createMockReq({
        body: {
          userId: "admin123",
          name: "Veggie Salad",
          description: "Fresh and crisp greens",
          price: 9.99,
          category: "Salad",
        },
        file: {
          originalname: "salad.png",
          buffer: Buffer.from("fake-image-bytes"),
          mimetype: "image/png",
        },
      });
      const res = createMockRes();

      await addFood(req, res);

      assert.deepStrictEqual(res.data, {
        success: true,
        message: "Food Added",
      });
    });

    it("should handle error when DB save fails", async () => {
      mock.method(userModel, "findById", async () => ({ role: "admin" }));
      mock.method(fs.promises, "writeFile", async () => {});
      mock.method(foodModel.prototype, "save", async () => {
        throw new Error("Save error");
      });

      const req = createMockReq({
        body: { userId: "admin123", name: "Pasta" },
        file: {
          originalname: "pasta.png",
          buffer: Buffer.from("image"),
        },
      });
      const res = createMockRes();

      await addFood(req, res);

      assert.deepStrictEqual(res.data, {
        success: false,
        message: "Error",
      });
    });
  });

  describe("listFood", () => {
    it("should return food list from database", async () => {
      const mockFoods = [
        { _id: "f1", name: "Burger", price: 8.5 },
        { _id: "f2", name: "Fries", price: 3.5 },
      ];
      mock.method(foodModel, "find", async () => mockFoods);

      const req = createMockReq();
      const res = createMockRes();

      await listFood(req, res);

      assert.strictEqual(res.data.success, true);
      assert.deepStrictEqual(res.data.data, mockFoods);
    });

    it("should return error if query fails", async () => {
      mock.method(foodModel, "find", async () => {
        throw new Error("Find error");
      });

      const req = createMockReq();
      const res = createMockRes();

      await listFood(req, res);

      assert.deepStrictEqual(res.data, {
        success: false,
        message: "Error",
      });
    });
  });

  describe("removeFood", () => {
    it("should reject if user is not admin", async () => {
      mock.method(userModel, "findById", async () => ({ role: "user" }));

      const req = createMockReq({
        body: { userId: "user123", id: "food123" },
      });
      const res = createMockRes();

      await removeFood(req, res);

      assert.deepStrictEqual(res.data, {
        success: false,
        message: "You are not admin",
      });
    });

    it("should allow admin to delete food item and unlink image", async () => {
      mock.method(userModel, "findById", async () => ({ role: "admin" }));
      mock.method(foodModel, "findById", async () => ({
        _id: "food123",
        image: "salad123.png",
      }));
      mock.method(fs.promises, "unlink", async () => {});
      let deletedId = null;
      mock.method(foodModel, "findByIdAndDelete", async (id) => {
        deletedId = id;
        return true;
      });

      const req = createMockReq({
        body: { userId: "admin123", id: "food123" },
      });
      const res = createMockRes();

      await removeFood(req, res);

      assert.strictEqual(deletedId, "food123");
      assert.deepStrictEqual(res.data, {
        success: true,
        message: "Food Removed",
      });
    });
  });
});
