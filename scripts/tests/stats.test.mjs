// Chạy: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { lastMonths, liveRows, materialGroup, summarize, toCsv } from "../../src/lib/stats.ts";

test("gom vật liệu vào nhóm", () => {
  assert.equal(materialGroup("Giấy & bìa carton"), "Giấy");
  assert.equal(materialGroup("Chai nhựa PET"), "Nhựa");
  assert.equal(materialGroup("Lon nhôm"), "Kim loại");
  assert.equal(materialGroup("Chai lọ thủy tinh"), "Thủy tinh");
  assert.equal(materialGroup("Quần áo"), "Khác");
});

test("n tháng gần nhất, cũ trước, qua năm đúng", () => {
  assert.deepEqual(lastMonths(new Date(2026, 1, 15), 3), ["2025-12", "2026-01", "2026-02"]);
});

test("gộp số liệu thật: đơn hoàn tất, lượt bỏ thùng đã kiểm, điểm rác đã dọn", () => {
  const at = "2026-10-10T08:00:00Z";
  const pickup = { status: "hoan-tat", area: "Quận 3", createdAt: at, history: [{ status: "hoan-tat", at }], weighLines: [{ material: "Lon nhôm", kg: 2.5, pricePerKg: 1 }, { material: "Chai nhựa PET", kg: 4, pricePerKg: 1 }] };
  const drops = [
    { binId: "b", status: "dat", material: "Quần áo", estKg: 2, actualKg: 3, at, reviewedAt: at },
    { binId: "b", status: "khong-dat", material: "Lon nhôm", estKg: 1, at, reviewedAt: at },
    { binId: "b", status: "cho-kiem-tra", material: "Lon nhôm", estKg: 1, at },
  ];
  const litter = [{ status: "da-don", area: "Quận 3", at: "2026-10-10T00:00:00Z", cleanedAt: "2026-10-11T00:00:00Z" }];
  const rows = liveRows([pickup], drops, litter, () => "Quận 3");
  const s = summarize(rows, ["2026-10"], "all");
  assert.equal(s.totalKg, 9.5);
  assert.equal(s.dropOkRate, 0.5);
  assert.equal(s.dropChecked, 2);
  assert.equal(s.litterDone, 1);
  assert.equal(s.litterAvgHours, 24);
  assert.equal(s.byGroup[0].group, "Nhựa");
  assert.equal(summarize(rows, ["2026-10"], "Quận 1").totalKg, 0);
});

test("CSV có BOM và bọc ô có dấu phẩy", () => {
  const csv = toCsv(["Quận", "Kg"], [["Quận 1, trung tâm", 12]]);
  assert.ok(csv.startsWith("﻿"));
  assert.match(csv, /"Quận 1, trung tâm",12/);
});
