import type { WasteGroup } from "@/features/contracts";

export function removeAccents(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

export function groupBadgeClass(group: WasteGroup): string {
  switch (group) {
    case "tai-che":
      return "bg-primary/10 text-primary border-primary/25";
    case "thuc-pham":
      return "bg-earth/10 text-earth border-earth/25";
    case "khac":
      return "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/25";
    case "nguy-hai":
      return "bg-destructive/10 text-destructive border-destructive/25";
    case "cong-kenh":
      return "bg-warn/10 text-warn border-warn/25";
  }
}
