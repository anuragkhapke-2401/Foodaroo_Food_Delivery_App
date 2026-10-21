import { describe, it, before, after, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import Stripe from "stripe";
import userModel from "../../models/userModel.js";
import orderModel from "../../models/orderModel.js";
import { startTestServer } from "./testServer.js";

describe("Integration: Order & Stripe Flow", () => {
  let testServer;
  const testSecret = "order_integration_secret";
  const userId = "customer_999";
  const adminId = "admin_master_1";
  let userToken;
  let adminToken;
  let originalSecret;
  let originalStripeKey;
  let originalConsoleLog;

  before(async () => {
    originalSecret = process.env.JWT_SECRET;
    originalStripeKey = process.env.STRIPE_SECRET_KEY;
    process.env.JWT_SECRET = testSecret;
    process.env.STRIPE_SECRET_KEY = "sk_test_fake_key";

    userToken = jwt.sign({ id: userId }, testSecret);
    adminToken = jwt.sign({ id: adminId }, testSecret);
    testServer = await startTestServer();
  });

  after(async () => {
    process.env.JWT_SECRET = originalSecret;
    process.env.STRIPE_SECRET_KEY = originalStripeKey;
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

  it("Customer places order -> clears cart -> receives Stripe checkout URL", async () => {
    let orderSaved = null;
    let cartCleared = null;

    mock.method(orderModel.prototype, "save", async function () {
      this._id = "order_created_123";
      orderSaved = this;
      return this;
    });

    mock.method(userModel, "findByIdAndUpdate", async (id, update) => {
      cartCleared = update;
      return true;
    });

    const stripeProto = Object.getPrototypeOf(new Stripe("sk_test").checkout.sessions);
    mock.method(stripeProto, "create", async () => ({
      url: "https://checkout.stripe.com/pay/session_integ_test",
    }));

    const res = await testServer.request("/api/order/place", {
      method: "POST",
      headers: { token: userToken },
      body: {
        userId,
        items: [{ name: "Rolls", price: 10, quantity: 2 }],
        amount: 22,
        address: { firstName: "John", lastName: "Doe", street: "Main St" },
      },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(
      res.data.session_url,
      "https://checkout.stripe.com/pay/session_integ_test"
    );
    assert.ok(orderSaved);
    assert.deepStrictEqual(cartCleared, { cartData: {} });
  });

  it("User orders can be queried via /api/order/userorders", async () => {
    const userOrdersList = [
      { _id: "ord_1", userId, amount: 25, status: "Food Processing" },
    ];
    mock.method(orderModel, "find", async (filter) => {
      if (filter.userId === userId) return userOrdersList;
      return [];
    });

    const res = await testServer.request("/api/order/userorders", {
      method: "POST",
      headers: { token: userToken },
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.deepStrictEqual(res.data.data, userOrdersList);
  });

  it("POST /api/order/verify marks order as paid on success", async () => {
    let updatedOrder = null;
    mock.method(orderModel, "findByIdAndUpdate", async (id, update) => {
      updatedOrder = { id, update };
      return true;
    });

    const res = await testServer.request("/api/order/verify", {
      method: "POST",
      body: { orderId: "ord_1", success: "true" },
    });

    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(res.data, { success: true, message: "Paid" });
    assert.deepStrictEqual(updatedOrder, { id: "ord_1", update: { payment: true } });
  });

  it("Admin can list all orders and update fulfillment status", async () => {
    mock.method(userModel, "findById", async () => ({
      _id: adminId,
      role: "admin",
    }));

    const allOrders = [
      { _id: "ord_1", status: "Food Processing", amount: 25 },
      { _id: "ord_2", status: "Delivered", amount: 40 },
    ];
    mock.method(orderModel, "find", async () => allOrders);

    // Step 1: Admin lists all orders
    const listRes = await testServer.request("/api/order/list", {
      headers: { token: adminToken },
    });

    assert.strictEqual(listRes.status, 200);
    assert.strictEqual(listRes.data.success, true);
    assert.deepStrictEqual(listRes.data.data, allOrders);

    // Step 2: Admin updates order status
    let statusUpdate = null;
    mock.method(orderModel, "findByIdAndUpdate", async (id, update) => {
      statusUpdate = { id, update };
      return true;
    });

    const updateRes = await testServer.request("/api/order/status", {
      method: "POST",
      headers: { token: adminToken },
      body: { orderId: "ord_1", status: "Out for delivery" },
    });

    assert.strictEqual(updateRes.status, 200);
    assert.deepStrictEqual(updateRes.data, {
      success: true,
      message: "Status Updated Successfully",
    });
    assert.deepStrictEqual(statusUpdate, {
      id: "ord_1",
      update: { status: "Out for delivery" },
    });
  });
});
