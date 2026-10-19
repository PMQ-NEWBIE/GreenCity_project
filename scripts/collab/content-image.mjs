/**
 * CHUYỂN ẢNH THÔ SANG WEBP CHO NỘI DUNG
 *
 *   npm run content:image -- <ảnh vào.png> <ảnh ra.webp> <rộng> <cao>
 *   ví dụ: npm run content:image -- assets-src/content/learn/u-phan.png public/content/learn/u-phan.webp 1200 900
 *
 * Cắt vừa khung (giữ vùng đáng chú ý), xuất WebP chất lượng 72; nếu > 150KB thì hạ dần
 * chất lượng, thấp nhất 50. Vẫn vượt thì báo FAIL (ảnh quá nhiều chi tiết vụn — tạo lại gọn hơn).
 */
import { mkdirSync, statSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const [input, output, w, h] = process.argv.slice(2);
const width = Number(w);
const height = Number(h);
if (!input || !output || !width || !height || !output.endsWith(".webp")) {
  console.error("Cách dùng: npm run content:image -- <vào.png> <ra.webp> <rộng> <cao>");
  process.exit(2);
}
if (!output.replaceAll("\\", "/").startsWith("public/content/")) {
  console.error('Ảnh ra phải nằm trong "public/content/".');
  process.exit(2);
}

const MAX_KB = 150;
mkdirSync(path.dirname(output), { recursive: true });

let quality = 72;
let kb = Infinity;
while (quality >= 50) {
  await sharp(input)
    .resize(width, height, { fit: "cover", position: sharp.strategy.attention })
    .webp({ quality, effort: 6 })
    .toFile(output);
  kb = Math.round(statSync(output).size / 1024);
  if (kb <= MAX_KB) break;
  quality -= 4;
}

if (kb > MAX_KB) {
  console.log(`✗ FAIL  ${output}: ${kb}KB > ${MAX_KB}KB kể cả ở chất lượng 50. Tạo lại ảnh ít chi tiết vụn hơn.`);
  process.exit(1);
}
console.log(`✓ ${output}  ${width}×${height}  ${kb}KB  (chất lượng ${quality})`);
