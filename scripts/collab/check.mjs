/**
 * KIỂM TRA VÙNG FILE — chặn hai bên sửa nhầm file của nhau.
 *
 *   npm run collab:check -- gemini            (Gemini chạy trong C:\123, nhánh feat/co-ban)
 *   npm run collab:check -- claude            (Claude chạy trong C:\123-nang-cao, nhánh feat/nang-cao)
 *   npm run collab:check -- claude --base nen-mong
 *
 * File được xét = file đổi so với điểm tách nhánh (git diff <base>...HEAD)
 *               + file đang sửa/chưa commit (git status), kể cả file mới.
 * Thoát mã 1 nếu có file nằm sai vùng.
 */
import { execFileSync } from "node:child_process";
import { GEMINI_AREAS, isGeminiPath } from "./areas.mjs";

const side = process.argv[2];
if (side !== "gemini" && side !== "claude") {
  console.error('Cách dùng: npm run collab:check -- <gemini|claude> [--base <nhánh/tag>]');
  process.exit(2);
}
const baseIdx = process.argv.indexOf("--base");
const base = baseIdx > 0 ? process.argv[baseIdx + 1] : "main";

const git = (...args) =>
  execFileSync("git", ["-c", "core.quotepath=false", ...args], { encoding: "utf8" })
    .split("\n")
    .map((l) => l.trimEnd())
    .filter(Boolean);

const changed = new Set();
try {
  for (const f of git("diff", "--name-only", `${base}...HEAD`)) changed.add(f);
} catch {
  console.error(`Không so được với "${base}". Nhánh/tag này có tồn tại không?`);
  process.exit(2);
}
for (const line of git("status", "--porcelain", "-uall")) {
  // "XY path" hoặc "R  cũ -> mới"
  const p = line.slice(3);
  for (const part of p.split(" -> ")) changed.add(part.replace(/^"|"$/g, ""));
}

const files = [...changed].sort();
const bad = files.filter((f) => (side === "gemini" ? !isGeminiPath(f) : isGeminiPath(f)));

console.log(`Bên kiểm tra: ${side} · so với: ${base} · số file đã đổi: ${files.length}`);
if (bad.length === 0) {
  console.log("\n✓ ĐẠT — không có file nào nằm ngoài vùng được phép.");
  process.exit(0);
}

console.log(`\n✗ FAIL — ${bad.length} file nằm ngoài vùng của ${side}:`);
for (const f of bad) console.log(`   ${f}`);
if (side === "gemini") {
  console.log("\nVùng của Gemini:");
  for (const a of GEMINI_AREAS) console.log(`   ${a}`);
  console.log('\nHoàn tác file có sẵn: git checkout main -- <đường dẫn>. File mới lỡ tạo: xóa đi.');
  console.log("Cần Claude đổi gì thì ghi vào docs/collab/gemini-yeu-cau.md.");
} else {
  console.log("\nĐây là file của Gemini. Hoàn tác, rồi ghi yêu cầu vào docs/collab/claude-thong-bao.md.");
}
process.exit(1);
