import { Building2, MapPin, Scale } from "lucide-react";
import type { DemandOfferStatus, PurchaseDemand } from "@/types/features";
import { formatPrice, formatRelativeTime } from "@/utils/format";
import { cn } from "@/lib/utils";

export const OFFER_STATUS_LABEL: Record<DemandOfferStatus, string> = {
  cho: "Chờ doanh nghiệp trả lời",
  nhan: "Doanh nghiệp đã nhận",
  "tu-choi": "Doanh nghiệp từ chối",
};

export const OFFER_STATUS_BADGE: Record<DemandOfferStatus, string> = {
  cho: "bg-warn/15 text-earth",
  nhan: "bg-primary text-primary-foreground",
  "tu-choi": "bg-muted text-muted-foreground",
};

/** Tóm tắt một nhu cầu thu mua: ai mua, loại gì, bao nhiêu, giá, khu vực. `children`: nút / lời chào bên dưới. */
export function DemandCard({ demand: d, children }: { demand: PurchaseDemand; children?: React.ReactNode }) {
  return (
    <li className={cn("flex flex-col rounded-2xl border border-border bg-card p-5", d.status === "da-du" && "opacity-75")}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-muted-foreground">
          <Building2 className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          {d.businessName}
        </p>
        <span className={cn("rounded-full px-2.5 py-1 text-[12px] font-bold", d.status === "dang-mua" ? "bg-accent text-primary" : "bg-muted text-muted-foreground")}>
          {d.status === "dang-mua" ? "Đang mua" : "Đã đủ hàng"}
        </span>
      </div>
      <h3 className="mt-2 text-[18px] font-bold text-foreground">{d.material}</h3>
      <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] text-foreground">
        <span className="flex items-center gap-1.5">
          <Scale className="h-4 w-4 text-primary" aria-hidden="true" />
          Cần {d.kg.toLocaleString("vi-VN")}kg
        </span>
        <strong className="text-primary">{formatPrice(d.pricePerKg)}/kg</strong>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="h-4 w-4" aria-hidden="true" />
          {d.area ?? "Cả thành phố"}
        </span>
      </p>
      {d.note && <p className="mt-2 text-[14px] leading-relaxed text-foreground/85">{d.note}</p>}
      <p className="mt-2 text-[12px] text-muted-foreground">Đăng {formatRelativeTime(d.createdAt).toLowerCase()}</p>
      {children && <div className="mt-auto pt-4">{children}</div>}
    </li>
  );
}
