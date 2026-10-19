// Chạy: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { findDuplicate, normalizeAddress } from "../../src/lib/litter.ts";
import { distanceMeters } from "../../src/lib/geo.ts";

const now = new Date();
const ago = (h) => new Date(now.getTime() - h * 3_600_000).toISOString();
const r = (over) => ({ id: "x", userName: "A", photos: [], locationSource: "gps", area: "Quận 1", address: "Chân cầu", size: "vua", description: "", at: ago(2), status: "cho-xac-minh", points: 20, lat: 10.7769, lng: 106.7009, ...over });

test("khoảng cách haversine đúng cỡ", () => {
  // 0.001 độ vĩ ≈ 111m
  const m = distanceMeters({ lat: 10.7769, lng: 106.7009 }, { lat: 10.7779, lng: 106.7009 });
  assert.ok(m > 105 && m < 117, `${m}`);
});

test("trùng khi cách dưới 100m trong 24 giờ", () => {
  const hit = findDuplicate([r()], { lat: 10.7772, lng: 106.7009, area: "Quận 1", address: "" }, now, distanceMeters);
  assert.ok(hit);
  assert.ok(hit.meters <= 100);
  assert.equal(findDuplicate([r()], { lat: 10.7785, lng: 106.7009, area: "Quận 1", address: "" }, now, distanceMeters), null);
});

test("bỏ qua báo cáo cũ hơn 24 giờ, đã dọn hoặc bị bác", () => {
  const c = { lat: 10.7769, lng: 106.7009, area: "Quận 1", address: "" };
  assert.equal(findDuplicate([r({ at: ago(25) })], c, now, distanceMeters), null);
  assert.equal(findDuplicate([r({ status: "da-don" })], c, now, distanceMeters), null);
  assert.equal(findDuplicate([r({ status: "khong-hop-le" })], c, now, distanceMeters), null);
});

test("không có tọa độ thì so cùng quận và cùng địa chỉ (bỏ dấu, hoa thường)", () => {
  const manual = r({ lat: undefined, lng: undefined, locationSource: "tay", address: "Góc chợ, cạnh cột điện" });
  assert.ok(findDuplicate([manual], { area: "Quận 1", address: "goc cho  canh cot dien" }, now, distanceMeters));
  assert.equal(findDuplicate([manual], { area: "Quận 3", address: "Góc chợ, cạnh cột điện" }, now, distanceMeters), null);
  assert.equal(normalizeAddress("  Đường Nơ Trang Long!! "), "duong no trang long");
});
