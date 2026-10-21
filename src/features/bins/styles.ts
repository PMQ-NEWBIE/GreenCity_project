import type { BinLevel, BinReportStatus, BinType, DropoffStatus } from "@/types/features";

/** Màu nhãn — chỉ dùng token để đúng cả nền sáng lẫn tối. */
export const BIN_TYPE_BADGE: Record<BinType, string> = {
  "tai-che": "border border-primary/25 bg-primary/10 text-primary",
  "quan-ao": "border border-brown-border bg-brown-soft text-brown-text dark:text-beige",
  "huu-co": "border border-earth/30 bg-earth/15 text-earth",
};

export const BIN_LEVEL_BADGE: Record<BinLevel, string> = {
  "binh-thuong": "bg-primary/10 text-primary",
  "sap-day": "bg-warn/15 text-warn",
  day: "bg-destructive/10 text-destructive",
  "dang-xu-ly": "bg-muted text-muted-foreground",
};

export const DROPOFF_BADGE: Record<DropoffStatus, string> = {
  "cho-kiem-tra": "bg-warn/15 text-warn",
  dat: "bg-primary/10 text-primary",
  "khong-dat": "bg-destructive/10 text-destructive",
};

export const BIN_REPORT_BADGE: Record<BinReportStatus, string> = {
  moi: "bg-warn/15 text-warn",
  "da-xac-nhan": "bg-accent text-primary",
  "khong-dung": "bg-destructive/10 text-destructive",
  "da-xu-ly": "bg-muted text-muted-foreground",
};

export const badgeBase = "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[12px] font-bold";
