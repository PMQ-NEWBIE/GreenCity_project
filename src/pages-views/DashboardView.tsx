"use client";

import Link from "next/link";
import { ArrowRight, Check, Compass, Gift, Megaphone, PackagePlus, Recycle, Repeat2, Truck, type LucideIcon } from "lucide-react";
import { useApp } from "@/store/app-store";
import { useCollect, usePoints } from "@/store/hooks";
import { ProductCard } from "@/components/greencity/ProductCard";
import { PageContainer, buttonClass } from "@/components/greencity/ui";
import { ROUTES } from "@/lib/routes";
import { greetingByHour } from "@/utils/format";
import { cn } from "@/lib/utils";

const ACTIONS: { href: string; icon: LucideIcon; title: string; text: string }[] = [
  {
    href: ROUTES.sell,
    icon: PackagePlus,
    title: "Bán đồ cũ",
    text: "Chụp ảnh, ghi giá và khu vực. Người mua gần bạn sẽ liên hệ.",
  },
  {
    href: ROUTES.discover,
    icon: Compass,
    title: "Tìm mua ve chai",
    text: "Giấy, nhựa, kim loại, đồ điện tử… đang được bán quanh bạn.",
  },
  {
    href: ROUTES.collect,
    icon: Truck,
    title: "Gọi thu gom tận nhà",
    text: "Chọn loại đồ và giờ rảnh, người thu gom gần nhất sẽ ghé.",
  },
];

/** Việc xanh khác — lối tắt nhỏ dưới 3 việc chính. */
const MORE: { href: string; icon: LucideIcon; label: string }[] = [
  { href: ROUTES.bins, icon: Recycle, label: "Tìm thùng gần bạn" },
  { href: ROUTES.litterReport, icon: Megaphone, label: "Báo điểm rác" },
  { href: ROUTES.rewards, icon: Gift, label: "Đổi điểm lấy quà" },
  { href: ROUTES.swap, icon: Repeat2, label: "Trao đổi đồ cũ" },
];

export function DashboardView() {
  const { state } = useApp();
  const { balance } = usePoints();
  const user = state.user!;
  const myListings = state.products.filter((p) => p.isMine).length;
  const myRequests = useCollect().mine.length;
  const saved = state.favorites.length;
  const latest = state.products.filter((p) => p.status === "available").slice(0, 4);
  const firstName = user.name.trim().split(/\s+/).slice(-1)[0];

  const steps = [
    { done: myListings > 0, label: "Đăng tin bán món đầu tiên", href: ROUTES.sell },
    { done: myRequests > 0, label: "Gửi một yêu cầu thu gom", href: ROUTES.collect },
    { done: saved > 0, label: "Lưu một món bạn quan tâm (bấm hình trái tim)", href: ROUTES.discover },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <PageContainer>
      <h2 className="text-[26px] font-extrabold tracking-tight text-foreground sm:text-[30px]">
        {greetingByHour()}, {firstName}
      </h2>
      <p className="mt-1 text-[16px] text-muted-foreground">Hôm nay bạn muốn làm gì?</p>

      {/* 3 việc chính */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {ACTIONS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-[border-color,box-shadow] duration-150 hover:border-primary/50 hover:shadow-md sm:flex-col sm:items-start sm:gap-0 sm:p-5"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
              <a.icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[17px] font-bold text-foreground sm:mt-4 sm:text-[18px]">{a.title}</span>
              <span className="mt-0.5 block text-[14px] leading-snug text-muted-foreground sm:mt-1 sm:leading-relaxed">{a.text}</span>
            </span>
            <span className="flex items-center gap-1.5 text-[14px] font-semibold text-primary sm:mt-4">
              <span className="hidden sm:inline">Bắt đầu</span>
              <ArrowRight className="h-5 w-5 transition-transform duration-150 group-hover:translate-x-0.5 sm:h-4 sm:w-4" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>

      <ul className="mt-3 flex flex-wrap gap-2" aria-label="Việc xanh khác">
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
      </ul>

      {/* Hướng dẫn bắt đầu — tự ẩn khi làm đủ 3 bước */}
      {doneCount < steps.length && (
        <section aria-labelledby="getting-started" className="mt-6 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 id="getting-started" className="text-[16px] font-bold text-foreground">
              Làm quen với Green City
            </h3>
            <span className="text-[13px] font-semibold text-muted-foreground">
              {doneCount}/{steps.length} bước
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
            <div className="h-full rounded-full bg-primary" style={{ width: `${(doneCount / steps.length) * 100}%` }} />
          </div>
          <ol className="mt-4 flex flex-col gap-1">
            {steps.map((s, i) => (
              <li key={s.label}>
                <Link
                  href={s.href}
                  className="flex min-h-11 items-center gap-3 rounded-xl px-2 text-[15px] hover:bg-muted"
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[13px] font-bold",
                      s.done ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"
                    )}
                  >
                    {s.done ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
                  </span>
                  <span className={cn(s.done ? "text-muted-foreground line-through" : "font-medium text-foreground")}>
                    {s.label}
                  </span>
                  <span className="sr-only">{s.done ? "(đã xong)" : "(chưa làm)"}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Số liệu của chính người dùng */}
      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Điểm thưởng", value: balance, href: ROUTES.points },
          { label: "Tin bạn đã đăng", value: myListings, href: ROUTES.profile },
          { label: "Yêu cầu thu gom", value: myRequests, href: ROUTES.collect },
          { label: "Món đã lưu", value: saved, href: ROUTES.favorites },
        ].map((s) => (
          <Link key={s.label} href={s.href} className="rounded-2xl border border-border bg-card p-4 hover:border-primary/50">
            <dt className="text-[13px] font-medium text-muted-foreground">{s.label}</dt>
            <dd className="mt-1 text-[26px] font-extrabold leading-none text-foreground">{s.value}</dd>
          </Link>
        ))}
      </dl>

      {/* Tin mới */}
      <section aria-labelledby="latest" className="mt-10">
        <div className="flex items-end justify-between gap-3">
          <h3 id="latest" className="text-[19px] font-bold text-foreground">
            Mới lên sàn
          </h3>
          <Link href={ROUTES.discover} className={buttonClass.ghost}>
            Xem tất cả
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {latest.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
