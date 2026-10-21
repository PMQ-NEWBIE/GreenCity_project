"use client";

import Link from "next/link";
import { CalendarClock, ChevronRight } from "lucide-react";
import { SmartImage } from "@/components/greencity/SmartImage";
import { useLinks } from "@/store/use-links";
import { ORDER_STATUS_LABEL, ORDER_STATUS_LABEL_SELLER, type OrderSide } from "@/lib/orders";
import type { Order, OrderStatus } from "@/types/features";
import { formatPrice, formatRelativeTime } from "@/utils/format";
import { cn } from "@/lib/utils";

const BADGE: Record<OrderStatus, string> = {
  pending: "bg-warn/15 text-earth",
  accepted: "bg-accent text-primary",
  done: "bg-primary text-primary-foreground",
  declined: "bg-muted text-muted-foreground",
  cancelled: "bg-muted text-muted-foreground",
};

export function OrderBadge({ order, side, className }: { order: Order; side: OrderSide; className?: string }) {
  const label = side === "seller" ? ORDER_STATUS_LABEL_SELLER[order.status] : ORDER_STATUS_LABEL[order.status];
  return <span className={cn("inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[12px] font-bold", BADGE[order.status], className)}>{label}</span>;
}

/** Một đơn trong danh sách — bấm cả thẻ để mở chi tiết. Người bán thấy tên người mua và ngược lại. */
export function OrderCard({ order: o, side }: { order: Order; side: OrderSide }) {
  const links = useLinks();
  return (
    <li>
      <Link
        href={links.order(o.id)}
        className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-[border-color,box-shadow] duration-150 hover:border-primary/40 hover:shadow-md sm:gap-4"
      >
        <SmartImage src={o.product.image} alt="" sizes="96px" className="h-20 w-20 shrink-0 rounded-xl sm:h-[88px] sm:w-24" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <OrderBadge order={o} side={side} />
            <span className="text-[12px] text-muted-foreground">{formatRelativeTime(o.createdAt)}</span>
          </div>
          <p className="mt-1.5 truncate text-[15px] font-bold text-foreground group-hover:text-primary">{o.product.name}</p>
          <p className="mt-0.5 truncate text-[13.5px] text-muted-foreground">
            {side === "seller" ? `Người mua: ${o.buyerName}` : `Người bán: ${o.sellerName}`} · {formatPrice(o.product.price, o.product.unit)}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-[13px] text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
            {o.quantity} · {o.meetTime}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
      </Link>
    </li>
  );
}
