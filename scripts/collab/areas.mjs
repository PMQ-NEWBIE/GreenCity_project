/**
 * Vùng file của Gemini. Mọi thứ khác thuộc về Claude.
 * Giữ khớp với mục "FILE CỦA BẠN" trong docs/prompt-gemini-tinh-nang-co-ban.md.
 */
export const GEMINI_AREAS = [
  "src/features/learn/",
  "src/features/points/",
  "src/features/rewards/",
  "src/features/green-shops/",
  "src/features/swap/",
  "src/data/knowledge.ts",
  "src/data/green-shops.ts",
  "public/content/",
  "assets-src/content/",
  "docs/collab/gemini-yeu-cau.md",
  "docs/collab/gemini-bao-cao.md",
];

export function isGeminiPath(file) {
  const f = file.replaceAll("\\", "/");
  return GEMINI_AREAS.some((a) => (a.endsWith("/") ? f.startsWith(a) : f === a));
}
