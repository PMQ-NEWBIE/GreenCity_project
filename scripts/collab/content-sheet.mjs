/**
 * BẢNG SOI ẢNH NỘI DUNG — ghép mọi ảnh /content/... thành lưới, mỗi ô ghi TÊN MỤC đang dùng ảnh đó.
 *
 *   npm run content:sheet
 *
 * Quét src/data/**\/*.ts tìm chuỗi "/content/....webp", lấy nhãn của mục chứa nó
 * (label trên cùng dòng → name/title gần nhất phía trên → tên khóa trên dòng), rồi xuất
 * assets-src/content/_sheet/<nhóm>.png (learn, rewards, shops, swap, products...).
 * Mở các file PNG đó ra NHÌN: ảnh có đúng thứ mà nhãn nói không.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "../..");
const DATA = path.join(ROOT, "src", "data");
const OUT = path.join(ROOT, "assets-src", "content", "_sheet");

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = path.join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".ts") ? [p] : [];
  });

/** đường dẫn ảnh → các nhãn đang dùng nó */
const uses = new Map();
for (const file of walk(DATA)) {
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const m of line.matchAll(/["'`](\/content\/[^"'`\s]+\.webp)["'`]/g)) {
      let label = line.match(/label:\s*"([^"]+)"/)?.[1];
      for (let j = i; !label && j >= Math.max(0, i - 15); j--) {
        label = lines[j].match(/^\s*(?:name|title):\s*"([^"]+)"/)?.[1];
      }
      label ??= line.match(/^\s*([A-Za-z0-9_]+):/)?.[1] ?? "?";
      if (!uses.has(m[1])) uses.set(m[1], new Set());
      uses.get(m[1]).add(label);
    }
  });
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const groups = new Map();
for (const [p, labels] of uses) {
  const g = p.split("/")[2];
  if (!groups.has(g)) groups.set(g, []);
  groups.get(g).push({ p, labels: [...labels] });
}

mkdirSync(OUT, { recursive: true });
const W = 360;
const IMG_H = 270;
const LABEL_H = 54;
const COLS = 4;
let missing = 0;

for (const [g, items] of groups) {
  items.sort((a, b) => a.p.localeCompare(b.p));
  const rows = Math.ceil(items.length / COLS);
  const tiles = [];
  for (const [i, it] of items.entries()) {
    const left = (i % COLS) * W;
    const top = Math.floor(i / COLS) * (IMG_H + LABEL_H);
    const file = path.join(ROOT, "public", it.p);
    const ok = existsSync(file);
    if (!ok) missing++;
    const name = path.basename(it.p);
    const label = it.labels.join(" · ");
    const svg = `<svg width="${W}" height="${LABEL_H}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#fff"/>
      <text x="6" y="21" font-size="16" font-weight="bold" font-family="Arial" fill="#111">${esc(label.slice(0, 40))}</text>
      <text x="6" y="44" font-size="13" font-family="Arial" fill="${ok ? "#555" : "#c00"}">${esc(ok ? name : "THIẾU FILE: " + name)}</text>
    </svg>`;
    tiles.push({ input: Buffer.from(svg), left, top });
    if (ok) {
      tiles.push({ input: await sharp(file).resize(W - 8, IMG_H - 8, { fit: "cover" }).toBuffer(), left: left + 4, top: top + LABEL_H + 4 });
    }
  }
  const out = path.join(OUT, `${g}.png`);
  await sharp({ create: { width: COLS * W, height: rows * (IMG_H + LABEL_H), channels: 3, background: "#d9d9d9" } })
    .composite(tiles)
    .png()
    .toFile(out);
  console.log(`✓ ${path.relative(ROOT, out).replaceAll("\\", "/")}  (${items.length} ảnh)`);
}
if (missing) {
  console.log(`✗ ${missing} ảnh được dùng trong src/data nhưng chưa có file.`);
  process.exit(1);
}
