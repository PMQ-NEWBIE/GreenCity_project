"use client";

import Link from "next/link";
import { ChevronRight, Clock, MapPin, Weight } from "lucide-react";
import type { PickupRequest, PickupStatus } from "@/types/features";
import { PICKUP_STATUS_LABEL } from "@/data/pickup";
import { useLinks } from "@/store/use-links";
import { formatRelativeTime } from "@/utils/format";
import { cn } from "@/lib/utils";

export const PICKUP_BADGE: Record<PickupStatus, string> = {
  "cho-nhan": "bg-warn/15 text-warn",
  "da-nhan": "bg-accent text-primary",
  "dang-den": "bg-primary/15 text-primary",
  "da-can": "bg-primary/15 text-primary",
  "hoan-tat": "bg-muted text-muted-foreground",
  "da-huy": "bg-destructive/10 text-destructive",
};

export function PickupBadge({ status, className }: { status: PickupStatus; className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[12px] font-bold", PICKUP_BADGE[status], className)}>
      {PICKUP_STATUS_LABEL[status]}
    </span>
  );
}

/**
 * Một yêu cầu trong danh sách — bấm cả thẻ để xem chi tiết (đường dẫn theo khu của người xem).
 * showOwner: hiện tên người gửi (danh sách của người mua, ban điều hành).
 */
export function RequestItem({ request: r, showOwner = false }: { request: PickupRequest; showOwner?: boolean }) {
  const links = useLinks();
  return (
    <li>
      <Link
        href={links.pickup(r.id)}
        className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-[border-color,box-shadow] duration-150 hover:border-primary/40 hover:shadow-md"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[15px] font-bold text-foreground">{r.materials.join(", ")}</p>
            <PickupBadge status={r.status} />
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Weight className="h-3.5 w-3.5" aria-hidden="true" />
              {r.quantity}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {r.area}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {r.time}
            </span>
          </div>
          <p className="mt-2 text-[12px] text-muted-foreground">
            {showOwner && <>{r.ownerName} · </>}Gửi {formatRelativeTime(r.createdAt).toLowerCase()}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </Link>
    </li>
  );
}
