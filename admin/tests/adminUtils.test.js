import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatCustomerName,
  formatOrderItemsSummary,
  formatFullAddress,
  validateDishForm,
  isValidOrderStatus,
  ALLOWED_CATEGORIES,
} from "../src/utils/adminUtils.js";

describe("Admin Utilities", () => {
  describe("formatCustomerName", () => {
    it("should format first and last name properly", () => {
      const address = { firstName: "Bruce", lastName: "Wayne" };
      assert.strictEqual(formatCustomerName(address), "Bruce Wayne");
    });

    it("should handle missing lastName or extra whitespace", () => {
      assert.strictEqual(formatCustomerName({ firstName: " Clark " }), "Clark");
      assert.strictEqual(formatCustomerName({}), "");
      assert.strictEqual(formatCustomerName(null), "");
    });
  });

  describe("formatOrderItemsSummary", () => {
    it("should format single item correctly", () => {
      const items = [{ name: "Veg Salad", quantity: 2 }];
      assert.strictEqual(formatOrderItemsSummary(items), "Veg Salad x 2");
    });

    it("should format multiple items separated by comma", () => {
      const items = [
        { name: "Veg Salad", quantity: 2 },
        { name: "Pasta", quantity: 1 },
      ];
      assert.strictEqual(formatOrderItemsSummary(items), "Veg Salad x 2, Pasta x 1");
    });

    it("should handle empty or null items gracefully", () => {
      assert.strictEqual(formatOrderItemsSummary([]), "");
      assert.strictEqual(formatOrderItemsSummary(null), "");
    });
  });

  describe("formatFullAddress", () => {
    it("should format full address joined by comma", () => {
      const address = {
        street: "123 Main St",
        city: "Metropolis",
        state: "NY",
        country: "USA",
        zipcode: "10001",
      };
      assert.strictEqual(
        formatFullAddress(address),
        "123 Main St, Metropolis, NY, USA, 10001"
      );
    });

    it("should filter out undefined or missing parts", () => {
      const address = { street: "123 Main St", city: "Metropolis" };
      assert.strictEqual(formatFullAddress(address), "123 Main St, Metropolis");
    });
  });

  describe("validateDishForm", () => {
    it("should accept valid dish form data with image", () => {
      const data = {
        name: "Caesar Salad",
        description: "Fresh romaine with parmesan",
        price: "12.50",
        category: "Salad",
      };
      const mockImage = { name: "salad.jpg" };

      const result = validateDishForm(data, mockImage);
      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.errors.length, 0);
    });

    it("should reject missing name or empty description", () => {
      const data = {
        name: "   ",
        description: "",
        price: "10",
        category: "Salad",
      };
      const result = validateDishForm(data, { name: "pic.png" });
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.includes("Dish name is required"));
      assert.ok(result.errors.includes("Dish description is required"));
    });

    it("should reject non-positive or invalid price", () => {
      const data = {
        name: "Soup",
        description: "Hot soup",
        price: "-5",
        category: "Pure Veg",
      };
      const result = validateDishForm(data, { name: "soup.png" });
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.some((e) => e.includes("Price must be a valid number")));
    });

    it("should reject invalid category not in allowed list", () => {
      const data = {
        name: "Burger",
        description: "Delicious burger",
        price: "15",
        category: "FastFood", // Not allowed
      };
      const result = validateDishForm(data, { name: "burger.png" });
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.some((e) => e.includes("Category must be one of")));
    });

    it("should reject missing image file", () => {
      const data = {
        name: "Rolls",
        description: "Tasty rolls",
        price: "8",
        category: "Rolls",
      };
      const result = validateDishForm(data, null);
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.includes("Dish image is required"));
    });
  });

  describe("isValidOrderStatus", () => {
    it("should validate allowed order statuses", () => {
      assert.strictEqual(isValidOrderStatus("Food Processing"), true);
      assert.strictEqual(isValidOrderStatus("Out for delivery"), true);
      assert.strictEqual(isValidOrderStatus("Delivered"), true);
    });

    it("should reject invalid order status", () => {
      assert.strictEqual(isValidOrderStatus("Cancelled"), false);
      assert.strictEqual(isValidOrderStatus("Unknown"), false);
      assert.strictEqual(isValidOrderStatus(""), false);
    });
  });
});
