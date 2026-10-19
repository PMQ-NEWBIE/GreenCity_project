// Chạy: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { fold, keywordClassify } from "../../src/lib/consult/keyword.ts";

const GUIDE = [
  { id: "1", name: "Chai nhựa", aliases: ["chai nước suối", "chai PET"], group: "tai-che", prep: "Đổ hết nước, bóp dẹt." },
  { id: "2", name: "Pin tiểu", aliases: ["pin AA", "pin đũa"], group: "nguy-hai", prep: "Gom riêng vào hộp." },
  { id: "3", name: "Hộp sữa giấy", aliases: ["vỏ hộp sữa"], group: "tai-che", prep: "Tráng sạch, ép dẹt.", note: "Có lớp nhôm nhưng vẫn tái chế được." },
];

test("bỏ dấu, hoa thường", () => {
  assert.equal(fold("  Hộp SỮA giấy! "), "hop sua giay");
  assert.equal(fold("Đồ điện"), "do dien");
});

test("khớp không dấu và theo tên gọi khác", () => {
  assert.equal(keywordClassify("chai nhua", GUIDE)[0].itemName, "Chai nhựa");
  assert.equal(keywordClassify("cuc pin dua het", GUIDE)[0].itemName, "Pin tiểu");
  const r = keywordClassify("hộp sữa giấy", GUIDE)[0];
  assert.equal(r.group, "tai-che");
  assert.equal(r.confidence, 1);
  assert.match(r.guidance, /lớp nhôm/);
});

test("mô tả quá ngắn hoặc không khớp thì không gợi ý", () => {
  assert.deepEqual(keywordClassify("a", GUIDE), []);
  assert.deepEqual(keywordClassify("nệm cao su", GUIDE), []);
});
