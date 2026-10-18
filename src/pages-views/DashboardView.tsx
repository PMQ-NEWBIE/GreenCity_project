"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Handshake,
  Heart,
  Package,
  Plus,
  Recycle,
  Truck,
} from "lucide-react";
import { useApp } from "@/store/app-store";
import { ACTIVITIES, IMAGES } from "@/data/mock-data";
import { ProductCard } from "@/components/greencity/ProductCard";
import { SmartImage } from "@/components/greencity/SmartImage";
import { Reveal } from "@/components/greencity/Reveal";
import { formatHoursAgo, greetingByHour, todayLabel } from "@/utils/format";
import { cn } from "@/lib/utils";

const ACTIVITY_ICONS = {
  listing: Package,
  match: Handshake,
  collection: Truck,
  recycle: Recycle,
} as const;

const REQUEST_STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "Đang chờ", cls: "bg-[#fdf3e3] text-warn" },
  matched: { label: "Đã ghép", cls: "bg-accent text-primary" },
  done: { label: "Hoàn tất", cls: "bg-[#eef4ee] text-muted-foreground" },
};

export function DashboardView() {
  const { state, goApp } = useApp();
  const user = state.user!;
  const myListingCount = state.products.filter((p) => p.isMine).length;
  const myRequestCount = state.requests.filter((r) => r.isMine).length;
  const recentProducts = state.products.filter((p) => p.status === "available").slice(0, 4);
  const recentRequests = state.requests.slice(0, 4);

  const stats = [
    { icon: Package, label: "Tin đăng của bạn", value: myListingCount, sub: "trên sàn demo", tint: "bg-accent text-primary" },
    { icon: Handshake, label: "Lượt kết nối", value: 12, sub: "tháng này (demo)", tint: "bg-[#f3ebe2] text-earth" },
    { icon: Recycle, label: "KL tái chế ước tính", value: 38, suffix: "kg", sub: "từ các tin đã giao", tint: "bg-accent text-primary" },
    { icon: Truck, label: "Yêu cầu thu gom", value: myRequestCount, sub: "đã gửi", tint: "bg-[#fdf3e3] text-warn" },
  ];

  return (
    <div className="nice-scroll h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Lời chào + CTA */}
        <Reveal>
          <div className="relative overflow-hidden rounded-[28px] brand-gradient-deep p-6 text-white sm:p-8">
            <div className="pointer-events-none absolute -right-10 -top-14 h-48 w-48 rounded-full bg-mint/15 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-16 right-[30%] h-40 w-40 rounded-full bg-leaf/25 blur-2xl" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[12.5px] font-semibold uppercase tracking-[0.16em] text-mint/70">
                  {todayLabel()}
                </p>
                <h2 className="mt-2 text-[24px] font-extrabold leading-tight sm:text-[28px]">
                  {greetingByHour()}, {user.name.split(" ").slice(-1)[0]}!
                </h2>
                <p className="mt-2 max-w-md text-[14px] leading-relaxed text-mint/75">
                  Hôm nay thành phố có 12 tin ve chai mới và 7 yêu cầu thu gom đang chờ (demo). Bạn
                  muốn bắt đầu điều gì?
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <motion.button
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => goApp("sell")}
                  className="flex h-[48px] items-center gap-2 rounded-2xl bg-white px-5 text-[14px] font-bold text-forest shadow-lg transition-shadow hover:shadow-xl"
                >
                  <Plus className="h-4.5 w-4.5" strokeWidth={2.5} />
                  Đăng tin mới
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => goApp("collect")}
                  className="flex h-[48px] items-center gap-2 rounded-2xl border-[1.5px] border-white/40 bg-white/10 px-5 text-[14px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <Truck className="h-4.5 w-4.5" />
                  Tạo yêu cầu thu gom
                </motion.button>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Thẻ thống kê */}
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={0.06 * i}>
              <div className="group relative overflow-hidden rounded-3xl border border-border/70 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
                <div className="flex items-center justify-between">
                  <span className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", s.tint)}>
                    <s.icon className="h-[21px] w-[21px]" strokeWidth={2} />
                  </span>
                  <span className="rounded-full bg-[#f0f7f0] px-2 py-1 text-[11px] font-bold text-primary">
                    +12%
                  </span>
                </div>
                <p className="mt-4 text-[26px] font-extrabold leading-none tracking-tight text-forest">
                  {s.value}
                  {s.suffix && <span className="text-[16px]">{s.suffix}</span>}
                </p>
                <p className="mt-1.5 text-[13px] font-semibold text-foreground/75">{s.label}</p>
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">{s.sub}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.6fr_1fr]">
          {/* Sản phẩm mới */}
          <section>
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-bold tracking-tight text-forest">Sản phẩm mới trên sàn</h3>
              <button
                type="button"
                onClick={() => goApp("discover")}
                className="group flex items-center gap-1.5 text-[13.5px] font-semibold text-primary transition-colors hover:text-forest"
              >
                Xem tất cả
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {recentProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>

          {/* Cột phải */}
          <div className="flex flex-col gap-8">
            {/* Yêu cầu gần đây */}
            <section>
              <div className="flex items-center justify-between">
                <h3 className="text-[18px] font-bold tracking-tight text-forest">Yêu cầu thu gom gần đây</h3>
                <button
                  type="button"
                  onClick={() => goApp("collect")}
                  className="group flex items-center gap-1.5 text-[13.5px] font-semibold text-primary transition-colors hover:text-forest"
                >
                  Tất cả
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </div>
              <div className="mt-4 flex flex-col gap-3">
                {recentRequests.map((r, i) => {
                  const st = REQUEST_STATUS[r.status];
                  return (
                    <Reveal key={r.id} delay={0.05 * i}>
                      <button
                        type="button"
                        onClick={() => goApp("collect")}
                        className="group w-full rounded-2xl border border-border/70 bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-[14px] font-bold text-forest">
                              {r.materials.join(", ")}
                            </p>
                            <p className="mt-1 text-[12.5px] text-muted-foreground">
                              {r.area} • {r.quantity} • {r.time}
                            </p>
                          </div>
                          <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold", st.cls)}>
                            {st.label}
                          </span>
                        </div>
                        <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-muted-foreground/70">
                          <Truck className="h-3 w-3" />
                          {formatHoursAgo(r.hoursAgo)}
                          {r.isMine && (
                            <span className="ml-1 rounded-full bg-earth/15 px-2 py-0.5 text-[10.5px] font-bold text-earth">
                              Của bạn
                            </span>
                          )}
                        </p>
                      </button>
                    </Reveal>
                  );
                })}
              </div>
            </section>

            {/* Hoạt động gần đây */}
            <section>
              <h3 className="text-[18px] font-bold tracking-tight text-forest">Hoạt động gần đây</h3>
              <div className="mt-4 rounded-3xl border border-border/70 bg-white p-5">
                <div className="flex flex-col gap-4">
                  {ACTIVITIES.slice(0, 4).map((a, i) => {
                    const Icon = ACTIVITY_ICONS[a.type];
                    return (
                      <Reveal key={a.id} delay={0.05 * i}>
                        <div className="flex items-start gap-3">
                          <span
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                              a.type === "recycle" ? "bg-accent text-primary" : "bg-[#f6f8f5] text-muted-foreground"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1 border-b border-border/50 pb-4 last:border-0 last:pb-0">
                            <p className="text-[13.5px] font-semibold text-foreground">{a.title}</p>
                            <p className="mt-0.5 text-[12.5px] leading-relaxed text-muted-foreground">
                              {a.description}
                            </p>
                            <p className="mt-1 text-[11px] text-muted-foreground/60">{a.time}</p>
                          </div>
                        </div>
                      </Reveal>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Banner mini */}
            <Reveal delay={0.1}>
              <div className="relative overflow-hidden rounded-3xl">
                <SmartImage
                  src={IMAGES.heroRecycleAlt}
                  alt="Vật liệu tái chế được phân loại"
                  className="aspect-[16/8] w-full"
                />
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-forest/85 via-forest/30 to-transparent p-5">
                  <p className="flex items-center gap-2 text-[15px] font-bold text-white">
                    <Heart className="h-4 w-4 fill-mint text-mint" />
                    Cộng đồng xanh đang lớn mạnh
                  </p>
                  <p className="mt-1 text-[12.5px] text-mint/80">
                    2.400+ thành viên demo — biến rác thành tài nguyên mỗi ngày.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}
