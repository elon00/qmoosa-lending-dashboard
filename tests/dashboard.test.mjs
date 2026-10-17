import { test } from "node:test";
import assert from "node:assert/strict";
import { DashboardStore } from "../dist/index.js";

test("1. Initial state has default markets and disconnected wallet", () => {
  const store = new DashboardStore();
  const state = store.getState();

  assert.equal(state.connectedWallet, null);
  assert.equal(state.markets.length, 2);
  assert.equal(state.markets[0].symbol, "ETH");
  assert.equal(state.markets[1].symbol, "USDC");
  assert.equal(store.getHealthStatus(), "SAFE");
});

test("2. Wallet connection and disconnection updates state", () => {
  const store = new DashboardStore();
  store.connectWallet("0x1111222233334444555566667777888899990000");

  assert.equal(store.getState().connectedWallet, "0x1111222233334444555566667777888899990000");

  store.disconnectWallet();
  assert.equal(store.getState().connectedWallet, null);
});

test("3. Health status transitions accurately according to HF threshold", () => {
  const store = new DashboardStore();

  // Safe (> 1.6)
  store.updateAccountTelemetry(10_000n, 4_000n, 20_000);
  assert.equal(store.getHealthStatus(), "SAFE");

  // Moderate (1.2 - 1.6)
  store.updateAccountTelemetry(10_000n, 6_000n, 13_333);
  assert.equal(store.getHealthStatus(), "MODERATE");

  // Critical (1.0 - 1.2)
  store.updateAccountTelemetry(10_000n, 7_500n, 10_666);
  assert.equal(store.getHealthStatus(), "CRITICAL");

  // Liquidatable (< 1.0)
  store.updateAccountTelemetry(10_000n, 8_500n, 9_411);
  assert.equal(store.getHealthStatus(), "LIQUIDATABLE");
});
