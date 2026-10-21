"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Map as MapIcon, Recycle } from "lucide-react";
import { useBins } from "@/store/use-bins";
import { EmptyState } from "@/components/greencity/EmptyState";
import { PageContainer, PageIntro, buttonClass, inputClass } from "@/components/greencity/ui";
import { BIN_REPORT_STATUS_LABEL, BIN_TYPE_HINT, BIN_TYPE_LABEL, DROPOFF_STATUS_LABEL } from "@/data/bins";
import { POINT_RULES } from "@/data/point-rules";
import { BIN_RULE_ID } from "@/lib/bins";
import { ROUTES } from "@/lib/routes";
import { AREAS } from "@/types";
import type { Bin, BinType } from "@/types/features";
import { formatRelativeTime } from "@/utils/format";
import { cn } from "@/lib/utils";
import { BinCard } from "./BinCard";
import { DropoffModal } from "./DropoffModal";
import { FullReportModal } from "./FullReportModal";
import { BIN_REPORT_BADGE, BIN_TYPE_BADGE, DROPOFF_BADGE, badgeBase } from "./styles";

const TYPES: BinType[] = ["tai-che", "quan-ao", "huu-co"];

export function BinsView() {
  const { bins, myDropoffs, myReports } = useBins();
  const searchParams = useSearchParams();
  const focusId = searchParams.get("thung");
  const [type, setType] = useState<BinType | "all">("all");
  const [area, setArea] = useState("all");
  const [dropoffFor, setDropoffFor] = useState<string | undefined>();
  const [dropoffOpen, setDropoffOpen] = useState(false);
  const [fullFor, setFullFor] = useState<Bin | null>(null);

  // ?thung=<id> (từ bản đồ): cuộn tới thẻ thùng đó
  useEffect(() => {
    if (focusId) document.getElementById(`thung-${focusId}`)?.scrollIntoView({ block: "center" });
  }, [focusId]);

  const list = useMemo(
    () => bins.filter((b) => (type === "all" || b.type === type) && (area === "all" || b.area === area)),
    [bins, type, area]
  );
  const binCode = (id: string) => bins.find((b) => b.id === id)?.code ?? id;

  const openDropoff = (binId?: string) => {
    setDropoffFor(binId);
    setDropoffOpen(true);
  };

  return (
    <PageContainer>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageIntro title="Điểm bỏ đồ gần nhà">
          Bỏ ve chai, quần áo cũ, rác hữu cơ vào đúng thùng rồi ghi nhận ở đây. Cộng tác viên kiểm tra thùng xong, điểm vào
          tài khoản của bạn.
        </PageIntro>
        <div className="flex gap-2">
          <Link href={ROUTES.map} className={buttonClass.secondary}>
            <MapIcon className="h-[18px] w-[18px]" aria-hidden="true" />
            Bản đồ
          </Link>
          <button type="button" onClick={() => openDropoff()} className={buttonClass.primary}>
            <Recycle className="h-[18px] w-[18px]" aria-hidden="true" />
            Ghi nhận bỏ đồ
          </button>
        </div>
      </div>

      {/* 3 loại thùng + điểm (đọc từ POINT_RULES) */}
      <ul className="mt-6 grid gap-3 sm:grid-cols-3">
        {TYPES.map((t) => {
          const rule = POINT_RULES.find((r) => r.id === BIN_RULE_ID[t]);
          return (
            <li key={t} className="rounded-2xl border border-border bg-card p-4">
              <span className={cn(badgeBase, BIN_TYPE_BADGE[t])}>{BIN_TYPE_LABEL[t]}</span>
              <p className="mt-2 text-[14px] text-foreground/85">{BIN_TYPE_HINT[t]}.</p>
              {rule && (
                <p className="mt-2 text-[13px] font-semibold text-primary">
                  +{rule.points} điểm/{rule.unit}
                  {rule.dailyCap ? `, tối đa ${rule.dailyCap} lần mỗi ngày` : ""}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      {/* Bộ lọc */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Lọc theo loại thùng">
          {([{ key: "all", label: "Tất cả" }, ...TYPES.map((t) => ({ key: t, label: BIN_TYPE_LABEL[t] }))] as const).map((c) => (
            <button
              key={c.key}
              type="button"
              aria-pressed={type === c.key}
              onClick={() => setType(c.key)}
              className={cn(
                "min-h-11 rounded-full border px-4 text-[14px] font-semibold transition-colors duration-150",
                type === c.key ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground/80 hover:border-primary/50 hover:text-primary"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="sm:w-56">
          <label htmlFor="bins-area" className="sr-only">
            Khu vực
          </label>
          <select id="bins-area" value={area} onChange={(e) => setArea(e.target.value)} className={cn(inputClass(), "select-chevron cursor-pointer appearance-none")}>
            <option value="all">Mọi quận</option>
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-4 text-[15px] text-muted-foreground" aria-live="polite">
        <strong className="text-foreground">{list.length}</strong> thùng
      </p>
      {list.length > 0 ? (
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((b) => (
            <BinCard key={b.id} bin={b} highlighted={b.id === focusId} onDropoff={() => openDropoff(b.id)} onReportFull={() => setFullFor(b)} />
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Recycle}
          title="Chưa có thùng ở khu này"
          description="Thử chọn quận khác hoặc loại thùng khác."
          action={
            <button type="button" onClick={() => { setType("all"); setArea("all"); }} className={buttonClass.primary}>
              Xem tất cả thùng
            </button>
          }
        />
      )}

      {/* Hoạt động của tôi */}
      <section aria-labelledby="my-bin-activity" className="mt-10">
        <h3 id="my-bin-activity" className="text-[19px] font-bold text-foreground">
          Hoạt động của bạn
        </h3>
        {myDropoffs.length === 0 && myReports.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-border p-5 text-[14px] text-muted-foreground">
            Bạn chưa ghi nhận lần bỏ đồ hay báo thùng đầy nào. Lượt ghi nhận sẽ hiện ở đây cùng trạng thái kiểm tra.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {myDropoffs.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-border bg-card px-4 py-3">
                <p className="min-w-0 flex-1 text-[14px] text-foreground">
                  <strong>{d.material}</strong> · thùng <span className="font-mono">{d.binCode}</span>
                  <span className="block text-[12px] text-muted-foreground">
                    {formatRelativeTime(d.at)}
                    {d.rejectReason && <> · {d.rejectReason}</>}
                    {d.capped && <> · đã đủ lượt tính điểm trong ngày</>}
                  </span>
                </p>
                <span className={cn(badgeBase, DROPOFF_BADGE[d.status])}>{DROPOFF_STATUS_LABEL[d.status]}</span>
                <span className={cn("w-16 text-right text-[14px] font-bold tabular-nums", d.status === "khong-dat" || d.points === 0 ? "text-muted-foreground line-through" : "text-primary")}>
                  +{d.points}
                </span>
              </li>
            ))}
            {myReports.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-border bg-card px-4 py-3">
                <p className="min-w-0 flex-1 text-[14px] text-foreground">
                  Báo thùng <span className="font-mono">{binCode(r.binId)}</span> {r.level === "day" ? "đã đầy" : "sắp đầy"}
                  <span className="block text-[12px] text-muted-foreground">{formatRelativeTime(r.at)}</span>
                </p>
                <span className={cn(badgeBase, BIN_REPORT_BADGE[r.status])}>{BIN_REPORT_STATUS_LABEL[r.status]}</span>
                <span className={cn("w-16 text-right text-[14px] font-bold tabular-nums", r.status === "khong-dung" || r.points === 0 ? "text-muted-foreground line-through" : "text-primary")}>
                  +{r.points}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <DropoffModal open={dropoffOpen} onClose={() => setDropoffOpen(false)} initialBinId={dropoffFor} />
      <FullReportModal bin={fullFor} onClose={() => setFullFor(null)} />
    </PageContainer>
  );
}
