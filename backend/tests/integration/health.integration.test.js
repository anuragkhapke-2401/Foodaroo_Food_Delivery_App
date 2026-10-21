import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { startTestServer } from "./testServer.js";

describe("Integration: Health & Core Routing", () => {
  let testServer;

  before(async () => {
    testServer = await startTestServer();
  });

  after(async () => {
    if (testServer) await testServer.close();
  });

  it("GET / returns 200 with 'API Working'", async () => {
    const res = await testServer.request("/");
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data, "API Working");
  });

  it("GET non-existent endpoint returns 404", async () => {
    const res = await testServer.request("/api/unknown-route");
    assert.strictEqual(res.status, 404);
  });
});
