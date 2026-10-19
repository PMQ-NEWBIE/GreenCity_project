/**
 * Gợi ý phân loại bằng so khớp từ khóa với sổ tay. Hàm thuần, chỉ import kiểu — test được bằng node --test.
 */
import type { ClassifyResult, SortingGuideItem } from "@/types/features";

/** Chữ thường, bỏ dấu, đ → d, gộp khoảng trắng. */
export function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Điểm khớp: cả cụm tên nằm trong mô tả (hoặc ngược lại) → cao; khớp từng từ → thấp hơn.
 * Trả về tối đa `limit` món, độ tin cậy 0–1.
 */
export function keywordClassify(text: string, guide: readonly SortingGuideItem[], limit = 3): ClassifyResult[] {
  const q = fold(text);
  if (q.length < 2) return [];
  const qWords = new Set(q.split(" ").filter((w) => w.length >= 2));
  const scored = guide
    .map((item) => {
      let best = 0;
      for (const name of [item.name, ...item.aliases]) {
        const n = fold(name);
        if (!n) continue;
        if (q === n) best = Math.max(best, 1);
        else if (q.includes(n) || n.includes(q)) best = Math.max(best, 0.8);
        else {
          const words = n.split(" ").filter((w) => w.length >= 2);
          const hit = words.filter((w) => qWords.has(w)).length;
          if (hit > 0) best = Math.max(best, 0.6 * (hit / Math.max(words.length, qWords.size)));
        }
      }
      return { item, score: best };
    })
    .filter((x) => x.score >= 0.2)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  return scored.map(({ item, score }) => ({
    group: item.group,
    itemName: item.name,
    guidance: item.prep + (item.note ? ` ${item.note}` : ""),
    confidence: Math.round(score * 100) / 100,
    source: "keyword",
  }));
}
