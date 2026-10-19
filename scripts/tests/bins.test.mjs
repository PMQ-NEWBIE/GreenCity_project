// Chạy: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { dropoffPoints, fullReportCapped, openReportFor, raiseLevel } from "../../src/lib/bins.ts";

const RULES = [
  { id: "bin-recycle", reason: "bin_dropoff", activity: "", points: 5, unit: "lần", condition: "", dailyCap: 3 },
  { id: "bin-clothes", reason: "bin_dropoff", activity: "", points: 3, unit: "kg", condition: "" },
  { id: "bin-organic", reason: "bin_dropoff", activity: "", points: 1, unit: "kg", condition: "" },
  { id: "bin-full", reason: "bin_full_report", activity: "", points: 5, unit: "lần", condition: "", dailyCap: 1 },
];
const now = new Date();
const hoursAgo = (h) => new Date(now.getTime() - h * 3_600_000).toISOString();
const drop = (over = {}) => ({ id: Math.random().toString(36), binId: "tc-1", binCode: "TC-1", binType: "tai-che", userId: "u", userName: "U", material: "x", estKg: 1, photos: [], at: now.toISOString(), status: "cho-kiem-tra", points: 5, capped: false, ...over });

test("tái chế tính theo lần, quần áo và hữu cơ tính theo kg", () => {
  const h = { dropoffs: [], userId: "u", now };
  assert.equal(dropoffPoints("tai-che", 6, RULES, h).points, 5);
  assert.equal(dropoffPoints("quan-ao", 4, RULES, h).points, 12);
  assert.equal(dropoffPoints("huu-co", 0.5, RULES, h).points, 0);
});

test("tái chế tối đa 3 lượt tính điểm mỗi ngày; lượt bị từ chối không tính vào giới hạn", () => {
  const three = [drop(), drop(), drop({ status: "dat" })];
  assert.equal(dropoffPoints("tai-che", 1, RULES, { dropoffs: three, userId: "u", now }).capped, true);
  const withRejected = [drop(), drop(), drop({ status: "khong-dat" })];
  assert.equal(dropoffPoints("tai-che", 1, RULES, { dropoffs: withRejected, userId: "u", now }).capped, false);
  const otherUser = [drop({ userId: "v" }), drop({ userId: "v" }), drop({ userId: "v" })];
  assert.equal(dropoffPoints("tai-che", 1, RULES, { dropoffs: otherUser, userId: "u", now }).capped, false);
  const yesterday = [drop({ at: hoursAgo(30) }), drop({ at: hoursAgo(30) }), drop({ at: hoursAgo(30) })];
  assert.equal(dropoffPoints("tai-che", 1, RULES, { dropoffs: yesterday, userId: "u", now }).capped, false);
});

test("báo đầy trùng trong 6 giờ thì gộp; quá 6 giờ hoặc đã xử lý thì báo mới", () => {
  const r = (over) => ({ id: "r", binId: "b", level: "day", userName: "A", at: hoursAgo(2), status: "moi", merged: 0, points: 5, ...over });
  assert.ok(openReportFor([r()], "b", now));
  assert.equal(openReportFor([r({ at: hoursAgo(7) })], "b", now), undefined);
  assert.equal(openReportFor([r({ status: "da-xu-ly" })], "b", now), undefined);
  assert.equal(openReportFor([r()], "khac", now), undefined);
});

test("báo đầy được tính điểm tối đa 1 lần mỗi thùng mỗi ngày", () => {
  const rule = RULES[3];
  const mine = { id: "r", binId: "b", level: "day", userId: "u", userName: "U", at: hoursAgo(1), status: "da-xu-ly", merged: 0, points: 5 };
  assert.equal(fullReportCapped([mine], "b", "u", rule, now), true);
  assert.equal(fullReportCapped([mine], "khac", "u", rule, now), false);
  assert.equal(fullReportCapped([{ ...mine, status: "khong-dung" }], "b", "u", rule, now), false);
});

test("báo đầy chỉ nâng mức, không hạ", () => {
  assert.equal(raiseLevel("binh-thuong", "sap-day"), "sap-day");
  assert.equal(raiseLevel("day", "sap-day"), "day");
  assert.equal(raiseLevel("dang-xu-ly", "day"), "dang-xu-ly");
});
