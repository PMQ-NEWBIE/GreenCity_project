// Chạy: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  assignTeam,
  cancel,
  canCancel,
  complete,
  pickupPoints,
  recordWeighing,
  startTrip,
  totalAmount,
  totalKg,
} from "../../src/lib/pickup.ts";

const RULES = [
  { id: "pickup-kg", reason: "home_pickup", activity: "", points: 2, unit: "kg", condition: "" },
  { id: "pickup-sorted", reason: "home_pickup", activity: "", points: 10, unit: "lần", condition: "" },
  { id: "pickup-cash-to-points", reason: "home_pickup", activity: "", points: 1, unit: "1.000đ", condition: "" },
];
const NOW = "2026-10-19T08:00:00.000Z";
const base = {
  id: "r1",
  ownerId: "a@b.vn",
  ownerName: "A",
  materials: ["Lon nhôm", "Chai nhựa PET"],
  quantity: "2 bao",
  area: "Quận 3",
  address: "Đường X",
  time: "Sáng",
  note: "",
  photos: [],
  presorted: true,
  createdAt: NOW,
  status: "cho-nhan",
  history: [{ status: "cho-nhan", at: NOW }],
};
const team = { id: "t", name: "Đội T", phoneMasked: "09xx" };
const lines = [
  { material: "Lon nhôm", kg: 2.4, pricePerKg: 25000 },
  { material: "Chai nhựa PET", kg: 6.5, pricePerKg: 5000 },
];

test("đi đủ 5 bước, lịch sử ghi đúng thứ tự", () => {
  let r = assignTeam(base, team, NOW, NOW);
  r = startTrip(r, NOW);
  r = recordWeighing(r, lines, true, NOW);
  const { request, points } = complete(r, "tien-mat", RULES, NOW);
  assert.deepEqual(request.history.map((h) => h.status), ["cho-nhan", "da-nhan", "dang-den", "da-can", "hoan-tat"]);
  assert.equal(request.payout.amount, 92500);
  assert.deepEqual(points, { kg: 17, sorted: 10, cash: 0 });
  assert.equal(request.payout.points, 27);
});

test("không nhảy cóc trạng thái", () => {
  assert.throws(() => startTrip(base, NOW));
  assert.throws(() => recordWeighing(base, lines, true, NOW));
  assert.throws(() => complete(base, "tien-mat", RULES, NOW));
});

test("chỉ hủy được trước khi đội lên đường", () => {
  assert.equal(canCancel("cho-nhan"), true);
  assert.equal(canCancel("da-nhan"), true);
  assert.equal(canCancel("dang-den"), false);
  const r = cancel(base, "Gửi nhầm", NOW);
  assert.equal(r.status, "da-huy");
  assert.equal(r.cancelReason, "Gửi nhầm");
  const going = startTrip(assignTeam(base, team, NOW, NOW), NOW);
  assert.throws(() => cancel(going, "x", NOW));
});

test("cân bỏ dòng 0kg và từ chối khi không có dòng nào", () => {
  const r = startTrip(assignTeam(base, team, NOW, NOW), NOW);
  assert.equal(recordWeighing(r, [...lines, { material: "Sắt", kg: 0, pricePerKg: 7000 }], false, NOW).weighLines.length, 2);
  assert.throws(() => recordWeighing(r, [{ material: "Sắt", kg: 0, pricePerKg: 7000 }], false, NOW));
});

test("quy ra điểm: không trả tiền mặt, 1 điểm mỗi 1.000đ", () => {
  assert.equal(totalKg(lines), 8.9);
  assert.equal(totalAmount(lines), 92500);
  assert.deepEqual(pickupPoints(lines, false, "quy-diem", RULES), { kg: 17, sorted: 0, cash: 92 });
  let r = recordWeighing(startTrip(assignTeam(base, team, NOW, NOW), NOW), lines, false, NOW);
  assert.equal(complete(r, "quy-diem", RULES, NOW).request.payout.amount, 0);
});
