import Link from "next/link";
import { Clock, MapPin, Map as MapIcon, Megaphone, Recycle } from "lucide-react";
import type { Bin } from "@/types/features";
import { BIN_LEVEL_LABEL, BIN_TYPE_LABEL } from "@/data/bins";
import { ROUTES } from "@/lib/routes";
import { formatRelativeTime } from "@/utils/format";
import { cn } from "@/lib/utils";
import { BIN_LEVEL_BADGE, BIN_TYPE_BADGE, badgeBase } from "./styles";

interface BinCardProps {
  bin: Bin;
  highlighted?: boolean;
  onDropoff: () => void;
  onReportFull: () => void;
}

export function BinCard({ bin, highlighted, onDropoff, onReportFull }: BinCardProps) {
  return (
    <li
      id={`thung-${bin.id}`}
      className={cn(
        "flex flex-col rounded-2xl border bg-card p-4 transition-[border-color,box-shadow] duration-150",
        highlighted ? "border-primary shadow-md ring-4 ring-primary/15" : "border-border"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={cn(badgeBase, BIN_TYPE_BADGE[bin.type])}>{BIN_TYPE_LABEL[bin.type]}</span>
        <span className="font-mono text-[13px] font-bold text-muted-foreground">{bin.code}</span>
      </div>
      <h3 className="mt-3 text-[16px] font-bold leading-snug text-foreground">{bin.name}</h3>
      <p className="mt-1 flex items-start gap-1.5 text-[13px] text-muted-foreground">
        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {bin.address}, {bin.area}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className={cn(badgeBase, BIN_LEVEL_BADGE[bin.level])}>{BIN_LEVEL_LABEL[bin.level]}</span>
        <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          Đổ {formatRelativeTime(bin.lastEmptiedAt).toLowerCase()}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
        <button
          type="button"
          onClick={onDropoff}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 text-[14px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Recycle className="h-4 w-4" aria-hidden="true" />
          Bỏ đồ
        </button>
        <button
          type="button"
          onClick={onReportFull}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-border px-3 text-[14px] font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary"
        >
          <Megaphone className="h-4 w-4" aria-hidden="true" />
          Báo đầy
        </button>
        <Link
          href={`${ROUTES.map}?thung=${bin.id}`}
          aria-label={`Xem thùng ${bin.code} trên bản đồ`}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-border text-foreground/80 transition-colors hover:border-primary/50 hover:text-primary"
        >
          <MapIcon className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </li>
  );
}
