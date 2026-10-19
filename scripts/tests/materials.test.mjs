// Chạy: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { checkReserve, effectiveStatus, holdExpiresAt, lotValue, timeLeft, withEffectiveStatus } from "../../src/lib/materials.ts";

const now = new Date("2026-10-19T08:00:00Z");
const h = (n) => new Date(now.getTime() + n * 3_600_000);
const lot = (over = {}) => ({ id: "l", code: "LO-1", material: "Lon nhôm", weightKg: 280, pricePerKg: 26000, grade: "B", purity: 88, moisture: 2, inspector: "A", inspectedAt: now.toISOString(), warehouse: "Kho", area: "Quận 1", image: "", note: "", status: "san-sang", ...over });
const held = (expiresInH) => lot({ status: "dang-giu", reservation: { businessId: "b", businessName: "B", at: now.toISOString(), expiresAt: h(expiresInH).toISOString(), pickupAt: h(1).toISOString(), note: "" } });

test("giữ lô 48 giờ; quá hạn thì tự về đang bán và bỏ thông tin giữ", () => {
  assert.equal(holdExpiresAt(now), h(48).toISOString());
  assert.equal(effectiveStatus(held(5), now), "dang-giu");
  assert.equal(effectiveStatus(held(-1), now), "san-sang");
  assert.equal(withEffectiveStatus(held(-1), now).reservation, undefined);
  assert.equal(effectiveStatus(lot({ status: "da-ban" }), now), "da-ban");
});

test("giờ lấy hàng: sau ít nhất 2 giờ, trước khi hết hạn giữ; lô phải còn bán", () => {
  assert.equal(checkReserve(lot(), h(1), now), "pickup_too_soon");
  assert.equal(checkReserve(lot(), h(49), now), "pickup_after_hold");
  assert.equal(checkReserve(lot(), h(24), now), null);
  assert.equal(checkReserve(held(10), h(24), now), "not_available");
  assert.equal(checkReserve(held(-1), h(24), now), null);
});

test("giá trị lô và thời gian còn lại", () => {
  assert.equal(lotValue({ weightKg: 280, pricePerKg: 26000 }), 7_280_000);
  assert.equal(timeLeft(h(31.5).toISOString(), now), "31 giờ 30 phút");
  assert.equal(timeLeft(h(-2).toISOString(), now), "0 phút");
});
