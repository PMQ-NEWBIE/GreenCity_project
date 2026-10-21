/**
 * XỬ LÝ ẢNH THÔ → ẢNH LOBBY ĐÚNG CHUẨN
 *
 *   npm run assets:process            (xử lý tất cả)
 *   npm run assets:process -- subject (chỉ xử lý 1 ảnh)
 *
 * Đầu vào : assets-src/lobby/<key>.png|jpg|jpeg|webp   (key xem bảng bên dưới)
 * Đầu ra  : public/lobby/<file>.webp  — đúng kích thước / dung lượng trong src/lobby/assets.ts
 *
 * Ảnh cần nền trong suốt (subject, foreground): tạo ảnh thô trên NỀN MAGENTA TRƠN (#FF00FF).
 * Script tự tách nền theo khoảng cách màu + khử ám magenta ở viền. Nếu ảnh thô đã có alpha thật
 * (4 góc trong suốt) thì giữ nguyên alpha đó.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { LOBBY_ASSETS, MOBILE_HERO_READY } from "../../src/lobby/assets.ts";

const ROOT = path.resolve(import.meta.dirname, "../..");
const RAW_DIR = path.join(ROOT, "assets-src", "lobby");
const PUBLIC_DIR = path.join(ROOT, "public");

/** Cách đặt ảnh thô vào khung đích cho từng key */
const PLACEMENT = {
  sky: { mode: "cover", position: "centre" },
  skyNight: { mode: "cover", position: "centre" },
  mobileHero: { mode: "cover", position: "south" }, // giữ phần đáy: xe đạp và vỉa hè
  subject: { mode: "subject" }, // tách nền, cắt sát, đặt giữa-dưới, bánh xe chạm mép dưới
  foreground: { mode: "foreground" }, // tách nền, bám đáy, ép 40% phía trên trong suốt
  feature1: { mode: "cover", position: sharp.strategy.attention },
  feature2: { mode: "cover", position: sharp.strategy.attention },
  feature3: { mode: "cover", position: sharp.strategy.attention },
  ctaBackground: { mode: "cover", position: "centre" },
  authPanel: { mode: "cover", position: sharp.strategy.attention },
};

const EXTS = [".png", ".jpg", ".jpeg", ".webp"];
const findRaw = (key) => EXTS.map((e) => path.join(RAW_DIR, key + e)).find((p) => existsSync(p));

/**
 * Tách nền trơn (magenta hoặc màu bất kỳ đồng đều ở viền) → RGBA có alpha thật.
 * sampleEdges: "all" = lấy mẫu cả 4 cạnh (vật thể nằm giữa khung);
 *              "top" = chỉ cạnh trên + nửa trên 2 cạnh bên (lá chạm đáy/hai bên là đúng thiết kế).
 */
async function keyOutBackground(input, sampleEdges = "all") {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const px = (x, y) => (y * w + x) * 4;

  // Ảnh thô đã có alpha thật → giữ nguyên
  const corners = [px(0, 0), px(w - 1, 0), px(0, h - 1), px(w - 1, h - 1)].map((i) => data[i + 3]);
  const topCorners = corners.slice(0, 2);
  if ((sampleEdges === "all" ? corners : topCorners).every((a) => a < 10)) return { data, w, h, keyed: false };

  // Ước lượng màu nền từ viền ảnh (trung vị)
  const border = [];
  const step = Math.max(1, Math.floor(Math.min(w, h) / 200));
  const sideEnd = sampleEdges === "all" ? h : Math.floor(h * 0.4);
  for (let x = 0; x < w; x += step) {
    border.push(px(x, 0));
    if (sampleEdges === "all") border.push(px(x, h - 1));
  }
  for (let y = 0; y < sideEnd; y += step) border.push(px(0, y), px(w - 1, y));
  const median = (arr) => arr.sort((a, b) => a - b)[arr.length >> 1];
  const key = [0, 1, 2].map((c) => median(border.map((i) => data[i + c])));
  const dist = (i) => Math.hypot(data[i] - key[0], data[i + 1] - key[1], data[i + 2] - key[2]);
  const uniform = border.filter((i) => dist(i) < 60).length / border.length;
  if (uniform < 0.85) {
    throw new Error(
      `Nền ảnh thô không phải màu trơn (chỉ ${Math.round(uniform * 100)}% viền cùng màu — có thể là nền ca-rô giả ` +
        `hoặc nền ảnh thật). Tạo lại ảnh trên nền magenta trơn #FF00FF` +
        (sampleEdges === "all" ? ", vật thể cách đều 4 cạnh." : ", phần trên ảnh chỉ có nền magenta.")
    );
  }

  // Nền magenta: dùng "độ lấn magenta" s = min(R,B) − G. Màu tự nhiên (xanh lá, nâu, trắng, da…) có s ≈ 0,
  // magenta thuần có s lớn nhất → tỉ lệ nền trong pixel = s / s_nền. Cách này tách đúng cả viền tối lẫn
  // sương mờ bán trong suốt (khoảng cách màu thuần túy sẽ để lại viền tím).
  const isMagenta = key[0] > 170 && key[2] > 170 && key[1] < 100;
  const sKey = Math.min(key[0], key[2]) - key[1];
  const T1 = 45; // (nền màu khác) gần màu nền hơn ngưỡng này → trong suốt hẳn
  const T2 = 120; //                xa hơn ngưỡng này → đặc hẳn
  for (let i = 0; i < data.length; i += 4) {
    let a;
    if (isMagenta) {
      const s = Math.min(data[i], data[i + 2]) - data[i + 1];
      a = 1 - Math.min(1, Math.max(0, (s - 10) / (sKey - 10)));
    } else {
      a = Math.min(1, Math.max(0, (dist(i) - T1) / (T2 - T1)));
    }
    if (a <= 0.02) a = 0;
    if (a > 0 && a < 1) {
      // Khử ám màu nền ở viền: màu thật = (màu quan sát − (1−a)·màu nền) / a
      for (let c = 0; c < 3; c++) data[i + c] = Math.max(0, Math.min(255, (data[i + c] - (1 - a) * key[c]) / a));
    }
    data[i + 3] = Math.round(a * data[i + 3]);
    if (isMagenta && a > 0) {
      // Khử ám tím còn sót: phần min(R,B) vượt quá G là ánh magenta (màu tự nhiên gần như không có)
      const spill = Math.min(data[i], data[i + 2]) - data[i + 1];
      if (spill > 0) {
        data[i] -= spill;
        data[i + 2] -= spill;
      }
    }
  }
  return { data, w, h, keyed: true, key };
}

const rawToSharp = ({ data, w, h }) => sharp(data, { raw: { width: w, height: h, channels: 4 } });

async function buildSubject(rawPath, spec) {
  const keyed = await keyOutBackground(rawPath);
  // Cắt sát vật thể theo kênh alpha
  const { data, w, h } = keyed;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (data[(y * w + x) * 4 + 3] > 24) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
  if (x1 < 0) throw new Error("Không tìm thấy vật thể sau khi tách nền (ảnh toàn màu nền?).");
  const trimmed = await rawToSharp(keyed)
    .extract({ left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 })
    .png()
    .toBuffer();
  const boxW = Math.round(spec.width * 0.94);
  const boxH = Math.round(spec.height * 0.97);
  const fitted = await sharp(trimmed).resize(boxW, boxH, { fit: "inside", kernel: "lanczos3" }).png().toBuffer();
  const meta = await sharp(fitted).metadata();
  const left = Math.round((spec.width - meta.width) / 2);
  const top = spec.height - meta.height - Math.round(spec.height * 0.005); // bánh xe sát mép dưới
  return sharp({ create: { width: spec.width, height: spec.height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: fitted, left, top }])
    .png();
}

async function buildForeground(rawPath, spec) {
  const keyed = await keyOutBackground(rawPath, "top");
  const { data, info } = await rawToSharp(keyed)
    .resize(spec.width, spec.height, { fit: "cover", position: "south", kernel: "lanczos3" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  // Ép 40% phía trên trong suốt hoàn toàn, mờ dần tới 55% — để không bao giờ che nút "Bắt đầu ngay"
  const { width: w, height: h } = info;
  const y0 = Math.round(h * 0.4);
  const y1 = Math.round(h * 0.55);
  for (let y = 0; y < y1; y++) {
    const k = y < y0 ? 0 : (y - y0) / (y1 - y0);
    for (let x = 0; x < w; x++) data[(y * w + x) * 4 + 3] = Math.round(data[(y * w + x) * 4 + 3] * k);
  }
  return sharp(data, { raw: { width: w, height: h, channels: 4 } }).png();
}

async function encodeWithin(pipeline, maxKB, transparent) {
  const png = await pipeline.toBuffer();
  // Lượt 1: ảnh nguyên bản. Lượt 2–3 (dự phòng): làm mịn rất nhẹ để bớt nhiễu hạt khó nén.
  for (const smooth of [0, 0.5, 0.9]) {
    for (let q = 82; q >= 40; q -= 4) {
      let img = sharp(png);
      if (smooth) img = img.blur(smooth);
      if (!transparent) img = img.flatten({ background: "#ffffff" }).removeAlpha();
      const out = await img.webp({ quality: q, alphaQuality: 90, effort: 6, smartSubsample: true }).toBuffer();
      if (out.length <= maxKB * 1024) return { out, q: smooth ? `${q} (làm mịn nhẹ)` : q };
    }
  }
  throw new Error(`Không nén được xuống dưới ${maxKB} KB — ảnh thô quá nhiều chi tiết/nhiễu, tạo lại ảnh mềm hơn.`);
}

const only = process.argv.slice(2);
const keys = Object.keys(LOBBY_ASSETS).filter((k) => only.length === 0 || only.includes(k));
let failed = 0;
mkdirSync(RAW_DIR, { recursive: true });
console.log(`Ảnh thô đọc từ: ${path.relative(ROOT, RAW_DIR)}\n`);

for (const key of keys) {
  const spec = LOBBY_ASSETS[key];
  const raw = findRaw(key);
  const target = path.join(PUBLIC_DIR, spec.src);
  if (!raw && key === "mobileHero" && !MOBILE_HERO_READY) {
    console.log(`– ${key.padEnd(14)} chưa có ảnh thô (tùy chọn — điện thoại đang dùng bầu trời + xe đạp)`);
    continue;
  }
  if (!raw) {
    console.log(`✗ ${key.padEnd(14)} THIẾU ảnh thô: assets-src/lobby/${key}.png (hoặc .jpg/.webp)`);
    failed++;
    continue;
  }
  try {
    const place = PLACEMENT[key];
    let pipeline;
    if (place.mode === "subject") pipeline = await buildSubject(raw, spec);
    else if (place.mode === "foreground") pipeline = await buildForeground(raw, spec);
    else pipeline = sharp(raw).resize(spec.width, spec.height, { fit: "cover", position: place.position, kernel: "lanczos3" }).png();

    const { out, q } = await encodeWithin(pipeline, spec.maxKB, spec.transparent);
    writeFileSync(target, out);
    const rawMeta = await sharp(raw).metadata();
    console.log(
      `✓ ${key.padEnd(14)} ${path.basename(raw)} (${rawMeta.width}×${rawMeta.height}) → ${spec.src} ` +
        `${spec.width}×${spec.height} · q${q} · ${Math.round(out.length / 1024)} KB / tối đa ${spec.maxKB} KB`
    );
  } catch (err) {
    console.log(`✗ ${key.padEnd(14)} LỖI: ${err.message}`);
    failed++;
  }
}

console.log(failed ? `\n${failed} ảnh chưa xử lý được — sửa theo thông báo rồi chạy lại.` : "\nXong. Chạy tiếp: npm run assets:verify");
process.exit(failed ? 1 : 0);
