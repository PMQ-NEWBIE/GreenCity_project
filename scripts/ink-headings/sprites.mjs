/**
 * ẢNH CHO TIÊU ĐỀ "CHỮ LÁ"
 *
 *   npm run ink:sprites
 *
 * Đầu vào: assets-src/ink/<key>.png, ảnh chụp thật trên nền magenta trơn #FF00FF.
 * Đầu ra : public/lobby/ink/*.webp
 *
 *  - Ảnh vật thể (lá, hoa, mầm): tách nền → cắt sát → co về 340px → thêm bóng đổ mềm
 *    (ánh sáng từ trên-phải, bóng xuống dưới-trái) → canvas 384×384 đặt theo điểm neo:
 *      base   = cuống ở giữa mép dưới (lá mọc lên)
 *      center = tâm hoa ở giữa ảnh
 *  - Lá vắt (drape): lá lộn ngược, phần cuống + gốc phiến NẰM trên đỉnh chữ (nhìn chéo nên dẹt lại,
 *    sáng hơn vì hứng nắng), gập ở mép chữ (nếp tối), phiến lá rủ xuống trước mặt chữ, chóp hơi cong
 *    ra phía người xem (ngắn lại). Nếp gập nằm đúng dòng DRAPE_FOLD của ảnh = điểm tựa khi xoay/nhún.
 *  - Texture lòng chữ (foliage-dark / foliage-light): ghép nhiều lớp lá rủ từ CHÍNH các ảnh lá
 *    chụp thật, lớp sau tối, lớp trước sáng, mỗi lá có bóng đổ → chiều sâu thật. Vị trí lấy từ
 *    PRNG có seed cố định nên chạy lại ra đúng ảnh cũ.
 *
 * Cổng chặn: không còn pixel magenta trong ảnh ra; mỗi ảnh ≤ maxKB; texture đạt ngưỡng độ sáng.
 */
import { existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "../..");
const RAW_DIR = path.join(ROOT, "assets-src/ink");
const OUT_DIR = path.join(ROOT, "public/lobby/ink");
mkdirSync(OUT_DIR, { recursive: true });

/** Ảnh vật thể: key ra → { ảnh thô, điểm neo, xoay } */
const SPRITES = {
  "leaf-trau": { raw: "leaf-trau", pivot: "base" },
  "leaf-xoai": { raw: "leaf-xoai", pivot: "base" },
  "flower-su": { raw: "flower-su", pivot: "center" },
  "flower-lai": { raw: "flower-lai", pivot: "center" },
  sprout: { raw: "sprout", pivot: "base" },
};
/** Lá vắt: ảnh thô → key ra */
const DRAPES = { "leaf-drape-trau": "leaf-trau" };
/** Dòng nếp gập trong ảnh 384px (khớp INK_DRAPE_FOLD trong src/lobby/ink/sprites.ts) */
const DRAPE_FOLD = 56;
const SPRITE_MAX_KB = 32;
const CANVAS = 384;
const FIT = 340;
const MARGIN = 14;

/** Bóng đổ: lệch xuống-trái vì ánh sáng từ trên-phải */
const SHADOW = { dx: -7, dy: 10, blur: 6, opacity: 0.38, rgb: [6, 32, 13] };

const TEX_W = 2048;
const TEX_H = 1024;
const TEX_MAX_KB = 200;

// ---------------------------------------------------------------- tách nền magenta

async function keyMagenta(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  // Màu nền = trung vị viền ảnh
  const border = [];
  for (let x = 0; x < w; x += 4) border.push((x) * 4, ((h - 1) * w + x) * 4);
  for (let y = 0; y < h; y += 4) border.push((y * w) * 4, (y * w + w - 1) * 4);
  const median = (arr) => arr.sort((a, b) => a - b)[arr.length >> 1];
  const key = [0, 1, 2].map((c) => median(border.map((i) => data[i + c])));
  if (!(key[0] > 170 && key[2] > 170 && key[1] < 100)) {
    throw new Error(`${path.basename(file)}: nền không phải magenta (${key.join(",")}). Tạo lại ảnh trên nền #FF00FF.`);
  }
  const sKey = Math.min(key[0], key[2]) - key[1];
  for (let i = 0; i < data.length; i += 4) {
    const s = Math.min(data[i], data[i + 2]) - data[i + 1];
    let a = 1 - Math.min(1, Math.max(0, (s - 12) / (sKey - 12)));
    if (a <= 0.03) a = 0;
    if (a > 0 && a < 1) for (let c = 0; c < 3; c++) data[i + c] = Math.max(0, Math.min(255, (data[i + c] - (1 - a) * key[c]) / a));
    if (a > 0) {
      // khử ánh tím còn sót ở viền
      const spill = Math.min(data[i], data[i + 2]) - data[i + 1];
      if (spill > 0) {
        data[i] -= spill;
        data[i + 2] -= spill;
      }
    }
    data[i + 3] = Math.round(a * 255);
  }
  return sharp(data, { raw: { width: w, height: h, channels: 4 } }).trim({ threshold: 1 }).png().toBuffer();
}

// ---------------------------------------------------------------- tiện ích

/** Bóng đổ RGBA từ kênh alpha của ảnh (cùng kích thước, đã làm mờ) */
async function shadowOf(png, blur, opacity, rgb = SHADOW.rgb) {
  const { data, info } = await sharp(png).ensureAlpha().extractChannel(3).blur(blur).raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < info.width * info.height; i++) {
    out[i * 4] = rgb[0];
    out[i * 4 + 1] = rgb[1];
    out[i * 4 + 2] = rgb[2];
    out[i * 4 + 3] = Math.round(data[i] * opacity);
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

/** Đếm pixel còn ám magenta (trên các pixel không trong suốt) */
async function magentaShare(png) {
  const { data } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let bad = 0;
  let solid = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] <= 20) continue;
    solid++;
    if (data[i] > 170 && data[i + 2] > 170 && data[i + 1] < 120) bad++;
  }
  return solid ? bad / solid : 0;
}

function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const kb = (buf) => Math.round(buf.length / 1024);
const report = [];

// ---------------------------------------------------------------- ảnh vật thể

const keyedCache = new Map();
async function keyed(raw) {
  if (!keyedCache.has(raw)) {
    const file = path.join(RAW_DIR, `${raw}.png`);
    if (!existsSync(file)) throw new Error(`Thiếu ảnh thô: ${path.relative(ROOT, file)}`);
    keyedCache.set(raw, await keyMagenta(file));
  }
  return keyedCache.get(raw);
}

async function buildSprite(key, { raw, pivot, rotate = 0 }) {
  let img = sharp(await keyed(raw));
  if (rotate) img = img.rotate(rotate, { background: { r: 0, g: 0, b: 0, alpha: 0 } });
  const fitted = await sharp(await img.png().toBuffer())
    .trim({ threshold: 1 })
    .resize(FIT, FIT, { fit: "inside", kernel: "lanczos3" })
    .png()
    .toBuffer();
  const { width, height } = await sharp(fitted).metadata();
  const left = Math.round((CANVAS - width) / 2);
  const top = pivot === "base" ? CANVAS - MARGIN - height : pivot === "top" ? MARGIN : Math.round((CANVAS - height) / 2);
  const shadow = await shadowOf(fitted, SHADOW.blur, SHADOW.opacity);

  const png = await sharp({ create: { width: CANVAS, height: CANVAS, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([
      { input: shadow, left: left + SHADOW.dx, top: top + SHADOW.dy },
      { input: fitted, left, top },
    ])
    .png()
    .toBuffer();
  const webp = await sharp(png).webp({ quality: 82, alphaQuality: 90, effort: 6 }).toBuffer();
  const mag = await magentaShare(png);
  if (mag > 0.001) throw new Error(`${key}: còn ${(mag * 100).toFixed(2)}% pixel ám magenta`);
  if (kb(webp) > SPRITE_MAX_KB) throw new Error(`${key}: ${kb(webp)} KB > ${SPRITE_MAX_KB} KB`);
  writeFileSync(path.join(OUT_DIR, `${key}.webp`), webp);
  report.push({ key, size: `${CANVAS}²`, magenta: mag, kb: kb(webp) });
}

/** Nhân độ sáng từng hàng ảnh RGBA theo hàm f(y) */
async function shadeRows(png, f) {
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let y = 0; y < info.height; y++) {
    const k = f(y);
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * 4;
      for (let c = 0; c < 3; c++) data[i + c] = Math.max(0, Math.min(255, Math.round(data[i + c] * k)));
    }
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

/** Co giãn một dải ngang của ảnh theo chiều dọc */
async function band(png, width, top, height, toHeight) {
  return sharp(png)
    .extract({ left: 0, top, width, height })
    .resize(width, Math.max(1, Math.round(toHeight)), { fit: "fill", kernel: "lanczos3" })
    .png()
    .toBuffer();
}

async function buildDrape(key, raw) {
  // Lá lộn ngược: cuống ở trên, chóp ở dưới
  // Sáng và tươi hơn lá phủ trong lòng chữ một chút → nổi lên trên chữ
  const flipped = await sharp(await keyed(raw)).rotate(180).modulate({ brightness: 1.12, saturation: 1.12 }).png().toBuffer();
  const leaf = await sharp(flipped).trim({ threshold: 1 }).resize(FIT, FIT, { fit: "inside", kernel: "lanczos3" }).png().toBuffer();
  const { width: w, height: h } = await sharp(leaf).metadata();

  const LIE = Math.round(h * 0.3); // cuống + gốc phiến nằm trên đỉnh chữ
  const TIP = Math.round(h * 0.16); // chóp lá cong về phía người xem
  const lie = await band(leaf, w, 0, LIE, LIE * 0.34);
  const hang = await band(leaf, w, LIE, h - LIE - TIP, h - LIE - TIP);
  const tip = await band(leaf, w, h - TIP, TIP, TIP * 0.72);
  const lieH = Math.round(LIE * 0.34);
  const hangH = h - LIE - TIP;
  const tipH = Math.round(TIP * 0.72);

  const left = Math.round((CANVAS - w) / 2);
  const top = DRAPE_FOLD - lieH;
  let body = await sharp({ create: { width: CANVAS, height: CANVAS, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([
      { input: lie, left, top },
      { input: hang, left, top: DRAPE_FOLD },
      { input: tip, left, top: DRAPE_FOLD + hangH },
    ])
    .png()
    .toBuffer();
  // Phần nằm hứng nắng sáng hơn; chỗ uốn qua mép chữ bắt sáng thành một viền; ngay dưới là nếp tối,
  // phiến sát nếp còn khuất bóng rồi sáng dần; chóp cong tối nhẹ
  const tipTop = DRAPE_FOLD + hangH;
  body = await shadeRows(body, (y) => {
    const d = y - DRAPE_FOLD;
    if (d < -7) return 1.14;
    if (d < -1) return 1.32;
    if (d < 5) return 0.5 + 0.03 * (d + 1);
    if (d < 55) return 0.72 + (0.28 * (d - 5)) / 50;
    if (y > tipTop) return 1 - (0.14 * (y - tipTop)) / Math.max(1, tipH);
    return 1;
  });
  // Bóng đổ lên mặt chữ: lá sát mặt chữ nên bóng gần, đậm
  const shadow = await shadowOf(body, 4, 0.5);
  const png = await sharp({ create: { width: CANVAS, height: CANVAS, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([
      { input: shadow, left: -5, top: 7 },
      { input: body, left: 0, top: 0 },
    ])
    .png()
    .toBuffer();
  const webp = await sharp(png).webp({ quality: 82, alphaQuality: 90, effort: 6 }).toBuffer();
  const mag = await magentaShare(png);
  if (mag > 0.001) throw new Error(`${key}: còn ${(mag * 100).toFixed(2)}% pixel ám magenta`);
  if (kb(webp) > SPRITE_MAX_KB) throw new Error(`${key}: ${kb(webp)} KB > ${SPRITE_MAX_KB} KB`);
  writeFileSync(path.join(OUT_DIR, `${key}.webp`), webp);
  report.push({ key, size: `${CANVAS}²`, magenta: mag, kb: kb(webp) });
}

// ---------------------------------------------------------------- texture lá rủ

/** Lớp lá từ sau ra trước: số lá, chiều cao (px), độ sáng, độ đậm bóng */
const LAYERS = [
  { count: 120, size: [240, 310], brightness: 0.4, shadow: 0.55 },
  { count: 100, size: [260, 330], brightness: 0.56, shadow: 0.6 },
  { count: 80, size: [280, 350], brightness: 0.74, shadow: 0.65 },
  { count: 60, size: [300, 370], brightness: 0.95, shadow: 0.7 },
];
const LEAF_MIX = [
  { raw: "leaf-trau", weight: 0.7 },
  { raw: "leaf-xoai", weight: 0.3 },
];
const PAD = 320;

async function buildFoliage() {
  const rand = mulberry32(20261020);
  const pick = () => (rand() < LEAF_MIX[0].weight ? LEAF_MIX[0].raw : LEAF_MIX[1].raw);
  const W = TEX_W + 2 * PAD;
  const H = TEX_H + 2 * PAD;
  const layers = [];

  for (const L of LAYERS) {
    // Lưới có rung lắc → phủ đều, không dồn cục
    const cols = Math.round(Math.sqrt((L.count * W) / H));
    const rows = Math.ceil(L.count / cols);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const size = Math.round(L.size[0] + rand() * (L.size[1] - L.size[0]));
        // Rủ xuống: xoay quanh 180°, lệch ±26°
        const angle = 180 + (rand() * 2 - 1) * 26;
        const flip = rand() < 0.5;
        const hue = Math.round((rand() * 2 - 1) * 8);
        let leaf = sharp(await keyed(pick())).resize(size, size, { fit: "inside" });
        if (flip) leaf = leaf.flop();
        const rotated = await sharp(await leaf.png().toBuffer())
          .rotate(angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .modulate({ brightness: L.brightness * (0.92 + rand() * 0.16), saturation: 0.9 + rand() * 0.15, hue })
          .png()
          .toBuffer();
        const { width, height } = await sharp(rotated).metadata();
        const cx = ((c + 0.5 + (rand() - 0.5) * 0.9) / cols) * W;
        const cy = ((r + 0.5 + (rand() - 0.5) * 0.9) / rows) * H;
        // Kẹp vào trong canvas đệm (phần đệm bị cắt bỏ sau cùng) → không bỏ sót lá nào
        const left = Math.min(W - width - 12, Math.max(12, Math.round(cx - width / 2)));
        const top = Math.min(H - height - 18, Math.max(0, Math.round(cy - height / 2)));
        layers.push({ input: await shadowOf(rotated, 14, L.shadow), left: left - 12, top: top + 18 });
        layers.push({ input: rotated, left, top });
      }
    }
  }

  const base = await sharp({ create: { width: W, height: H, channels: 3, background: { r: 8, g: 30, b: 14 } } })
    .composite(layers)
    .extract({ left: PAD + 90, top: PAD + 50, width: TEX_W, height: TEX_H }) // lệch vào trong: mép canvas đệm thưa lá
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return base;
}

function luminance({ data, info }) {
  const n = info.width * info.height;
  const hist = new Uint32Array(256);
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const l = Math.round(0.2126 * data[i * 3] + 0.7152 * data[i * 3 + 1] + 0.0722 * data[i * 3 + 2]);
    hist[l]++;
    sum += l;
  }
  let acc = 0;
  let p95 = 255;
  for (let v = 0; v < 256; v++) {
    acc += hist[v];
    if (acc >= 0.95 * n) {
      p95 = v;
      break;
    }
  }
  return { mean: sum / n / 255, p95: p95 / 255 };
}

/** out = min(255, src·gain)·k + màu·(1−k) — tăng sáng rồi kéo về một tông màu */
function mix({ data, info }, k, rgb, gain = 1) {
  const out = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += 3)
    for (let c = 0; c < 3; c++) out[i + c] = Math.round(Math.min(255, data[i + c] * gain) * k + rgb[c] * (1 - k));
  return { data: out, info };
}

async function writeTexture(name, img, check, quality = 76) {
  const lum = luminance(img);
  if (!check(lum)) throw new Error(`${name}: độ sáng TB ${lum.mean.toFixed(2)}, P95 ${lum.p95.toFixed(2)} không đạt ngưỡng`);
  const png = await sharp(img.data, { raw: { width: img.info.width, height: img.info.height, channels: 3 } }).png().toBuffer();
  const mag = await magentaShare(png);
  if (mag > 0) throw new Error(`${name}: còn pixel magenta (${(mag * 100).toFixed(3)}%)`);
  const webp = await sharp(png).webp({ quality, effort: 6 }).toBuffer();
  if (kb(webp) > TEX_MAX_KB) throw new Error(`${name}: ${kb(webp)} KB > ${TEX_MAX_KB} KB`);
  writeFileSync(path.join(OUT_DIR, `${name}.webp`), webp);
  report.push({ key: name, size: `${TEX_W}×${TEX_H}`, magenta: mag, kb: kb(webp), lum });
}

// ---------------------------------------------------------------- chạy

for (const [key, spec] of Object.entries(SPRITES)) await buildSprite(key, spec);
for (const [key, raw] of Object.entries(DRAPES)) await buildDrape(key, raw);

const foliage = await buildFoliage();
// Hero (nền trời sáng): đủ tối để chữ đọc rõ
await writeTexture("foliage-dark", mix(foliage, 0.82, [6, 32, 13]), (l) => l.mean <= 0.3 && l.p95 <= 0.55);
// CTA (nền xanh đậm): sáng, kéo về gc-200
await writeTexture("foliage-light", mix(foliage, 0.72, [200, 229, 177], 1.5), (l) => l.mean >= 0.5, 66);

// Dọn ảnh ra không còn dùng
const keep = new Set([...Object.keys(SPRITES), ...Object.keys(DRAPES), "foliage-dark", "foliage-light"].map((k) => `${k}.webp`));
for (const f of readdirSync(OUT_DIR)) {
  if (f.endsWith(".webp") && !keep.has(f) && statSync(path.join(OUT_DIR, f)).isFile()) {
    rmSync(path.join(OUT_DIR, f));
    console.log(`– xóa ảnh cũ không dùng: ${f}`);
  }
}

console.table(
  report.map((r) => ({
    ảnh: r.key,
    cỡ: r.size,
    KB: r.kb,
    "magenta %": (r.magenta * 100).toFixed(3),
    "sáng TB": r.lum ? r.lum.mean.toFixed(2) : "",
    P95: r.lum ? r.lum.p95.toFixed(2) : "",
  }))
);
