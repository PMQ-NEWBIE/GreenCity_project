import type { WasteGroup } from "@/types/features";

/** Màu nhóm rác — khớp với Sổ tay phân loại của Gemini (chỉ dùng token). */
export const GROUP_BADGE: Record<WasteGroup, string> = {
  "tai-che": "bg-primary/10 text-primary",
  "thuc-pham": "bg-earth/15 text-earth",
  khac: "bg-muted-foreground/10 text-muted-foreground",
  "nguy-hai": "bg-destructive/10 text-destructive",
  "cong-kenh": "bg-warn/15 text-warn",
};
