import type { WasteGroup } from "@/types/features";

/** Màu nhóm rác — khớp với Sổ tay phân loại của Gemini (chỉ dùng token). */
export const GROUP_BADGE: Record<WasteGroup, string> = {
  "tai-che": "border border-primary/25 bg-primary/10 text-primary",
  "thuc-pham": "border border-brown-border bg-brown-soft text-brown-text dark:text-beige",
  khac: "border border-muted-foreground/25 bg-muted-foreground/10 text-muted-foreground",
  "nguy-hai": "border border-destructive/25 bg-destructive/10 text-destructive",
  "cong-kenh": "border border-warn/25 bg-warn/15 text-warn",
};
