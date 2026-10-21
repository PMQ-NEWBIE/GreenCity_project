"use client";

import { useState } from "react";
import Link from "next/link";
import { Inbox, ShoppingBag } from "lucide-react";
import { useApp } from "@/store/app-store";
import { useOrders } from "@/store/use-orders";
import { EmptyState } from "@/components/greencity/EmptyState";
import { PageContainer, PageIntro, buttonClass } from "@/components/greencity/ui";
import { ROUTES } from "@/lib/routes";
import { isOpen, type OrderSide } from "@/lib/orders";
import type { Order } from "@/types/features";
import { cn } from "@/lib/utils";
import { OrderCard } from "./OrderCard";

type Filter = "open" | "done" | "closed";

const FILTERS: { key: Filter; label: string; test: (o: Order) => boolean }[] = [
  { key: "open", label: "Đang xử lý", test: isOpen },
  { key: "done", label: "Đã xong", test: (o) => o.status === "done" },
  { key: "closed", label: "Hủy / từ chối", test: (o) => o.status === "cancelled" || o.status === "declined" },
];

type Copy = { title: string; lead: string; empty: string; emptyText: string; cta: string; href: string };

const COPY: Record<OrderSide, Copy> = {
  seller: {
    title: "Đơn khách đặt mua",
    lead: "Người mua đặt vào tin của bạn. Nhận đơn để hẹn giờ giao, hoặc từ chối nếu không bán được.",
    empty: "Chưa có đơn nào",
    emptyText: "Khi có người đặt mua món bạn đăng, đơn sẽ hiện ở đây.",
    cta: "Đăng bán ve chai, đồ cũ",
    href: ROUTES.sell,
  },
  buyer: {
    title: "Đơn tôi đặt mua",
    lead: "Các món bạn đã đặt. Người bán xác nhận xong là có thể hẹn tới lấy hàng.",
    empty: "Bạn chưa đặt mua món nào",
    emptyText: "Tìm bàn ghế, đồ điện, đồ dùng cũ còn tốt quanh bạn rồi bấm \"Đặt mua\".",
    cta: "Xem đồ cũ đang bán",
    href: ROUTES.discover,
  },
};

/** Đối tác thu mua chỉ có phía mua: đơn thu mua phế liệu */
const PARTNER_COPY: Copy = {
  title: "Đơn tôi đã đặt",
  lead: "Các lô phế liệu bạn đã đặt. Người dân xác nhận xong là hẹn tới cân và lấy hàng.",
  empty: "Bạn chưa đặt thu mua lô nào",
  emptyText: "Xem giấy, nhựa, kim loại, chai lọ người dân đang bán quanh đây rồi bấm \"Đặt mua\".",
  cta: "Xem ve chai đang rao bán",
  href: ROUTES.partner,
};

export function OrdersListView({ side }: { side: OrderSide }) {
  const { bought, incoming } = useOrders();
  const orders = side === "seller" ? incoming : bought;
  const [filter, setFilter] = useState<Filter>("open");
  const partner = useApp().state.user?.role === "partner";
  const copy = partner && side === "buyer" ? PARTNER_COPY : COPY[side];
  const shown = orders.filter(FILTERS.find((f) => f.key === filter)!.test);

  return (
    <PageContainer className="max-w-4xl">
      <PageIntro title={copy.title}>{copy.lead}</PageIntro>

      {orders.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={side === "seller" ? Inbox : ShoppingBag}
          title={copy.empty}
          description={copy.emptyText}
          action={
            <Link href={copy.href} className={buttonClass.primary}>
              {copy.cta}
            </Link>
          }
        />
      ) : (
        <>
          <div className="mt-6 flex gap-2 overflow-x-auto border-b border-border" role="tablist" aria-label="Lọc đơn">
            {FILTERS.map((f) => {
              const count = orders.filter(f.test).length;
              return (
                <button
                  key={f.key}
                  type="button"
                  role="tab"
                  aria-selected={filter === f.key}
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    "-mb-px flex min-h-12 shrink-0 items-center gap-2 border-b-2 px-3 text-[15px] font-semibold transition-colors",
                    filter === f.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f.label}
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[12px] font-bold text-muted-foreground">{count}</span>
                </button>
              );
            })}
          </div>
          {shown.length > 0 ? (
            <ul className="mt-5 grid gap-3">
              {shown.map((o) => (
                <OrderCard key={o.id} order={o} side={side} />
              ))}
            </ul>
          ) : (
            <p className="mt-8 text-center text-[15px] text-muted-foreground">Không có đơn nào ở mục này.</p>
          )}
        </>
      )}
    </PageContainer>
  );
}
