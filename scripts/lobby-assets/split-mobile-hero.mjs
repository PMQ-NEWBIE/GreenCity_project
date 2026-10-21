/**
 * TÁCH ẢNH HERO DỌC THÀNH 2 LỚP để xe đạp chạy đi được khi đổi sang giao diện tối (điện thoại)
 *
 *   npm run assets:split-mobile-hero
 *
 * Đầu vào : public/lobby/hero-mobile.webp (1080×1920, xe đạp dựng trên vỉa hè, trời sáng phía trên)
 * Đầu ra  : public/lobby/hero-mobile-empty.webp — nền không có xe (chỗ xe được vá bằng màu trời / mặt đường)
 *           public/lobby/hero-mobile-bike.webp  — cùng khung 1080×1920, chỉ còn xe và bóng đổ (nền trong suốt)
 * Hai lớp chồng lên nhau đúng vị trí → nhìn y như ảnh gốc. Phần vá chỉ lộ ra trong lúc trời ngày đang mờ dần
 * sang đêm (khoảng 1 giây), nên vá đơn giản là đủ.
 *
 * Cách tách: trời ở nửa trên gần như trơn → điểm nào lệch hẳn màu trời là xe; dưới đường chân trời, xe (lốp, chân
 * chống) tối hơn mặt đường rõ rệt. Bóng xe trên mặt đường được chuyển sang lớp xe (chạy theo xe).
 * Nếu thay ảnh hero dọc khác, chỉnh BIKE_BOX và HORIZON rồi chạy lại, xem kết quả bằng mắt.
 */
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "../..");
const SRC = path.join(ROOT, "public/lobby/hero-mobile.webp");
const OUT_EMPTY = path.join(ROOT, "public/lobby/hero-mobile-empty.webp");
const OUT_BIKE = path.join(ROOT, "public/lobby/hero-mobile-bike.webp");

/** Vùng chứa xe (px trên ảnh 1080×1920), rộng hơn xe một chút */
const BIKE_BOX = { x0: 120, x1: 1060, y0: 780, y1: 1400 };
/** Hàng ảnh nơi trời giáp mặt đường */
const HORIZON = 1288;
/** Bóng xe đổ về bên trái trên mặt đường */
const SHADOW_BOX = { x0: 0, x1: 1080, y0: HORIZON, y1: 1500 };

const { data, info } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;
const at = (x, y) => (y * W + x) * 3;
const lum = (i) => 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
const median = (a) => a.sort((p, q) => p - q)[a.length >> 1];

// Màu trời mỗi hàng: nội suy giữa dải bên trái và bên phải vùng xe (trời có thể đổi màu nhẹ theo chiều ngang)
const skyAt = (y) => {
  const side = (xa, xb) => [0, 1, 2].map((c) => median(Array.from({ length: xb - xa }, (_, k) => data[at(xa + k, y) + c])));
  return { left: side(10, 100), right: side(1065, 1078) };
};
const skyColor = (row, x) => {
  const t = Math.min(1, Math.max(0, (x - 55) / (1072 - 55)));
  return [0, 1, 2].map((c) => row.left[c] * (1 - t) + row.right[c] * t);
};

// 1. Mặt nạ xe (0–1)
const mask = new Float32Array(W * H);
for (let y = BIKE_BOX.y0; y < BIKE_BOX.y1; y++) {
  // Vài hàng sát chân trời trộn màu trời + mặt đường → so theo luật mặt đường để không bắt nhầm cả đường kẻ ngang
  const row = y < HORIZON - 6 ? skyAt(y) : null;
  // Mặt đường hàng này: lấy ở mép phải ngoài vùng bóng đổ cho chuẩn độ sáng
  const roadLum = !row ? median(Array.from({ length: 80 }, (_, k) => lum(at(1000 + (k % 70), y)))) : 0;
  for (let x = BIKE_BOX.x0; x < BIKE_BOX.x1; x++) {
    const i = at(x, y);
    let a;
    if (row) {
      const s = skyColor(row, x);
      const d = Math.hypot(data[i] - s[0], data[i + 1] - s[1], data[i + 2] - s[2]);
      a = Math.min(1, Math.max(0, (d - 14) / 22));
    } else {
      // Dưới chân trời: lốp, chân chống tối hơn mặt đường nhiều (bóng đổ chỉ tối hơn vừa phải)
      a = Math.min(1, Math.max(0, (roadLum - lum(i) - 95) / 30));
    }
    // Bỏ điểm gần như trong suốt (vệt nứt mặt đường, nhiễu) — chỉ giữ thân xe
    mask[y * W + x] = a < 0.3 ? 0 : a;
  }
}

// 2. Nới mặt nạ 2px để vá không còn viền xe mờ trên nền
const grown = new Float32Array(mask);
for (let y = BIKE_BOX.y0; y < BIKE_BOX.y1; y++)
  for (let x = BIKE_BOX.x0; x < BIKE_BOX.x1; x++) {
    let m = 0;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) m = Math.max(m, mask[(y + dy) * W + x + dx] ?? 0);
    grown[y * W + x] = m;
  }

// 3. Lớp xe: màu gốc + alpha theo mặt nạ
const bike = Buffer.alloc(W * H * 4);
for (let p = 0; p < W * H; p++) {
  bike[p * 4] = data[p * 3];
  bike[p * 4 + 1] = data[p * 3 + 1];
  bike[p * 4 + 2] = data[p * 3 + 2];
  bike[p * 4 + 3] = Math.round(mask[p] * 255);
}

// 4. Nền không có xe: vá trời bằng màu trời nội suy, vá mặt đường bằng mẫu mặt đường cùng hàng ở bên phải
const empty = Buffer.from(data);
for (let y = BIKE_BOX.y0; y < BIKE_BOX.y1; y++) {
  const row = y < HORIZON ? skyAt(y) : null;
  for (let x = BIKE_BOX.x0; x < BIKE_BOX.x1; x++) {
    const g = grown[y * W + x];
    if (g <= 0) continue;
    const i = at(x, y);
    const fill = row
      ? skyColor(row, x)
      : (() => {
          const j = at(1000 + (x % 70), y);
          return [data[j], data[j + 1], data[j + 2]];
        })();
    for (let c = 0; c < 3; c++) empty[i + c] = Math.round(data[i + c] * (1 - g) + fill[c] * g);
  }
}
// Bóng xe: kéo độ sáng mặt đường về bằng mặt đường cùng hàng (bóng mất khỏi nền)
for (let y = SHADOW_BOX.y0; y < SHADOW_BOX.y1; y++) {
  const j = at(1040, y);
  const ref = 0.299 * data[j] + 0.587 * data[j + 1] + 0.114 * data[j + 2];
  for (let x = SHADOW_BOX.x0; x < SHADOW_BOX.x1; x++) {
    const i = at(x, y);
    const l = 0.299 * empty[i] + 0.587 * empty[i + 1] + 0.114 * empty[i + 2];
    if (l >= ref - 4 || l < 30) continue;
    const k = Math.min(1.8, ref / Math.max(1, l));
    for (let c = 0; c < 3; c++) empty[i + c] = Math.min(255, Math.round(empty[i + c] * k));
    // Bóng chuyển sang lớp xe (chạy theo xe, không để xe trông lơ lửng): màu nâu sẫm, độ đậm = phần ánh sáng bị che
    const p = y * W + x;
    if (mask[p] >= 0.5) continue;
    const a = Math.min(0.85, Math.max(0, 1 - l / ref));
    bike[p * 4] = 34;
    bike[p * 4 + 1] = 28;
    bike[p * 4 + 2] = 22;
    bike[p * 4 + 3] = Math.max(bike[p * 4 + 3], Math.round(a * 255));
  }
}

await sharp(empty, { raw: { width: W, height: H, channels: 3 } }).webp({ quality: 80, effort: 6 }).toFile(OUT_EMPTY);
await sharp(bike, { raw: { width: W, height: H, channels: 4 } }).webp({ quality: 82, alphaQuality: 90, effort: 6 }).toFile(OUT_BIKE);
console.log(`✓ ${path.relative(ROOT, OUT_EMPTY)}\n✓ ${path.relative(ROOT, OUT_BIKE)}\nMở 2 ảnh xem bằng mắt: nền không còn xe, lớp xe không dính mảng trời.`);
