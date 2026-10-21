"use client";

import { useState } from "react";
import Link from "next/link";
import { Inbox, MapPin, Package, PackagePlus } from "lucide-react";
import { useApp } from "@/store/app-store";
import { useOrders } from "@/store/use-orders";
import { EmptyState } from "@/components/greencity/EmptyState";
import { SmartImage } from "@/components/greencity/SmartImage";
import { PageContainer, PageIntro, buttonClass } from "@/components/greencity/ui";
import { ROUTES } from "@/lib/routes";
import type { Product } from "@/types";
import { formatHoursAgo, formatPrice } from "@/utils/format";
import { cn } from "@/lib/utils";

const STATUS: Record<Product["status"], { label: string; className: string }> = {
  available: { label: "Đang bán", className: "bg-accent text-primary" },
  draft: { label: "Nháp", className: "border border-brown-border bg-brown-soft text-brown-text dark:text-beige" },
  sold: { label: "Đã bán", className: "bg-muted text-muted-foreground" },
};

type Filter = "all" | Product["status"];

/** Tin của chính người bán, kèm số đơn đang chờ cho từng tin. */
export function MyListingsView() {
  const { state, removeProduct, toast } = useApp();
  const { incoming } = useOrders();
  const [filter, setFilter] = useState<Filter>("all");
  const mine = state.products.filter((p) => p.isMine);
  const shown = filter === "all" ? mine : mine.filter((p) => p.status === filter);

  const onDelete = (p: Product) => {
    removeProduct(p.id);
    toast("success", "Đã xóa tin", p.name);
  };

  return (
    <PageContainer className="max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageIntro title="Tin đăng của tôi">Món bạn đang bán, bản nháp và món đã bán xong.</PageIntro>
        <Link href={ROUTES.sell} className={buttonClass.primary}>
          <PackagePlus className="h-[18px] w-[18px]" aria-hidden="true" />
          Đăng tin mới
        </Link>
      </div>

      {mine.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={Package}
          title="Bạn chưa đăng tin nào"
          description="Nhà có giấy báo cũ, chai nhựa hay đồ điện hỏng? Đăng bán chỉ mất khoảng một phút."
          action={
            <Link href={ROUTES.sell} className={buttonClass.primary}>
              Đăng tin đầu tiên
            </Link>
          }
        />
      ) : (
        <>
          <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Lọc tin">
            {(["all", "available", "draft", "sold"] as Filter[]).map((f) => {
              const count = f === "all" ? mine.length : mine.filter((p) => p.status === f).length;
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "min-h-10 rounded-xl border px-3.5 text-[14px] font-semibold transition-colors",
                    filter === f ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground/80 hover:border-primary/50"
                  )}
                >
                  {f === "all" ? "Tất cả" : STATUS[f].label} ({count})
                </button>
              );
            })}
          </div>

          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {shown.map((p) => {
              const waiting = incoming.filter((o) => o.productId === p.id && o.status === "pending").length;
              return (
                <li key={p.id} className="flex gap-4 rounded-2xl border border-border bg-card p-3">
                  <SmartImage src={p.image} alt="" className="h-24 w-24 shrink-0 rounded-xl" sizes="96px" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="flex items-center gap-2">
                      <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11.5px] font-bold", STATUS[p.status].className)}>{STATUS[p.status].label}</span>
                    </p>
                    <Link href={ROUTES.product(p.id)} className="mt-1 truncate text-[15px] font-bold text-foreground hover:text-primary">
                      {p.name}
                    </Link>
                    <p className="text-[14px] font-bold text-primary">{formatPrice(p.price, p.unit)}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[12px] text-muted-foreground">
                      <MapPin className="h-3 w-3" aria-hidden="true" />
                      {p.area} · {formatHoursAgo(p.postedHoursAgo)}
                    </p>
                    <div className="mt-auto flex items-center gap-1 pt-2">
                      {waiting > 0 && (
                        <Link href={ROUTES.product(p.id)} className="flex items-center gap-1.5 rounded-lg bg-accent px-2.5 py-1.5 text-[13px] font-bold text-primary">
                          <Inbox className="h-3.5 w-3.5" aria-hidden="true" />
                          {waiting} đơn chờ
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => onDelete(p)}
                        aria-label={`Xóa tin ${p.name}`}
                        className="ml-auto rounded-lg px-3 py-1.5 text-[13px] font-semibold text-destructive hover:bg-destructive/10"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </PageContainer>
  );
}
