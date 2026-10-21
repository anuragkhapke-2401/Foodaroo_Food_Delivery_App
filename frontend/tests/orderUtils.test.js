import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildOrderPayload,
  calculateOrderMetrics,
  validateDeliveryAddress,
} from "../src/utils/orderUtils.js";

describe("Frontend Order Utilities", () => {
  const sampleFoodList = [
    { _id: "f1", name: "Greek Salad", price: 12 },
    { _id: "f2", name: "Veg Rolls", price: 14 },
    { _id: "f3", name: "Garlic Noodles", price: 16 },
  ];

  describe("buildOrderPayload", () => {
    it("should assemble order items with quantities and delivery fee", () => {
      const address = { street: "123 Main St", city: "NYC" };
      const cartItems = { f1: 2, f2: 1 };
      const cartTotal = 38; // (2 * 12) + 14

      const payload = buildOrderPayload(address, cartItems, sampleFoodList, cartTotal);

      assert.deepStrictEqual(payload.address, address);
      assert.strictEqual(payload.items.length, 2);
      assert.strictEqual(payload.items[0]._id, "f1");
      assert.strictEqual(payload.items[0].quantity, 2);
      assert.strictEqual(payload.amount, 40); // 38 + 2
    });

    it("should omit items with quantity 0 or not in cart", () => {
      const payload = buildOrderPayload({}, { f1: 0, f2: 0 }, sampleFoodList, 0);
      assert.strictEqual(payload.items.length, 0);
      assert.strictEqual(payload.amount, 0);
    });
  });

  describe("calculateOrderMetrics", () => {
    it("should calculate correct total count and amounts for active cart", () => {
      const cartItems = { f1: 2, f2: 3 };
      const metrics = calculateOrderMetrics(cartItems, 50);

      assert.strictEqual(metrics.itemCount, 5);
      assert.strictEqual(metrics.subtotal, 50);
      assert.strictEqual(metrics.deliveryFee, 2);
      assert.strictEqual(metrics.total, 52);
    });

    it("should return free delivery and 0 total when subtotal is 0", () => {
      const metrics = calculateOrderMetrics({}, 0);

      assert.strictEqual(metrics.itemCount, 0);
      assert.strictEqual(metrics.subtotal, 0);
      assert.strictEqual(metrics.deliveryFee, 0);
      assert.strictEqual(metrics.total, 0);
    });
  });

  describe("validateDeliveryAddress", () => {
    const validAddress = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      street: "742 Evergreen Terrace",
      city: "Springfield",
      state: "OR",
      zipcode: "97477",
      country: "USA",
      phone: "+15551234567",
    };

    it("should validate complete delivery address", () => {
      const result = validateDeliveryAddress(validAddress);
      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.errors.length, 0);
    });

    it("should identify missing required fields", () => {
      const incomplete = { firstName: "John" };
      const result = validateDeliveryAddress(incomplete);

      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.some((e) => e.includes("Missing required fields")));
    });

    it("should reject invalid email format", () => {
      const invalidEmail = { ...validAddress, email: "invalid-email-string" };
      const result = validateDeliveryAddress(invalidEmail);

      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.includes("Invalid email address format"));
    });
  });
});
