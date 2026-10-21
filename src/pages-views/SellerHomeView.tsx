"use client";

import Link from "next/link";
import { ArrowRight, Check, Coins, PackagePlus, Recycle, ScanSearch, Truck, type LucideIcon } from "lucide-react";
import { useApp } from "@/store/app-store";
import { useCollect, usePoints } from "@/store/hooks";
import { useOrders } from "@/store/use-orders";
import { OrderCard } from "@/features/orders/OrderCard";
import { PageContainer, buttonClass } from "@/components/greencity/ui";
import { ROUTES } from "@/lib/routes";
import { greetingByHour } from "@/utils/format";
import { cn } from "@/lib/utils";

/** Lối tắt phụ của người bán: đồ không đáng đăng bán thì gọi thu gom hoặc bỏ thùng. */
const MORE: { href: string; icon: LucideIcon; label: string }[] = [
  { href: ROUTES.collect, icon: Truck, label: "Gọi thu gom tận nhà" },
  { href: ROUTES.bins, icon: Recycle, label: "Tìm thùng gần bạn" },
  { href: ROUTES.consult, icon: ScanSearch, label: "Hỏi cách phân loại" },
];

/** Trang đầu của chế độ bán: việc cần làm ngay (đơn chờ xác nhận) đứng trên cùng. */
export function SellerHomeView() {
  const { state } = useApp();
  const { incoming } = useOrders();
  const { balance } = usePoints();
  const myRequests = useCollect().mine;
  const user = state.user!;
  const firstName = user.name.trim().split(/\s+/).slice(-1)[0];

  const mine = state.products.filter((p) => p.isMine);
  const pending = incoming.filter((o) => o.status === "pending");
  const accepted = incoming.filter((o) => o.status === "accepted");
  const selling = mine.filter((p) => p.status === "available").length;
  const sold = mine.filter((p) => p.status === "sold").length;

  const steps = [
    { done: mine.length > 0, label: "Đăng tin bán món đầu tiên", href: ROUTES.sell },
    { done: incoming.some((o) => o.status !== "pending"), label: "Nhận hoặc từ chối một đơn đến", href: ROUTES.sellerOrders },
    { done: myRequests.length > 0, label: "Gọi thu gom cho đồ không đáng đăng bán", href: ROUTES.collect },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <PageContainer>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-[26px] font-extrabold tracking-tight text-foreground sm:text-[30px]">
            {greetingByHour()}, {firstName}
          </h2>
          <p className="mt-1 text-[16px] text-muted-foreground">Đây là kênh bán của bạn.</p>
        </div>
        <Link href={ROUTES.sell} className={buttonClass.primary}>
          <PackagePlus className="h-[18px] w-[18px]" aria-hidden="true" />
          Đăng tin bán
        </Link>
      </div>

      {/* Việc cần làm ngay */}
      {pending.length > 0 && (
        <section aria-labelledby="need-action" className="mt-6">
          <div className="flex items-end justify-between gap-3">
            <h3 id="need-action" className="text-[19px] font-bold text-foreground">
              Cần bạn xác nhận ({pending.length})
            </h3>
            <Link href={ROUTES.sellerOrders} className={buttonClass.ghost}>
              Tất cả đơn
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <ul className="mt-3 grid gap-3">
            {pending.slice(0, 3).map((o) => (
              <OrderCard key={o.id} order={o} side="seller" />
            ))}
          </ul>
        </section>
      )}

      {/* Số liệu của chính người bán */}
      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Đơn chờ xác nhận", value: pending.length, href: ROUTES.sellerOrders, hot: pending.length > 0 },
          { label: "Đã nhận, chờ giao", value: accepted.length, href: ROUTES.sellerOrders },
          { label: "Tin đang bán", value: selling, href: ROUTES.myListings },
          { label: "Đã bán xong", value: sold, href: ROUTES.myListings },
        ].map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className={cn("rounded-2xl border bg-card p-4 hover:border-primary/50", s.hot ? "border-primary/50" : "border-border")}
          >
            <dt className="text-[13px] font-medium text-muted-foreground">{s.label}</dt>
            <dd className={cn("mt-1 text-[26px] font-extrabold leading-none", s.hot ? "text-primary" : "text-foreground")}>{s.value}</dd>
          </Link>
        ))}
      </dl>

      {/* Hướng dẫn bắt đầu — tự ẩn khi làm đủ */}
      {doneCount < steps.length && (
        <section aria-labelledby="getting-started" className="mt-6 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 id="getting-started" className="text-[16px] font-bold text-foreground">
              Bắt đầu bán trên Green City
            </h3>
            <span className="text-[13px] font-semibold text-muted-foreground">
              {doneCount}/{steps.length} bước
            </span>
          </div>
          <ol className="mt-3 flex flex-col gap-1">
            {steps.map((s, i) => (
              <li key={s.label}>
                <Link href={s.href} className="flex min-h-11 items-center gap-3 rounded-xl px-2 text-[15px] hover:bg-muted">
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[13px] font-bold",
                      s.done ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"
                    )}
                  >
                    {s.done ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
                  </span>
                  <span className={cn(s.done ? "text-muted-foreground line-through" : "font-medium text-foreground")}>{s.label}</span>
                  <span className="sr-only">{s.done ? "(đã xong)" : "(chưa làm)"}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section aria-labelledby="other-ways" className="mt-8">
        <h3 id="other-ways" className="text-[16px] font-bold text-foreground">
          Đồ ít, không đáng đăng bán?
        </h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {MORE.map((m) => (
            <li key={m.href}>
              <Link
                href={m.href}
                className="flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-3.5 text-[14px] font-semibold text-foreground/80 transition-colors duration-150 hover:border-primary/50 hover:text-primary"
              >
                <m.icon className="h-4 w-4 text-primary" aria-hidden="true" />
                {m.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href={ROUTES.points}
              className="flex min-h-11 items-center gap-2 rounded-xl border border-brown-border bg-brown-soft px-3.5 text-[14px] font-semibold text-brown-text dark:text-beige transition-colors duration-150 hover:border-brown"
            >
              <Coins className="h-4 w-4 text-brown" aria-hidden="true" />
              {balance} điểm thưởng
            </Link>
          </li>
        </ul>
      </section>
    </PageContainer>
  );
}
