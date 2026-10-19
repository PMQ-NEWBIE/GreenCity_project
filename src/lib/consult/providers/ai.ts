import { CONSULT_AI_ENABLED } from "../config";
import type { ClassifyProvider, ClassifyResult } from "../types";

/**
 * Nhận diện ảnh bằng AI qua route /api/tu-van-phan-loai (khóa API chỉ nằm ở server).
 * Khi chưa bật: trả về rỗng, không gọi mạng.
 */
export const aiProvider: ClassifyProvider = {
  name: "ai",
  enabled: CONSULT_AI_ENABLED,
  classify: async (input) => {
    if (!CONSULT_AI_ENABLED) return [];
    try {
      const res = await fetch("/api/tu-van-phan-loai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) return [];
      const data = (await res.json()) as { results?: ClassifyResult[] };
      return (data.results ?? []).map((r) => ({ ...r, source: "ai" as const }));
    } catch {
      return [];
    }
  },
};
