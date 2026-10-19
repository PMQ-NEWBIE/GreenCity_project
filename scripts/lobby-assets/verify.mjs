/**
 * KIỂM ĐỊNH ẢNH LOBBY — chạy: npm run assets:verify
 * Thoát với mã 1 nếu có bất kỳ mục FAIL nào. KHÔNG được sửa ngưỡng trong file này để "cho qua".
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { LOBBY_ASSETS } from "../../src/lobby/assets.ts";

const ROOT = path.resolve(import.meta.dirname, "../..");

/** Hash của ảnh tạm ban đầu — ảnh nào còn trùng nghĩa là CHƯA được thay. */
const PLACEHOLDER_SHA256 = {
  sky: "5c22ab902e50fb5de46232d45475fa40c4b061318609fb1127dd6130f1936cc3",
  subject: "d5c1d3ca17730451983ed985e30c7db6ce418a558f2e8fd13a31bf5a6c84b96e",
  foreground: "94744746a16ab930decd7ae4e087c9e9f7289bfee44dc94fb685f17487c8d06a",
  feature1: "f27349b2172490bc8b84c7e0aad04c34f3e01bcde573aa34cb26d236e444b936",
  feature2: "57296d84e3f21daf57a15b4d092c7c3d8c23a259597a3d5f7b264514a33fdf43",
  feature3: "c233187c898ec42e9edfff6c9b618aea2cd97d1efb2d0f145dc4084d514b73da",
  ctaBackground: "fb742fce59c648f405189c5c231f2d72f4b45038aca9c8a32497e2ac9b6c60e5",
  authPanel: "d452e7e3799401b8740b79682c621ae45d5016d54c313c9c39543ac172aaa81c",
};

const lin = (v) => {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const percentile = (arr, p) => {
  const s = Float64Array.from(arr).sort();
  return s[Math.min(s.length - 1, Math.floor(p * s.length))];
};

/** Nền ca-rô giả: vùng góc gần như toàn xám trung tính, chia 2 mức sáng rõ rệt (trắng & xám nhạt). */
function looksLikeCheckerboard(data, w, h, channels) {
  const size = Math.min(96, w >> 2, h >> 2);
  const regions = [
    [0, 0],
    [w - size, 0],
    [0, h - size],
    [w - size, h - size],
  ];
  return regions.some(([rx, ry]) => {
    let neutral = 0, light = 0, mid = 0;
    for (let y = ry; y < ry + size; y++)
      for (let x = rx; x < rx + size; x++) {
        const i = (y * w + x) * channels;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if (Math.max(r, g, b) - Math.min(r, g, b) > 12) continue;
        neutral++;
        if (r >= 235) light++;
        else if (r >= 180 && r <= 222) mid++;
      }
    const n = size * size;
    return neutral / n > 0.9 && light / n > 0.2 && mid / n > 0.2;
  });
}

const results = [];
const add = (key, ok, msg, level = ok ? "PASS" : "FAIL") => results.push({ key, level, msg });

for (const [key, spec] of Object.entries(LOBBY_ASSETS)) {
  const file = path.join(ROOT, "public", spec.src);
  if (!existsSync(file)) {
    add(key, false, `Thiếu file ${spec.src}`);
    continue;
  }
  const buf = readFileSync(file);
  const sha = createHash("sha256").update(buf).digest("hex");
  add(key, sha !== PLACEHOLDER_SHA256[key], sha === PLACEHOLDER_SHA256[key] ? "Vẫn là ẢNH TẠM — chưa được thay" : "Đã thay ảnh tạm");

  const meta = await sharp(buf).metadata();
  add(key, meta.format === "webp", `Định dạng ${meta.format} (yêu cầu webp)`);
  add(key, meta.width === spec.width && meta.height === spec.height, `Kích thước ${meta.width}×${meta.height} (yêu cầu ${spec.width}×${spec.height})`);
  const kb = statSync(file).size / 1024;
  add(key, kb <= spec.maxKB, `Dung lượng ${kb.toFixed(0)} KB (tối đa ${spec.maxKB} KB)`);

  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const A = (x, y) => data[(y * w + x) * 4 + 3];

  add(key, !looksLikeCheckerboard(data, w, h, 4), "Không có nền ca-rô (checkerboard) vẽ sẵn");

  if (spec.transparent) {
    add(key, meta.hasAlpha === true, "Có kênh alpha");
    const corners = [A(0, 0), A(w - 1, 0), A(0, h - 1), A(w - 1, h - 1)];
    const topCornersClear = corners[0] <= 8 && corners[1] <= 8;
    add(key, topCornersClear, `2 góc trên trong suốt thật (alpha = ${corners[0]}, ${corners[1]})`);
    let solid = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] > 200) solid++;
    const solidRatio = solid / (w * h);

    if (key === "subject") {
      add(key, corners[2] <= 8 && corners[3] <= 8, "2 góc dưới trong suốt (vật thể không tràn kín đáy)");
      add(key, solidRatio >= 0.12 && solidRatio <= 0.8, `Vật thể chiếm ${Math.round(solidRatio * 100)}% khung (yêu cầu 12–80%)`);
      let lowest = -1, minX = w, maxX = -1;
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++)
          if (A(x, y) > 200) {
            lowest = y;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
          }
      add(key, lowest >= h * 0.97, `Mép dưới vật thể ở ${Math.round((lowest / h) * 100)}% chiều cao (yêu cầu ≥ 97% — bánh xe chạm đáy)`);
      add(key, maxX - minX >= w * 0.55, `Vật thể rộng ${Math.round(((maxX - minX) / w) * 100)}% khung (yêu cầu ≥ 55%)`);
    }
    if (key === "foreground") {
      let maxTop = 0;
      for (let y = 0; y < Math.floor(h * 0.4); y++) for (let x = 0; x < w; x++) maxTop = Math.max(maxTop, A(x, y));
      add(key, maxTop <= 8, `40% phía trên trong suốt hoàn toàn (alpha lớn nhất = ${maxTop})`);
      let bottomSolid = 0;
      const yb = Math.floor(h * 0.75);
      for (let y = yb; y < h; y++) for (let x = 0; x < w; x++) if (A(x, y) > 160) bottomSolid++;
      const bs = bottomSolid / ((h - yb) * w);
      add(key, bs >= 0.12, `Có lá ở dải dưới cùng (${Math.round(bs * 100)}% dải đáy có lá, yêu cầu ≥ 12%)`);
      // Vùng giữa-trái phía trên dải lá phải thoáng (nút CTA nằm phía trên lớp này)
      let midLeft = 0, n = 0;
      for (let y = Math.floor(h * 0.4); y < Math.floor(h * 0.6); y++)
        for (let x = Math.floor(w * 0.1); x < Math.floor(w * 0.45); x++, n++) if (A(x, y) > 160) midLeft++;
      add(key, midLeft / n <= 0.35, `Vùng giữa-trái ngay trên dải lá đủ thoáng (${Math.round((midLeft / n) * 100)}% bị che, tối đa 35%)`);
    }
  } else {
    let minA = 255;
    for (let i = 3; i < data.length; i += 4) if (data[i] < minA) minA = data[i];
    add(key, minA >= 250, "Ảnh nền đặc, không có vùng trong suốt");
  }

  // Khả năng đọc chữ trên ảnh
  const region = (fx0, fy0, fx1, fy1) => {
    const out = [];
    const step = 3;
    for (let y = Math.floor(h * fy0); y < Math.floor(h * fy1); y += step)
      for (let x = Math.floor(w * fx0); x < Math.floor(w * fx1); x += step) {
        const i = (y * w + x) * 4;
        out.push(luminance(data[i], data[i + 1], data[i + 2]));
      }
    return out;
  };
  if (key === "sky") {
    // Tiêu đề xanh đậm (#0c3517, độ sáng ~0.03) nằm ở nửa trái — nền phải đủ sáng cho tương phản ≥ 4.5:1
    const p5 = percentile(region(0.02, 0.1, 0.55, 0.62), 0.05);
    const contrast = (p5 + 0.05) / (0.03 + 0.05);
    add(key, contrast >= 4.5, `Vùng tiêu đề: tương phản tệ nhất với chữ xanh đậm = ${contrast.toFixed(1)}:1 (yêu cầu ≥ 4.5:1) — nửa trái phải sáng, thoáng`);
  }
  if (key === "ctaBackground") {
    const mean = region(0, 0, 0.5, 1).reduce((a, b) => a + b, 0) / region(0, 0, 0.5, 1).length;
    add(key, mean <= 0.3, `Nửa trái (chữ trắng) độ sáng trung bình ${mean.toFixed(2)} (yêu cầu ≤ 0.30 — tối, ít chi tiết)`);
  }
  if (key === "authPanel") {
    const lower = region(0, 0.66, 1, 1);
    const mean = lower.reduce((a, b) => a + b, 0) / lower.length;
    add(key, mean <= 0.35, `1/3 dưới (chữ trắng) độ sáng trung bình ${mean.toFixed(2)} (yêu cầu ≤ 0.35)`);
  }
}

const fails = results.filter((r) => r.level === "FAIL");
let current = "";
for (const r of results) {
  if (r.key !== current) {
    current = r.key;
    console.log(`\n${r.key} → ${LOBBY_ASSETS[r.key].src}`);
  }
  console.log(`  ${r.level === "PASS" ? "PASS" : "FAIL"}  ${r.msg}`);
}
console.log(
  fails.length
    ? `\n✗ ${fails.length} mục FAIL — CHƯA HOÀN THÀNH. Sửa ảnh rồi chạy lại (không sửa ngưỡng).`
    : `\n✓ TẤT CẢ ĐẠT (${results.length} mục).`
);
process.exit(fails.length ? 1 : 0);
