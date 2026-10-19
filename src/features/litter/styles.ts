import type { LitterStatus } from "@/types/features";

export const LITTER_BADGE: Record<LitterStatus, string> = {
  "cho-xac-minh": "bg-warn/15 text-warn",
  "da-xac-minh": "bg-accent text-primary",
  "khong-hop-le": "bg-destructive/10 text-destructive",
  "da-don": "bg-muted text-muted-foreground",
};
