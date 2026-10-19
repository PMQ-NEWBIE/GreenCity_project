import { SORTING_GUIDE } from "@/data/knowledge";
import { keywordClassify } from "../keyword";
import type { ClassifyProvider } from "../types";

/** Đang chạy: so mô tả của người hỏi với sổ tay phân loại (src/data/knowledge.ts). */
export const keywordProvider: ClassifyProvider = {
  name: "keyword",
  enabled: true,
  classify: async ({ description }) => keywordClassify(description, SORTING_GUIDE),
};
