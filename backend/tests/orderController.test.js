import { describe, it, before, after, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import Stripe from "stripe";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import {
  placeOrder,
  verifyOrder,
  userOrders,
  listOrders,
  updateStatus,
} from "../controllers/orderController.js";
import { createMockReq, createMockRes } from "./helpers.js";

describe("Order Controller", () => {
  let originalConsoleLog;
  const originalStripeKey = process.env.STRIPE_SECRET_KEY;

  before(() => {
    process.env.STRIPE_SECRET_KEY = "sk_test_fake_key";
  });

  after(() => {
    process.env.STRIPE_SECRET_KEY = originalStripeKey;
  });

  beforeEach(() => {
    originalConsoleLog = console.log;
    console.log = () => {};
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    mock.reset();
  });

  describe("placeOrder", () => {
    it("should save order, clear user cart, and return stripe session url", async () => {
      let savedOrder = null;
      let cartUpdated = null;
      let stripeParams = null;

      mock.method(orderModel.prototype, "save", async function () {
        savedOrder = this;
        return this;
      });

      mock.method(userModel, "findByIdAndUpdate", async (id, update) => {
        cartUpdated = update;
        return true;
      });

      const stripeProto = Object.getPrototypeOf(new Stripe("sk_test").checkout.sessions);
      mock.method(stripeProto, "create", async (params) => {
        stripeParams = params;
        return { url: "https://checkout.stripe.com/session_test_123" };
      });

      const req = createMockReq({
        body: {
          userId: "user_order_1",
          items: [
            { name: "Pasta", price: 15, quantity: 2 },
            { name: "Coke", price: 2.5, quantity: 1 },
          ],
          amount: 34.5,
          address: { street: "123 Main St", city: "Metro", zip: "10001" },
        },
      });
      const res = createMockRes();

      await placeOrder(req, res);

      assert.strictEqual(res.data.success, true);
      assert.strictEqual(
        res.data.session_url,
        "https://checkout.stripe.com/session_test_123"
      );
      assert.deepStrictEqual(cartUpdated, { cartData: {} });
      assert.ok(savedOrder);
      // Verify line items include items + $2 delivery charges
      assert.strictEqual(stripeParams.line_items.length, 3);
      assert.strictEqual(stripeParams.line_items[0].price_data.unit_amount, 1500);
      assert.strictEqual(stripeParams.line_items[2].price_data.unit_amount, 200); // Delivery charges
    });

    it("should handle error gracefully when placeOrder fails", async () => {
      mock.method(orderModel.prototype, "save", async () => {
        throw new Error("Order creation failed");
      });

      const req = createMockReq({
        body: { userId: "user_order_1", items: [], amount: 10, address: {} },
      });
      const res = createMockRes();

      await placeOrder(req, res);

      assert.deepStrictEqual(res.data, {
        success: false,
        message: "Error",
      });
    });
  });

  describe("verifyOrder", () => {
    it("should mark order as paid when success is 'true'", async () => {
      let updatedStatus = null;
      mock.method(orderModel, "findByIdAndUpdate", async (id, update) => {
        updatedStatus = { id, update };
        return true;
      });

      const req = createMockReq({
        body: { orderId: "ord_123", success: "true" },
      });
      const res = createMockRes();

      await verifyOrder(req, res);

      assert.deepStrictEqual(res.data, {
        success: true,
        message: "Paid",
      });
      assert.strictEqual(updatedStatus.id, "ord_123");
      assert.deepStrictEqual(updatedStatus.update, { payment: true });
    });

    it("should delete order when success is 'false'", async () => {
      let deletedId = null;
      mock.method(orderModel, "findByIdAndDelete", async (id) => {
        deletedId = id;
        return true;
      });

      const req = createMockReq({
        body: { orderId: "ord_failed_456", success: "false" },
      });
      const res = createMockRes();

      await verifyOrder(req, res);

      assert.deepStrictEqual(res.data, {
        success: false,
        message: "Not Paid",
      });
      assert.strictEqual(deletedId, "ord_failed_456");
    });
  });

  describe("userOrders", () => {
    it("should return orders for specific user", async () => {
      const mockOrders = [
        { _id: "ord_1", userId: "user_abc", amount: 25 },
        { _id: "ord_2", userId: "user_abc", amount: 40 },
      ];
      mock.method(orderModel, "find", async (filter) => {
        if (filter.userId === "user_abc") return mockOrders;
        return [];
      });

      const req = createMockReq({
        body: { userId: "user_abc" },
      });
      const res = createMockRes();

      await userOrders(req, res);

      assert.deepStrictEqual(res.data, {
        success: true,
        data: mockOrders,
      });
    });
  });

  describe("listOrders", () => {
    it("should reject non-admin users", async () => {
      mock.method(userModel, "findById", async () => ({ role: "user" }));

      const req = createMockReq({
        body: { userId: "user_regular" },
      });
      const res = createMockRes();

      await listOrders(req, res);

      assert.deepStrictEqual(res.data, {
        success: false,
        message: "You are not admin",
      });
    });

    it("should return all orders for admin user", async () => {
      mock.method(userModel, "findById", async () => ({ role: "admin" }));
      const allOrders = [
        { _id: "ord_1", amount: 20 },
        { _id: "ord_2", amount: 50 },
      ];
      mock.method(orderModel, "find", async () => allOrders);

      const req = createMockReq({
        body: { userId: "admin_user" },
      });
      const res = createMockRes();

      await listOrders(req, res);

      assert.deepStrictEqual(res.data, {
        success: true,
        data: allOrders,
      });
    });
  });

  describe("updateStatus", () => {
    it("should reject non-admin users", async () => {
      mock.method(userModel, "findById", async () => ({ role: "user" }));

      const req = createMockReq({
        body: { userId: "user_regular", orderId: "ord_1", status: "Delivered" },
      });
      const res = createMockRes();

      await updateStatus(req, res);

      assert.deepStrictEqual(res.data, {
        success: false,
        message: "You are not an admin",
      });
    });

    it("should update status for admin user", async () => {
      mock.method(userModel, "findById", async () => ({ role: "admin" }));
      let updateArgs = null;
      mock.method(orderModel, "findByIdAndUpdate", async (id, update) => {
        updateArgs = { id, update };
        return true;
      });

      const req = createMockReq({
        body: { userId: "admin_user", orderId: "ord_1", status: "Out for delivery" },
      });
      const res = createMockRes();

      await updateStatus(req, res);

      assert.deepStrictEqual(res.data, {
        success: true,
        message: "Status Updated Successfully",
      });
      assert.deepStrictEqual(updateArgs, {
        id: "ord_1",
        update: { status: "Out for delivery" },
      });
    });
  });
});
