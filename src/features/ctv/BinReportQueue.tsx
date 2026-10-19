"use client";

import { Trash } from "lucide-react";
import { useToast } from "@/store/hooks";
import { useBins } from "@/store/use-bins";
import { EmptyState } from "@/components/greencity/EmptyState";
import { buttonClass } from "@/components/greencity/ui";
import { BIN_LEVEL_LABEL, BIN_TYPE_LABEL } from "@/data/bins";
import type { Bin, BinReport } from "@/types/features";
import { formatRelativeTime } from "@/utils/format";
import { cn } from "@/lib/utils";
import { BIN_LEVEL_BADGE, BIN_TYPE_BADGE, badgeBase } from "@/features/bins/styles";

/** Thùng đang bị báo đầy hoặc đang đi đổ (II.5) — xác nhận, báo sai, đổ thùng. */
export function BinReportQueue() {
  const { bins, reports } = useBins();
  const open = (b: Bin) => reports.filter((r) => r.binId === b.id && (r.status === "moi" || r.status === "da-xac-nhan"));
  const list = bins
    .filter((b) => b.level !== "binh-thuong" || open(b).length > 0)
    .sort((a, b) => Number(b.level === "day") - Number(a.level === "day"));

  if (list.length === 0) {
    return <EmptyState icon={Trash} title="Không có thùng nào bị báo đầy" description="Khi người dân báo thùng đầy, thùng đó sẽ hiện ở đây." />;
  }
  return (
    <ul className="grid gap-3 lg:grid-cols-2">
      {list.map((b) => (
        <BinRow key={b.id} bin={b} openReports={open(b)} />
      ))}
    </ul>
  );
}

function BinRow({ bin, openReports }: { bin: Bin; openReports: BinReport[] }) {
  const { confirmFull, rejectFull, startEmptying, markEmptied } = useBins();
  const toast = useToast();
  const total = openReports.reduce((n, r) => n + 1 + r.merged, 0);
  const hasNew = openReports.some((r) => r.status === "moi");
  const first = openReports.at(-1);

  return (
    <li className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[15px] font-bold text-foreground">
            <span className="font-mono">{bin.code}</span> · {bin.name}
          </p>
          <p className="text-[13px] text-muted-foreground">
            {bin.address}, {bin.area} · CTV phụ trách: {bin.collaborator}
          </p>
        </div>
        <span className={cn(badgeBase, BIN_LEVEL_BADGE[bin.level])}>{BIN_LEVEL_LABEL[bin.level]}</span>
      </div>
      <p className="mt-3 flex flex-wrap items-center gap-2 text-[14px] text-foreground">
        <span className={cn(badgeBase, BIN_TYPE_BADGE[bin.type])}>{BIN_TYPE_LABEL[bin.type]}</span>
        {total > 0 ? (
          <span>
            {total} lượt báo{first && <>, đầu tiên {formatRelativeTime(first.at).toLowerCase()}</>}
            {openReports.length > 0 && <span className="text-muted-foreground"> · {openReports.map((r) => r.userName).join(", ")}</span>}
          </span>
        ) : (
          <span className="text-muted-foreground">Không có báo cáo mở</span>
        )}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {hasNew && (
          <button type="button" onClick={() => { confirmFull(bin.id); toast("success", `Đã xác nhận ${bin.code} đầy`, "Điểm của người báo đã được ghi nhận."); }} className={cn(buttonClass.primary, "min-h-11")}>
            Xác nhận đầy
          </button>
        )}
        {(bin.level === "sap-day" || bin.level === "day") && (
          <button type="button" onClick={() => { startEmptying(bin.id); toast("info", `Đội đang đi đổ ${bin.code}`); }} className={cn(buttonClass.secondary, "min-h-11")}>
            Đang đi đổ
          </button>
        )}
        {bin.level !== "binh-thuong" && (
          <button type="button" onClick={() => { markEmptied(bin.id); toast("success", `Đã đổ xong ${bin.code}`); }} className={cn(buttonClass.secondary, "min-h-11")}>
            Đã đổ xong
          </button>
        )}
        {openReports.length > 0 && (
          <button type="button" onClick={() => { rejectFull(bin.id); toast("info", `Báo cáo ${bin.code} chưa đúng`, "Thùng còn chỗ, điểm báo cáo không được tính."); }} className={cn(buttonClass.ghost, "min-h-11 text-destructive hover:bg-destructive/10")}>
            Báo sai
          </button>
        )}
      </div>
    </li>
  );
}
