"use client";

import { useState } from "react";
import { Check, ClipboardCheck, X } from "lucide-react";
import { useToast } from "@/store/hooks";
import { useBins } from "@/store/use-bins";
import { EmptyState } from "@/components/greencity/EmptyState";
import { SmartImage } from "@/components/greencity/SmartImage";
import { ChoiceChip, buttonClass, inputClass } from "@/components/greencity/ui";
import { BIN_TYPE_LABEL, DROPOFF_REJECT_REASONS, DROPOFF_STATUS_LABEL } from "@/data/bins";
import { POINT_RULES } from "@/data/point-rules";
import { BIN_RULE_ID } from "@/lib/bins";
import type { Dropoff } from "@/types/features";
import { formatRelativeTime } from "@/utils/format";
import { cn } from "@/lib/utils";
import { BIN_TYPE_BADGE, DROPOFF_BADGE, badgeBase } from "@/features/bins/styles";

/** Hàng chờ kiểm tra lượt bỏ đồ vào thùng (I.2, II.1). */
export function DropoffQueue() {
  const { dropoffs } = useBins();
  const waiting = dropoffs.filter((d) => d.status === "cho-kiem-tra");
  const recent = dropoffs.filter((d) => d.status !== "cho-kiem-tra").slice(0, 5);

  return (
    <div>
      {waiting.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title="Không còn lượt nào chờ kiểm tra" description="Lượt bỏ đồ mới sẽ hiện ở đây." />
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {waiting.map((d) => (
            <DropoffReview key={d.id} dropoff={d} />
          ))}
        </ul>
      )}
      {recent.length > 0 && (
        <>
          <h4 className="mt-8 text-[15px] font-bold text-foreground">Vừa kiểm tra</h4>
          <ul className="mt-2 flex flex-col gap-2">
            {recent.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-border bg-card px-4 py-2.5 text-[14px]">
                <span className="min-w-0 flex-1 text-foreground">
                  {d.userName} · {d.material} · <span className="font-mono">{d.binCode}</span>
                  {d.rejectReason && <span className="text-muted-foreground"> · {d.rejectReason}</span>}
                </span>
                <span className={cn(badgeBase, DROPOFF_BADGE[d.status])}>{DROPOFF_STATUS_LABEL[d.status]}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function DropoffReview({ dropoff: d }: { dropoff: Dropoff }) {
  const { reviewDropoff } = useBins();
  const toast = useToast();
  const rule = POINT_RULES.find((r) => r.id === BIN_RULE_ID[d.binType]);
  const byKg = rule?.unit === "kg";
  const [kg, setKg] = useState(String(d.estKg));
  const [rejecting, setRejecting] = useState(false);

  const approve = () => {
    const actual = Number(kg.replace(",", "."));
    reviewDropoff(d.id, "dat", { actualKg: byKg && actual > 0 ? actual : undefined });
    toast("success", "Đã duyệt", `${d.userName} · ${d.material}`);
  };
  const reject = (reason: string) => {
    reviewDropoff(d.id, "khong-dat", { reason });
    toast("info", "Đã ghi không đạt", reason);
  };

  return (
    <li className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[15px] font-bold text-foreground">{d.userName}</p>
          <p className="text-[13px] text-muted-foreground">{formatRelativeTime(d.at)}</p>
        </div>
        <span className={cn(badgeBase, BIN_TYPE_BADGE[d.binType])}>
          {BIN_TYPE_LABEL[d.binType]} · {d.binCode}
        </span>
      </div>
      <p className="mt-3 text-[14px] text-foreground">
        {d.material}, ước tính <strong>{d.estKg.toLocaleString("vi-VN")}kg</strong>
        {d.capped ? <span className="text-muted-foreground"> · không tính điểm (đã đủ lượt trong ngày)</span> : <span className="text-primary"> · +{d.points} điểm nếu đạt</span>}
      </p>
      {d.photos.length > 0 && (
        <div className="mt-3 flex gap-2">
          {d.photos.map((src, i) => (
            <SmartImage key={i} src={src} alt={`Ảnh ${i + 1} người bỏ chụp`} className="h-20 w-20 rounded-xl border border-border" sizes="80px" />
          ))}
        </div>
      )}

      {rejecting ? (
        <div className="mt-4">
          <p className="mb-2 text-[13px] font-semibold text-foreground">Lý do không đạt</p>
          <div className="flex flex-wrap gap-2">
            {DROPOFF_REJECT_REASONS.map((r) => (
              <ChoiceChip key={r} selected={false} onClick={() => reject(r)}>
                {r}
              </ChoiceChip>
            ))}
          </div>
          <button type="button" onClick={() => setRejecting(false)} className={cn(buttonClass.ghost, "mt-2 text-muted-foreground")}>
            Quay lại
          </button>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-end gap-2">
          {byKg && !d.capped && (
            <div className="w-28">
              <label htmlFor={`kg-${d.id}`} className="mb-1 block text-[12px] font-semibold text-muted-foreground">
                Kg kiểm lại
              </label>
              <input id={`kg-${d.id}`} inputMode="decimal" value={kg} onChange={(e) => setKg(e.target.value.replace(/[^0-9.,]/g, ""))} className={cn(inputClass(), "h-11")} />
            </div>
          )}
          <button type="button" onClick={approve} className={cn(buttonClass.primary, "min-h-11 flex-1")}>
            <Check className="h-4 w-4" aria-hidden="true" />
            Đạt
          </button>
          <button type="button" onClick={() => setRejecting(true)} className={cn(buttonClass.secondary, "min-h-11 hover:border-destructive/50 hover:text-destructive")}>
            <X className="h-4 w-4" aria-hidden="true" />
            Không đạt
          </button>
        </div>
      )}
    </li>
  );
}
