/**
 * KIỂM TRA VÙNG FILE — Gemini và Claude làm chung thư mục C:\123, chung nhánh main.
 *
 *   npm run collab:check -- gemini      (Gemini chạy trước mỗi lần commit)
 *   npm run collab:check -- claude      (Claude chạy trước mỗi lần commit)
 *
 * Kiểm 2 thứ:
 *   1. File đang được stage (git add) — chỉ được nằm trong vùng của bên đang commit.
 *   2. Các commit của bên đó từ tag `nen-mong` tới giờ (nhận ra qua tiền tố [gemini] / [claude]).
 * File đang sửa nhưng chưa stage KHÔNG bị xét: đó có thể là việc dở của bên kia trong cùng thư mục.
 * Thoát mã 1 nếu có file nằm sai vùng.
 */
import { execFileSync } from "node:child_process";
import { GEMINI_AREAS, isGeminiPath } from "./areas.mjs";

const side = process.argv[2];
if (side !== "gemini" && side !== "claude") {
  console.error("Cách dùng: npm run collab:check -- <gemini|claude>");
  process.exit(2);
}
const BASE = "nen-mong";

const git = (...args) =>
  execFileSync("git", ["-c", "core.quotepath=false", ...args], { encoding: "utf8" })
    .split("\n")
    .map((l) => l.trimEnd())
    .filter(Boolean);

const outside = (f) => (side === "gemini" ? !isGeminiPath(f) : isGeminiPath(f));

// 1. File đang stage
const staged = git("diff", "--cached", "--name-only");
const badStaged = staged.filter(outside);

// 2. Commit của bên này kể từ nền móng
const badCommits = [];
let ownCommits = 0;
for (const line of git("log", "--format=%H %s", `${BASE}..HEAD`)) {
  const [hash, ...rest] = line.split(" ");
  const subject = rest.join(" ");
  if (!subject.startsWith(`[${side}]`)) continue;
  ownCommits++;
  const files = git("diff-tree", "--no-commit-id", "--name-only", "-r", hash).filter(outside);
  if (files.length) badCommits.push({ hash: hash.slice(0, 7), subject, files });
}

// Thông tin thêm: file trong vùng của mình còn chưa commit
const dirtyOwn = git("status", "--porcelain", "-uall")
  .map((l) => l.slice(3).split(" -> ").pop().replace(/^"|"$/g, ""))
  .filter((f) => !outside(f));

console.log(`Bên kiểm tra: ${side} · file đang stage: ${staged.length} · commit [${side}] từ ${BASE}: ${ownCommits}`);
if (dirtyOwn.length) console.log(`(Còn ${dirtyOwn.length} file trong vùng của ${side} chưa commit.)`);

if (badStaged.length === 0 && badCommits.length === 0) {
  console.log("\n✓ ĐẠT — không có file nào nằm ngoài vùng được phép.");
  process.exit(0);
}

if (badStaged.length) {
  console.log(`\n✗ FAIL — ${badStaged.length} file đang stage nằm ngoài vùng của ${side}:`);
  for (const f of badStaged) console.log(`   ${f}`);
  console.log(`\nBỏ stage (KHÔNG xóa thay đổi): git restore --staged -- <đường dẫn>`);
}
for (const c of badCommits) {
  console.log(`\n✗ FAIL — commit ${c.hash} "${c.subject}" sửa file ngoài vùng:`);
  for (const f of c.files) console.log(`   ${f}`);
}
if (side === "gemini") {
  console.log("\nVùng của Gemini:");
  for (const a of GEMINI_AREAS) console.log(`   ${a}`);
  console.log("\nCần Claude đổi gì thì ghi vào docs/collab/gemini-yeu-cau.md.");
} else {
  console.log("\nĐó là file của Gemini. Ghi yêu cầu vào docs/collab/claude-thong-bao.md.");
}
process.exit(1);
