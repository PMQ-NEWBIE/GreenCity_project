import { BadgeCheck, Droplets, MapPin } from "lucide-react";
import { SmartImage } from "@/components/greencity/SmartImage";
import { LOT_GRADE_HINT, LOT_STATUS_LABEL } from "@/data/lots";
import { lotValue } from "@/lib/materials";
import type { LotGrade, MaterialLot } from "@/types/features";
import { formatPrice, formatRelativeTime } from "@/utils/format";
import { cn } from "@/lib/utils";

/** Nền đặc vì nhãn nằm đè lên ảnh. */
export const GRADE_BADGE: Record<LotGrade, string> = {
  A: "bg-primary text-primary-foreground",
  B: "bg-card text-warn shadow-sm",
  C: "bg-card text-muted-foreground shadow-sm",
};

export const LOT_STATUS_BADGE: Record<MaterialLot["status"], string> = {
  "san-sang": "bg-primary/10 text-primary",
  "dang-giu": "bg-warn/15 text-warn",
  "da-ban": "bg-muted text-muted-foreground",
};

/** Thẻ một lô vật liệu kèm phiếu kiểm định tóm tắt. `action`: nút đặt giữ hoặc thao tác khác. */
export function LotCard({ lot, action }: { lot: MaterialLot; action?: React.ReactNode }) {
  return (
    <li className={cn("flex flex-col overflow-hidden rounded-2xl border border-border bg-card", lot.status === "da-ban" && "opacity-75")}>
      <div className="relative">
        <SmartImage src={lot.image} alt="" className="aspect-[16/9] w-full" sizes="(max-width: 1024px) 100vw, 400px" />
        <span className={cn("absolute left-3 top-3 rounded-full px-2.5 py-1 text-[12px] font-bold", GRADE_BADGE[lot.grade])} title={LOT_GRADE_HINT[lot.grade]}>
          Hạng {lot.grade}
        </span>
        {lot.status !== "san-sang" && (
          <span className={cn("absolute right-3 top-3 rounded-full bg-card px-2.5 py-1 text-[12px] font-bold", LOT_STATUS_BADGE[lot.status])}>{LOT_STATUS_LABEL[lot.status]}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="font-mono text-[12px] font-semibold text-muted-foreground">{lot.code}</p>
        <h3 className="text-[17px] font-bold leading-snug text-foreground">
          {lot.material} · {lot.weightKg.toLocaleString("vi-VN")}kg
        </h3>
        <p className="mt-1 text-[16px] font-bold text-primary">
          {formatPrice(lot.pricePerKg)}/kg
          <span className="ml-2 text-[13px] font-semibold text-muted-foreground">≈ {formatPrice(lotValue(lot))} cả lô</span>
        </p>
        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[13px]">
          <div className="flex items-center gap-1.5">
            <dt className="flex items-center gap-1 text-muted-foreground">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Độ sạch
            </dt>
            <dd className="font-semibold text-foreground">{lot.purity}%</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="flex items-center gap-1 text-muted-foreground">
              <Droplets className="h-3.5 w-3.5" aria-hidden="true" />
              Độ ẩm
            </dt>
            <dd className="font-semibold text-foreground">{lot.moisture}%</dd>
          </div>
        </dl>
        <p className="mt-2 flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {lot.warehouse}, {lot.area}
        </p>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Kiểm định {formatRelativeTime(lot.inspectedAt).toLowerCase()} bởi {lot.inspector}
        </p>
        {lot.note && <p className="mt-2 text-[13px] text-foreground/85">{lot.note}</p>}
        {action && <div className="mt-auto pt-4">{action}</div>}
      </div>
    </li>
  );
}
