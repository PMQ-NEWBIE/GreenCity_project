/**
 * LIỆT KÊ ẢNH NỘI DUNG CÒN THIẾU
 *
 *   npm run content:missing
 *
 * Quét src/data/**\/*.ts tìm chuỗi "/content/..." rồi xem file đã có trong public/ chưa.
 * Thoát mã 1 nếu còn thiếu.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const DATA = path.join(ROOT, "src", "data");

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = path.join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".ts") ? [p] : [];
  });
}

const refs = new Map(); // đường dẫn ảnh → file dữ liệu nhắc tới nó
for (const file of walk(DATA)) {
  const text = readFileSync(file, "utf8");
  for (const m of text.matchAll(/["'`](\/content\/[^"'`\s]+)["'`]/g)) {
    if (!refs.has(m[1])) refs.set(m[1], path.relative(ROOT, file).replaceAll("\\", "/"));
  }
}

const missing = [...refs].filter(([p]) => !existsSync(path.join(ROOT, "public", p)));
console.log(`Ảnh được nhắc tới trong dữ liệu: ${refs.size}`);
if (missing.length === 0) {
  console.log("\n✓ Không thiếu ảnh nào (0).");
  process.exit(0);
}
console.log(`\nThiếu ${missing.length} ảnh:`);
for (const [p, from] of missing.sort()) console.log(`   public${p}   (từ ${from})`);
console.log(`\n✗ Còn thiếu ${missing.length} ảnh.`);
process.exit(1);
