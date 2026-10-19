import { Check, X } from "lucide-react";
import type { PickupRequest } from "@/types/features";
import { PICKUP_STEP_LABEL } from "@/data/pickup";
import { PICKUP_FLOW, stepIndex } from "@/lib/pickup";
import { formatDateTime } from "@/utils/format";
import { cn } from "@/lib/utils";

/** Dòng thời gian 5 bước của đơn; đơn đã hủy thì dừng ở bước đang làm và thêm dòng "Đã hủy". */
export function PickupTimeline({ request: r }: { request: PickupRequest }) {
  const cancelled = r.status === "da-huy";
  const at = (s: string) => r.history.find((h) => h.status === s)?.at;
  // Đơn hủy: bước cuối đã tới là bước trước dòng hủy trong lịch sử
  const reached = cancelled
    ? Math.max(0, ...r.history.filter((h) => h.status !== "da-huy").map((h) => stepIndex(h.status)))
    : stepIndex(r.status);

  return (
    <ol className="flex flex-col">
      {PICKUP_FLOW.map((s, i) => {
        if (cancelled && i > reached) return null;
        const done = i < reached || (i === reached && (r.status === "hoan-tat" || cancelled));
        const current = !cancelled && i === reached && r.status !== "hoan-tat";
        const time = at(s);
        const last = cancelled ? false : i === PICKUP_FLOW.length - 1;
        return (
          <li key={s} className="relative flex gap-3 pb-5 last:pb-0">
            {!last && <span aria-hidden="true" className={cn("absolute left-[13px] top-7 h-[calc(100%-24px)] w-0.5", i < reached ? "bg-primary" : "bg-border")} />}
            <span
              className={cn(
                "relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-[12px] font-bold",
                done && "border-primary bg-primary text-primary-foreground",
                current && "border-primary bg-card text-primary",
                !done && !current && "border-border bg-card text-muted-foreground"
              )}
            >
              {done ? <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" /> : i + 1}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className={cn("text-[15px]", current ? "font-bold text-foreground" : done ? "font-semibold text-foreground" : "text-muted-foreground")}>
                {PICKUP_STEP_LABEL[s]}
                {current && <span className="sr-only"> (bước hiện tại)</span>}
              </p>
              {time && <p className="text-[13px] text-muted-foreground">{formatDateTime(time)}</p>}
            </div>
          </li>
        );
      })}
      {cancelled && (
        <li className="relative flex gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
            <X className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="text-[15px] font-bold text-destructive">Đã hủy</p>
            <p className="text-[13px] text-muted-foreground">
              {r.cancelReason}
              {at("da-huy") && <> · {formatDateTime(at("da-huy")!)}</>}
            </p>
          </div>
        </li>
      )}
    </ol>
  );
}
