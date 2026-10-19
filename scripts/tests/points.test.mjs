// Chạy: npm test  (Node ≥ 23 tự bỏ kiểu TypeScript khi import file .ts)
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applyDecision,
  balanceOf,
  canEarnToday,
  checkRedeem,
  makeRedeemCode,
  pendingOf,
  pointsFor,
  redemptionStatus,
} from "../../src/lib/points.ts";

const entry = (over = {}) => ({
  id: Math.random().toString(36),
  at: new Date().toISOString(),
  delta: 10,
  reason: "bin_dropoff",
  title: "x",
  status: "confirmed",
  ...over,
});

test("số dư chỉ tính mục đã ghi nhận, cả cộng lẫn trừ", () => {
  const list = [entry({ delta: 50 }), entry({ delta: -40, reason: "redeem" }), entry({ delta: 5, status: "pending" }), entry({ delta: 7, status: "rejected" })];
  assert.equal(balanceOf(list), 10);
  assert.equal(pendingOf(list), 5);
});

test("điểm theo kg làm tròn xuống, không âm", () => {
  const rule = { id: "r", reason: "home_pickup", activity: "", points: 2, unit: "kg", condition: "" };
  assert.equal(pointsFor(rule, 12.7), 25);
  assert.equal(pointsFor(rule, -3), 0);
});

test("giới hạn theo ngày không tính mục bị từ chối và mục của hôm khác", () => {
  const rule = { id: "bin-recycle", reason: "bin_dropoff", activity: "", points: 5, unit: "lần", condition: "", dailyCap: 3 };
  const yesterday = new Date(Date.now() - 86_400_000).toISOString();
  const match = (e) => e.reason === "bin_dropoff";
  const list = [entry(), entry({ status: "pending" }), entry({ status: "rejected" }), entry({ at: yesterday })];
  assert.equal(canEarnToday(list, rule, match), true);
  assert.equal(canEarnToday([...list, entry()], rule, match), false);
});

test("duyệt chỉ áp dụng cho mục đang chờ", () => {
  const p = entry({ status: "pending", delta: 5 });
  assert.equal(applyDecision(p, "confirmed", { delta: 8 }).delta, 8);
  assert.equal(applyDecision(p, "rejected", { note: "lẫn rác" }).status, "rejected");
  const done = entry({ status: "confirmed" });
  assert.equal(applyDecision(done, "rejected"), done);
});

test("đổi quà kiểm theo thứ tự: đăng nhập → còn hàng → đủ điểm", () => {
  assert.equal(checkRedeem({ loggedIn: false, stockLeft: 0, balance: 0, cost: 10 }), "not_logged_in");
  assert.equal(checkRedeem({ loggedIn: true, stockLeft: 0, balance: 0, cost: 10 }), "out_of_stock");
  assert.equal(checkRedeem({ loggedIn: true, stockLeft: 1, balance: 9, cost: 10 }), "not_enough_points");
  assert.equal(checkRedeem({ loggedIn: true, stockLeft: 1, balance: 10, cost: 10 }), null);
});

test("mã nhận quà đúng dạng và không có ký tự dễ nhầm", () => {
  for (let i = 0; i < 200; i++) assert.match(makeRedeemCode(), /^GC-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/);
});

test("quà quá hạn thành hết hạn lúc đọc", () => {
  const r = { id: "r", rewardId: "x", rewardName: "x", pointsSpent: 1, code: "GC-AAAA-AAAA", at: "2026-01-01T00:00:00Z", expiresAt: "2026-01-15T00:00:00Z", status: "ready" };
  assert.equal(redemptionStatus(r, new Date("2026-01-10")), "ready");
  assert.equal(redemptionStatus(r, new Date("2026-01-16")), "expired");
  assert.equal(redemptionStatus({ ...r, status: "collected" }, new Date("2026-02-01")), "collected");
});
