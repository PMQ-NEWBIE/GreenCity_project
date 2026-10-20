/**
 * ĐƯỜNG TÂM NÉT BÚT cho từng chữ cái của font BeVietnamPro-ExtraBold (đơn vị font, trục y hướng xuống,
 * gốc = gốc glyph). Mỗi chữ là danh sách nét, theo đúng thứ tự và chiều tay viết.
 * Ngòi bút tròn rộng INK_PEN chạy dọc các đường này → mask lộ ra phần thân chữ đi qua.
 *
 * Cú pháp mỗi nét (chuỗi):
 *   M x y            đặt bút
 *   L x y            đường thẳng
 *   C x1 y1 x2 y2 x y  đường cong bậc ba
 *   E cx cy rx ry a0 a1  cung elip từ góc a0 tới a1 (độ; 0 = phải, 90 = xuống dưới).
 *                        a1 < a0 = ngược chiều kim đồng hồ trên màn hình (chiều viết chữ o, c, a).
 *                        Nếu nét bắt đầu bằng E thì bút đặt ở điểm đầu cung.
 *
 * Dấu thanh, dấu mũ, chấm chữ i không khai ở đây: build.mjs tự lấy đường giữa từ đường viền của dấu.
 * Kiểm tra độ phủ: `npm run ink:check` (ảnh ra assets-src/ink/_check/skeleton-*.png).
 */

const BOWL_L = "E 326 -265 193 205 -60 -300"; // bụng trái của a, d, đ (bắt đầu sát thân, viết ngược chiều kim đồng hồ)
const BOWL_R = "E 341 -265 193 205 -120 120"; // bụng phải của b, p (từ thân vòng ra phải)
const ARCH = (x0, stem, x1) =>
  `M${x0} -350 C${x0 + 40} -440 ${x0 + 100} -469 ${x0 + 160} -469 C${stem - 50} -469 ${x1} -420 ${x1} -320 L${x1} 0`;

export const SKELETONS = {
  a: [BOWL_L, "M519 -530 L519 0"],
  b: ["M148 -760 L148 0", BOWL_R],
  c: ["E 316 -265 185 205 -20 -340"],
  d: [BOWL_L, "M519 -760 L519 0"],
  đ: [BOWL_L, "M519 -760 L519 0", "M310 -622 L685 -622"],
  e: ["M133 -268 L491 -266 E 312 -266 179 210 0 -332"],
  g: ["E 326 -276 193 193 -60 -300", "M519 -530 L519 -10 E 330 -10 189 155 0 165"],
  h: ["M148 -760 L148 0", ARCH(160, 474, 474)],
  i: ["M149 -530 L149 0"],
  k: ["M148 -760 L148 0", "M488 -530 L245 -275 L492 0"],
  l: ["M148 -760 L148 0"],
  m: ["M137 -530 L137 0", ARCH(150, 444, 444), ARCH(457, 751, 751)],
  n: ["M137 -530 L137 0", ARCH(150, 463, 463)],
  o: ["E 329 -265 196 205 -80 -450"],
  p: ["M146 -530 L146 192", BOWL_R],
  r: ["M138 -530 L138 0", "M150 -320 C170 -420 240 -462 330 -462 L414 -458"],
  t: ["M199 -660 L199 -180 C199 -90 240 -62 320 -62 L414 -66", "M27 -460 L392 -460"],
  u: ["M137 -530 L137 -220 C137 -110 195 -62 275 -62 C370 -62 453 -130 453 -260", "M453 -530 L453 0"],
  ư: [
    "M137 -530 L137 -220 C137 -110 195 -62 275 -62 C370 -62 453 -130 453 -260",
    "M453 -530 L453 0",
    "M588 -645 L588 -545 C588 -480 540 -470 470 -470",
  ],
  ơ: ["E 329 -265 196 205 -80 -450", "M560 -652 L560 -560 C560 -500 530 -480 490 -470"],
  v: ["M104 -530 L293 0 L492 -530"],
  y: ["M104 -530 L270 -60", "M493 -530 L300 0 C270 90 220 124 150 124 L50 124"],
  B: [
    "M148 -740 L148 0",
    "M148 -668 L400 -668 C510 -668 560 -620 560 -525 C560 -440 510 -382 400 -382 L300 -382 C520 -382 586 -320 586 -230 C586 -130 520 -72 400 -72 L148 -72",
  ],
  Đ: [
    "M174 -740 L174 0",
    "M174 -664 L380 -664 C560 -664 650 -540 650 -370 C650 -200 560 -77 380 -77 L174 -77",
    "M8 -370 L392 -370",
  ],
  G: ["E 393 -369 271 303 -25 -360 L420 -335"],
  N: ["M149 0 L149 -700 L600 -40 L600 -740"],
  T: ["M36 -666 L658 -666", "M346 -666 L346 0"],
  ",": ["M180 -95 L170 -20 L110 140"],
  ".": ["M174 -100 L174 -70"],
  "?": [
    "M134 -505 C134 -620 210 -673 310 -673 C420 -673 490 -620 490 -550 C490 -450 313 -400 313 -300 L313 -230",
    "M313 -95 L313 -75",
  ],
  0: ["E 353 -370 229 303 -90 -460"],
  1: ["M45 -566 C150 -590 220 -640 271 -720 L271 0"],
  2: [
    "M128 -490 C128 -610 210 -673 320 -673 C440 -673 511 -600 511 -500 C511 -400 440 -340 340 -260 L125 -100 L125 -74 L600 -74",
  ],
  3: [
    "M150 -505 C150 -610 230 -673 340 -673 C450 -673 530 -620 530 -540 C530 -440 450 -375 300 -375 L360 -375 C480 -375 540 -320 540 -215 C540 -110 450 -62 340 -62 C230 -62 140 -110 135 -220",
  ],
};

/* ---------- Dựng nét: chuỗi lệnh → path SVG + các điểm lấy mẫu ---------- */

const r = (n) => Math.round(n);
const num = (n) => {
  const v = r(n);
  return v < 0 ? `${v}` : ` ${v}`;
};

/**
 * Dịch nét sang vị trí (dx) → { d, pts } với pts là các điểm cách nhau ~step đơn vị
 * (dùng để đo độ dài và rải chồi lá).
 */
export function buildStroke(src, dx, step = 12) {
  const tok = src.match(/[MLCE]|-?\d*\.?\d+/g);
  let i = 0;
  const n = () => Number(tok[i++]);
  let d = "";
  const pts = [];
  let cx = 0;
  let cy = 0;
  const push = (x, y) => pts.push([x + dx, y]);
  const sampleTo = (fn, len) => {
    const k = Math.max(2, Math.ceil(len / step));
    for (let s = 1; s <= k; s++) push(...fn(s / k));
  };
  while (i < tok.length) {
    const op = tok[i++];
    if (op === "M") {
      cx = n();
      cy = n();
      d += `M${r(cx + dx)}${num(cy)}`;
      push(cx, cy);
    } else if (op === "L") {
      const x = n();
      const y = n();
      const x0 = cx;
      const y0 = cy;
      sampleTo((t) => [x0 + (x - x0) * t, y0 + (y - y0) * t], Math.hypot(x - x0, y - y0));
      d += `L${r(x + dx)}${num(y)}`;
      cx = x;
      cy = y;
    } else if (op === "C") {
      const [x1, y1, x2, y2, x, y] = [n(), n(), n(), n(), n(), n()];
      const x0 = cx;
      const y0 = cy;
      const at = (t) => {
        const m = 1 - t;
        return [
          m * m * m * x0 + 3 * m * m * t * x1 + 3 * m * t * t * x2 + t * t * t * x,
          m * m * m * y0 + 3 * m * m * t * y1 + 3 * m * t * t * y2 + t * t * t * y,
        ];
      };
      const rough = Math.hypot(x1 - x0, y1 - y0) + Math.hypot(x2 - x1, y2 - y1) + Math.hypot(x - x2, y - y2);
      sampleTo(at, rough);
      d += `C${r(x1 + dx)}${num(y1)}${num(x2 + dx)}${num(y2)}${num(x + dx)}${num(y)}`;
      cx = x;
      cy = y;
    } else if (op === "E") {
      const [ex, ey, rx, ry, a0, a1] = [n(), n(), n(), n(), n(), n()];
      const at = (deg) => [ex + rx * Math.cos((deg * Math.PI) / 180), ey + ry * Math.sin((deg * Math.PI) / 180)];
      const [sx, sy] = at(a0);
      if (!d) {
        d += `M${r(sx + dx)}${num(sy)}`;
        push(sx, sy);
      } else if (Math.hypot(sx - cx, sy - cy) > 1) {
        d += `L${r(sx + dx)}${num(sy)}`;
        push(sx, sy);
      }
      const span = a1 - a0;
      const parts = Math.ceil(Math.abs(span) / 170);
      for (let p = 1; p <= parts; p++) {
        const [x, y] = at(a0 + (span * p) / parts);
        d += `A${rx} ${ry} 0 0 ${span > 0 ? 1 : 0}${num(x + dx)}${num(y)}`;
      }
      const len = (Math.abs(span) * Math.PI * (rx + ry)) / 360;
      sampleTo((t) => at(a0 + span * t), len);
      [cx, cy] = at(a1);
    } else {
      throw new Error(`Lệnh nét không hiểu: "${op}" trong "${src}"`);
    }
  }
  let len = 0;
  for (let k = 1; k < pts.length; k++) len += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
  return { d, pts, len: Math.round(len) };
}

/**
 * Đường giữa của một dấu (sắc, huyền, ngã, hỏi, mũ, chấm…) lấy từ đường viền:
 * cắt dấu thành các lát dọc theo chiều dài, lấy trung điểm mỗi lát.
 * Dấu nằm ngang (mũ, ngã) viết trái → phải; dấu đứng viết trên → dưới.
 */
export function markCenterline(outlinePts) {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const [x, y] of outlinePts) {
    x0 = Math.min(x0, x);
    x1 = Math.max(x1, x);
    y0 = Math.min(y0, y);
    y1 = Math.max(y1, y);
  }
  const w = x1 - x0;
  const h = y1 - y0;
  if (Math.max(w, h) < 140) {
    // Dấu nhỏ (chấm): một nét ngắn ở tâm
    const mx = (x0 + x1) / 2;
    const my = (y0 + y1) / 2;
    return `M${r(mx)} ${r(my - 12)} L${r(mx)} ${r(my + 12)}`;
  }
  const horiz = w >= h;
  const bins = Math.max(3, Math.round(Math.max(w, h) / 45));
  const lo = new Array(bins).fill(Infinity);
  const hi = new Array(bins).fill(-Infinity);
  for (const [x, y] of outlinePts) {
    const along = horiz ? (x - x0) / w : (y - y0) / h;
    const b = Math.min(bins - 1, Math.floor(along * bins));
    const across = horiz ? y : x;
    lo[b] = Math.min(lo[b], across);
    hi[b] = Math.max(hi[b], across);
  }
  const pts = [];
  for (let b = 0; b < bins; b++) {
    if (lo[b] === Infinity) continue;
    const along = (horiz ? x0 : y0) + ((b + 0.5) / bins) * (horiz ? w : h);
    const across = (lo[b] + hi[b]) / 2;
    pts.push(horiz ? [along, across] : [across, along]);
  }
  // kéo hai đầu ra sát mép dấu
  const ext = (a, b) => {
    const len = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1;
    const k = (Math.max(w, h) / bins) * 0.5;
    return [a[0] + ((a[0] - b[0]) / len) * k, a[1] + ((a[1] - b[1]) / len) * k];
  };
  if (pts.length >= 2) {
    pts[0] = ext(pts[0], pts[1]);
    pts[pts.length - 1] = ext(pts[pts.length - 1], pts[pts.length - 2]);
  }
  return pts.map(([x, y], k) => `${k ? "L" : "M"}${r(x)} ${r(y)}`).join(" ");
}

/** Chữ gốc dùng để tra SKELETONS: bỏ dấu thanh/dấu mũ, giữ móc ư/ơ và đ/Đ */
export function skeletonKey(ch) {
  const nfd = ch.normalize("NFD");
  const base = nfd[0];
  if (nfd.includes("̛")) return base === "u" ? "ư" : base === "o" ? "ơ" : base;
  if (base === "i" || base === "ı") return "i";
  return base;
}
