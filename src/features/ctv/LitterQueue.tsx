"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, MapPin, Megaphone, X } from "lucide-react";
import { useToast } from "@/store/hooks";
import { useLitter } from "@/store/use-litter";
import { EmptyState } from "@/components/greencity/EmptyState";
import { SmartImage } from "@/components/greencity/SmartImage";
import { ChoiceChip, buttonClass } from "@/components/greencity/ui";
import { LITTER_REJECT_REASONS, LITTER_SIZE, LITTER_STATUS_LABEL } from "@/data/litter";
import { ROUTES } from "@/lib/routes";
import type { LitterReport } from "@/types/features";
import { formatRelativeTime } from "@/utils/format";
import { cn } from "@/lib/utils";
import { LITTER_BADGE } from "@/features/litter/styles";

/**
 * Báo cáo điểm rác: cộng tác viên xác minh hoặc bác; `showCleanup` (nhóm vận hành) thêm
 * danh sách đã xác minh, chờ dọn.
 */
export function LitterQueue({ showCleanup = false }: { showCleanup?: boolean }) {
  const { reports } = useLitter();
  const waiting = reports.filter((r) => r.status === "cho-xac-minh");
  const toClean = reports.filter((r) => r.status === "da-xac-minh");

  return (
    <div>
      {waiting.length === 0 ? (
        <EmptyState icon={Megaphone} title="Không còn báo cáo chờ xác minh" description="Báo cáo điểm rác mới sẽ hiện ở đây." />
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {waiting.map((r) => (
            <LitterReview key={r.id} report={r} />
          ))}
        </ul>
      )}
      {showCleanup && toClean.length > 0 && (
        <>
          <h4 className="mt-8 text-[15px] font-bold text-foreground">Đã xác minh, chờ dọn</h4>
          <ul className="mt-2 grid gap-3 lg:grid-cols-2">
            {toClean.map((r) => (
              <CleanupRow key={r.id} report={r} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function Where({ r }: { r: LitterReport }) {
  return (
    <p className="mt-2 flex items-start gap-1.5 text-[14px] text-foreground">
      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      <span>
        {[r.address, r.area].filter(Boolean).join(", ")}
        {r.lat != null && (
          <Link href={`${ROUTES.map}?diem-rac=${r.id}`} className="ml-2 text-[13px] font-semibold text-primary hover:underline">
            Xem bản đồ
          </Link>
        )}
      </span>
    </p>
  );
}

function LitterReview({ report: r }: { report: LitterReport }) {
  const { verify, reject } = useLitter();
  const toast = useToast();
  const [rejecting, setRejecting] = useState(false);

  return (
    <li className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[15px] font-bold text-foreground">{r.userName}</p>
          <p className="text-[13px] text-muted-foreground">
            {formatRelativeTime(r.at)} · {LITTER_SIZE[r.size].label.toLowerCase()} · {r.locationSource === "gps" ? "có vị trí GPS" : "nhập tay"}
          </p>
        </div>
        {r.duplicateOf && <span className="rounded-full bg-muted px-2.5 py-1 text-[12px] font-bold text-muted-foreground">Báo trùng</span>}
      </div>
      <Where r={r} />
      {r.description && <p className="mt-2 text-[14px] text-muted-foreground">“{r.description}”</p>}
      {r.photos.length > 0 && (
        <div className="mt-3 flex gap-2">
          {r.photos.map((src, i) => (
            <SmartImage key={i} src={src} alt={`Ảnh ${i + 1} điểm rác`} className="h-20 w-20 rounded-xl border border-border" sizes="80px" />
          ))}
        </div>
      )}
      {rejecting ? (
        <div className="mt-4">
          <p className="mb-2 text-[13px] font-semibold text-foreground">Lý do không hợp lệ</p>
          <div className="flex flex-wrap gap-2">
            {LITTER_REJECT_REASONS.map((x) => (
              <ChoiceChip key={x} selected={false} onClick={() => { reject(r.id, x); toast("info", "Đã ghi không hợp lệ", x); }}>
                {x}
              </ChoiceChip>
            ))}
          </div>
          <button type="button" onClick={() => setRejecting(false)} className={cn(buttonClass.ghost, "mt-2 text-muted-foreground")}>
            Quay lại
          </button>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => { verify(r.id); toast("success", "Đã xác minh", r.points > 0 ? `${r.userName} được +${r.points} điểm.` : undefined); }} className={cn(buttonClass.primary, "min-h-11 flex-1")}>
            <Check className="h-4 w-4" aria-hidden="true" />
            Đúng như báo cáo
          </button>
          <button type="button" onClick={() => setRejecting(true)} className={cn(buttonClass.secondary, "min-h-11 hover:border-destructive/50 hover:text-destructive")}>
            <X className="h-4 w-4" aria-hidden="true" />
            Không hợp lệ
          </button>
        </div>
      )}
    </li>
  );
}

function CleanupRow({ report: r }: { report: LitterReport }) {
  const { markCleaned } = useLitter();
  const toast = useToast();
  return (
    <li className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[15px] font-bold text-foreground">{r.area}</p>
        <span className={cn("inline-flex shrink-0 rounded-full px-2.5 py-1 text-[12px] font-bold", LITTER_BADGE[r.status])}>{LITTER_STATUS_LABEL[r.status]}</span>
      </div>
      <Where r={r} />
      <p className="mt-1 text-[13px] text-muted-foreground">
        Xác minh {r.verifiedAt ? formatRelativeTime(r.verifiedAt).toLowerCase() : ""} bởi {r.verifier}
      </p>
      <button type="button" onClick={() => { markCleaned(r.id); toast("success", "Đã đánh dấu dọn xong"); }} className={cn(buttonClass.secondary, "mt-3 min-h-11")}>
        Đã dọn xong
      </button>
    </li>
  );
}
