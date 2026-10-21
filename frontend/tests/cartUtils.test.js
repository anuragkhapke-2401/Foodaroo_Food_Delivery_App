import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateTotalCartAmount } from "../src/utils/cartUtils.js";

describe("Cart Utilities - calculateTotalCartAmount", () => {
  const sampleFoodList = [
    { _id: "f1", name: "Greek Salad", price: 12 },
    { _id: "f2", name: "Veg Rolls", price: 14 },
    { _id: "f3", name: "Garlic Noodles", price: 16 },
  ];

  it("should return 0 when cart is empty", () => {
    const total = calculateTotalCartAmount({}, sampleFoodList);
    assert.strictEqual(total, 0);
  });

  it("should calculate correct total for multiple items in cart", () => {
    const cartItems = {
      f1: 2, // 2 * 12 = 24
      f3: 1, // 1 * 16 = 16
    };
    const total = calculateTotalCartAmount(cartItems, sampleFoodList);
    assert.strictEqual(total, 40);
  });

  it("should ignore items with quantity 0 or negative", () => {
    const cartItems = {
      f1: 1,  // 12
      f2: 0,  // ignored
      f3: -1, // ignored
    };
    const total = calculateTotalCartAmount(cartItems, sampleFoodList);
    assert.strictEqual(total, 12);
  });

  it("should ignore items not present in the food list", () => {
    const cartItems = {
      f1: 1,
      nonexistent_id: 3,
    };
    const total = calculateTotalCartAmount(cartItems, sampleFoodList);
    assert.strictEqual(total, 12);
  });

  it("should handle default / empty parameters safely", () => {
    assert.strictEqual(calculateTotalCartAmount(), 0);
    assert.strictEqual(calculateTotalCartAmount(null, null), 0);
  });
});
