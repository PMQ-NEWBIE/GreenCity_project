"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  Gift,
  HelpCircle,
  Package,
  ShoppingBag,
  Sliders,
  Truck,
  ArrowRight,
} from "lucide-react";
import {
  ROUTES,
  POINT_RULES,
  POINT_STATUS_LABEL,
  formatDateTime,
  usePoints,
  type PointEntry,
  type PointReason,
} from "@/features/contracts";
import { EmptyState } from "@/components/greencity/EmptyState";
import {
  PageContainer,
  PageIntro,
  buttonClass,
} from "@/components/greencity/ui";
import { cn } from "@/lib/utils";

type FilterTab = "all" | "earned" | "spent" | "pending";

function reasonIcon(reason: PointReason) {
  switch (reason) {
    case "welcome":
      return <Gift className="h-5 w-5 text-primary" aria-hidden="true" />;
    case "home_pickup":
      return <Truck className="h-5 w-5 text-primary" aria-hidden="true" />;
    case "bin_dropoff":
      return <Package className="h-5 w-5 text-primary" aria-hidden="true" />;
    case "litter_report":
      return <AlertTriangle className="h-5 w-5 text-earth" aria-hidden="true" />;
    case "bin_full_report":
      return <AlertCircle className="h-5 w-5 text-warn" aria-hidden="true" />;
    case "redeem":
      return <ShoppingBag className="h-5 w-5 text-foreground" aria-hidden="true" />;
    case "admin_adjust":
      return <Sliders className="h-5 w-5 text-muted-foreground" aria-hidden="true" />;
  }
}

function monthGroupKey(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Gần đây";
  return `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`;
}

export function PointsView() {
  const { balance, pending, entries } = usePoints();
  const [filter, setFilter] = useState<FilterTab>("all");

  const pickupRule = POINT_RULES.find((r) => r.reason === "home_pickup");
  const binRule = POINT_RULES.find((r) => r.reason === "bin_dropoff");
  const litterRule = POINT_RULES.find((r) => r.reason === "litter_report");

  const earnCards = [
    {
      title: "Thu gom tận nhà",
      desc: "Đặt lịch để nhân viên tới cân ve chai tận nơi và tích điểm ngay.",
      pts: pickupRule ? `+${pickupRule.points} điểm / ${pickupRule.unit}` : "+2 điểm / kg",
      href: ROUTES.collect,
    },
    {
      title: "Bỏ đồ vào thùng",
      desc: "Đem chai nhựa, giấy, quần áo tới các thùng thu gom gần bạn.",
      pts: binRule ? `+${binRule.points} điểm / ${binRule.unit}` : "+5 điểm / lần",
      href: ROUTES.bins,
    },
    {
      title: "Báo điểm rác",
      desc: "Chụp ảnh bãi rác tự phát để cộng tác viên xác minh và dọn dẹp.",
      pts: litterRule ? `+${litterRule.points} điểm / ${litterRule.unit}` : "+20 điểm / lần",
      href: ROUTES.litterReport,
    },
  ];

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      if (filter === "earned") return e.delta > 0;
      if (filter === "spent") return e.delta < 0;
      if (filter === "pending") return e.status === "pending";
      return true;
    });
  }, [entries, filter]);

  // Nhóm theo tháng
  const groupedEntries = useMemo(() => {
    const map = new Map<string, PointEntry[]>();
    for (const entry of filteredEntries) {
      const key = monthGroupKey(entry.at);
      const list = map.get(key) ?? [];
      list.push(entry);
      map.set(key, list);
    }
    return Array.from(map.entries());
  }, [filteredEntries]);

  return (
    <PageContainer>
      <PageIntro title="Điểm của tôi">
        Theo dõi số dư điểm xanh của bạn và xem lại toàn bộ các lần tích điểm, đổi quà trong hệ thống Green City.
      </PageIntro>

      {/* Thẻ số dư điểm */}
      <section aria-labelledby="balance-heading" className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 id="balance-heading" className="text-[14px] font-semibold text-muted-foreground uppercase tracking-wider">
          Số dư điểm hiện tại
        </h3>
        <div className="mt-2 flex flex-wrap items-baseline gap-3">
          <span className="text-[44px] font-extrabold tracking-tight text-primary sm:text-[56px] leading-none">
            {balance}
          </span>
          <span className="text-[18px] font-semibold text-foreground/80">điểm</span>
          {pending > 0 && (
            <span className="rounded-full bg-warn/15 px-3 py-1 text-[13px] font-bold text-warn">
              +{pending} điểm đang chờ xác minh
            </span>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link href={ROUTES.rewards} className={buttonClass.primary}>
            Đổi quà
          </Link>
          <Link href={ROUTES.pointRules} className={buttonClass.ghost}>
            <HelpCircle className="h-4 w-4" aria-hidden="true" />
            Cách tính điểm
          </Link>
        </div>
      </section>

      {/* 3 thẻ "Kiếm thêm điểm" */}
      <section aria-labelledby="earn-more-heading" className="mt-8">
        <h3 id="earn-more-heading" className="text-[18px] font-bold text-foreground">
          Kiếm thêm điểm xanh
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {earnCards.map((card, idx) => (
            <Link
              key={idx}
              href={card.href}
              className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-[border-color,box-shadow] duration-150 hover:border-primary/40 hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-[16px] font-bold text-foreground">
                    {card.title}
                  </h4>
                  <span className="shrink-0 rounded-lg bg-primary/10 px-2 py-0.5 text-[12px] font-bold text-primary">
                    {card.pts}
                  </span>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  {card.desc}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-[13px] font-semibold text-primary">
                <span>Tham gia ngay</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-1" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Lịch sử điểm */}
      <section aria-labelledby="history-heading" className="mt-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 id="history-heading" className="text-[18px] font-bold text-foreground">
            Lịch sử giao dịch điểm
          </h3>

          {/* Chip lọc */}
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Lọc lịch sử điểm">
            {[
              { id: "all" as const, label: "Tất cả" },
              { id: "earned" as const, label: "Được cộng" },
              { id: "spent" as const, label: "Đã dùng" },
              { id: "pending" as const, label: "Chờ xác minh" },
            ].map((tab) => {
              const active = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(tab.id)}
                  className={cn(
                    "min-h-10 rounded-full border px-3.5 text-[13px] font-semibold transition-colors duration-150",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground/80 hover:border-primary/40 hover:text-primary"
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Danh sách mục theo tháng */}
        {entries.length === 0 ? (
          <EmptyState
            title="Chưa có lịch sử điểm"
            description="Bạn chưa có hoạt động tích điểm nào. Hãy đặt lịch thu gom ve chai tận nhà để nhận những điểm thưởng đầu tiên."
            action={
              <Link href={ROUTES.collect} className={buttonClass.primary}>
                Đặt lịch thu gom tận nhà
              </Link>
            }
            className="mt-6"
          />
        ) : filteredEntries.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-border bg-card p-8 text-center text-[14px] text-muted-foreground">
            Không có hoạt động nào trong mục này.
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-6">
            {groupedEntries.map(([month, items]) => (
              <div key={month} className="flex flex-col gap-2">
                <h4 className="text-[14px] font-bold text-muted-foreground uppercase tracking-wider px-1">
                  {month}
                </h4>
                <div className="divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                  {items.map((entry) => {
                    const isRejected = entry.status === "rejected";
                    const isPending = entry.status === "pending";
                    return (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/30"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent">
                            {reasonIcon(entry.reason)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[15px] font-semibold text-foreground">
                              {entry.title}
                            </p>
                            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
                              <span>{formatDateTime(entry.at)}</span>
                              {entry.status !== "confirmed" && (
                                <span
                                  className={cn(
                                    "rounded-md px-1.5 py-0.5 font-medium",
                                    isPending && "bg-warn/15 text-warn",
                                    isRejected && "bg-destructive/15 text-destructive"
                                  )}
                                >
                                  {POINT_STATUS_LABEL[entry.status]}
                                </span>
                              )}
                            </div>
                            {entry.note && (
                              <p className="mt-1 text-[12px] text-muted-foreground">
                                {entry.note}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Số điểm canh phải */}
                        <div className="shrink-0 text-right">
                          <span
                            className={cn(
                              "text-[16px] font-bold",
                              isRejected
                                ? "line-through text-muted-foreground"
                                : entry.delta > 0
                                ? "text-primary"
                                : "text-foreground"
                            )}
                          >
                            {entry.delta > 0 ? `+${entry.delta}` : entry.delta}
                          </span>
                          <span className="ml-1 text-[12px] text-muted-foreground">
                            điểm
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </PageContainer>
  );
}
