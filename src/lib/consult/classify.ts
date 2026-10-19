import { aiProvider } from "./providers/ai";
import { keywordProvider } from "./providers/keyword";
import type { ClassifyInput, ClassifyResult } from "./types";

const PROVIDERS = [aiProvider, keywordProvider];

/** Chạy lần lượt các provider đang bật, gộp kết quả (AI trước), bỏ món trùng, tối đa 3. */
export async function classifyAll(input: ClassifyInput): Promise<ClassifyResult[]> {
  const out: ClassifyResult[] = [];
  for (const p of PROVIDERS) {
    if (!p.enabled) continue;
    for (const r of await p.classify(input)) {
      if (!out.some((x) => x.itemName === r.itemName)) out.push(r);
    }
  }
  return out.slice(0, 3);
}

export { CONSULT_AI_ENABLED } from "./config";
