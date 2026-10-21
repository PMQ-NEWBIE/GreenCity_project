"use client";

import { useState } from "react";
import Link from "next/link";
import { FlaskConical, X } from "lucide-react";
import { LogoMark } from "@/components/greencity/Logo";
import { ROLE_LABEL } from "@/data/labels";
import type { UserRole } from "@/types";
import { cn } from "@/lib/utils";
import { isActive, type NavGroup, type NavItem } from "./nav";

/** Phần dùng chung giữa khung trang người dân (AppShell) và khu làm việc (WorkspaceShell). */

export type BadgeCounts = Partial<Record<NonNullable<NavItem["badge"]>, number>>;

export function ShellLoading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background" aria-busy="true">
      <LogoMark size={64} className="opacity-80" />
      <span className="sr-only">Đang tải…</span>
    </div>
  );
}

export function NavGroups({
  groups,
  pathname,
  badges = {},
  onNavigate,
  dense = false,
  tone = "light",
}: {
  groups: NavGroup[];
  pathname: string;
  badges?: BadgeCounts;
  onNavigate?: () => void;
  /** Sidebar desktop (bấm bằng chuột): dòng thấp hơn */
  dense?: boolean;
  /** dark: sidebar nền tối của khu làm việc */
  tone?: "light" | "dark";
}) {
  return (
    <>
      {groups.map((g, gi) => (
        <div key={g.title} className={cn(gi > 0 && "mt-5")}>
          <p className={cn("px-3.5 pb-1 text-[12px] font-semibold uppercase tracking-wide", tone === "dark" ? "text-gc-300/80" : "text-muted-foreground")}>
            {g.title}
          </p>
          <ul className="flex flex-col gap-0.5">
            {g.items.map((item) => {
              const active = isActive(pathname, item);
              const count = item.badge ? (badges[item.badge] ?? 0) : 0;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3.5 font-semibold transition-colors duration-150",
                      dense ? "min-h-10 text-[14.5px]" : "min-h-11 text-[15px]",
                      tone === "dark"
                        ? active
                          ? "bg-gc-50/12 text-white dark:bg-primary-soft dark:text-primary dark:border dark:border-primary-border"
                          : "text-gc-100/80 hover:bg-gc-50/8 hover:text-white dark:text-text-secondary dark:hover:bg-surface-hover dark:hover:text-foreground"
                        : active
                          ? "bg-accent text-primary dark:bg-primary-soft dark:text-primary dark:border dark:border-primary-border"
                          : "text-foreground/75 hover:bg-muted hover:text-foreground dark:hover:bg-surface-hover"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    {item.label}
                    {count > 0 && (
                      <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[12px] font-bold text-primary-foreground">
                        {count}
                        <span className="sr-only"> mục</span>
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </>
  );
}

/** Thanh đáy điện thoại: tối đa 4 mục + ô "Thêm" mở toàn bộ menu. */
export function BottomNav({
  items,
  pathname,
  badges = {},
  highlight,
  onMore,
}: {
  items: NavItem[];
  pathname: string;
  badges?: BadgeCounts;
  /** Mục được tô nổi (nút hành động chính, ví dụ Đăng tin) */
  highlight?: string;
  onMore: () => void;
}) {
  const inBar = items.some((i) => isActive(pathname, i));
  return (
    <nav
      aria-label="Điều hướng nhanh"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg" style={{ gridTemplateColumns: `repeat(${items.length + 1}, minmax(0, 1fr))` }}>
        {items.map((item) => {
          const active = isActive(pathname, item);
          const count = item.badge ? (badges[item.badge] ?? 0) : 0;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-16 flex-col items-center justify-center gap-1 text-[11.5px] font-semibold",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.href === highlight ? (
                  <span className="flex h-9 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                ) : (
                  <item.icon className="h-[22px] w-[22px]" aria-hidden="true" />
                )}
                {item.short}
                {count > 0 && (
                  <span className="absolute left-1/2 top-2 ml-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
                    {count}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={onMore}
            aria-haspopup="dialog"
            className={cn(
              "flex min-h-16 w-full flex-col items-center justify-center gap-1 text-[11.5px] font-semibold",
              !inBar ? "text-primary" : "text-muted-foreground"
            )}
          >
            <MoreIcon />
            Thêm
          </button>
        </li>
      </ul>
    </nav>
  );
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

const DEMO_BANNER_KEY = "greencity-demo-banner-hidden";

export function DemoBanner() {
  // Khung trang chỉ vẽ sau khi store sẵn sàng (sau hydrate) nên đọc localStorage ngay ở đây không gây lệch HTML
  const [hidden, setHidden] = useState(() => {
    try {
      return typeof window !== "undefined" && window.localStorage.getItem(DEMO_BANNER_KEY) === "1";
    } catch {
      return false;
    }
  });
  if (hidden) return null;
  const hide = () => {
    setHidden(true);
    try {
      window.localStorage.setItem(DEMO_BANNER_KEY, "1");
    } catch {
      /* không lưu được thì chỉ ẩn trong phiên này */
    }
  };
  return (
    <div className="flex items-center gap-3 border-t border-border bg-accent px-4 py-2 text-[13px] text-accent-foreground sm:px-6 lg:px-8">
      <p className="flex-1">
        Bạn đang dùng <strong>bản demo</strong>: dữ liệu là minh họa và chỉ lưu trên trình duyệt này.
      </p>
      <button
        type="button"
        onClick={hide}
        aria-label="Ẩn thông báo bản demo"
        className="-my-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-background/60"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

const ROLE_DESC: Record<UserRole, string> = {
  resident: "Bán ve chai, mua bán đồ thanh lý, gọi thu gom, tích điểm.",
  partner: "Người ve chai, vựa phế liệu: xem tin phế liệu quanh đây và đặt thu mua.",
  collaborator: "Kiểm tra lượt bỏ thùng, xác minh báo cáo điểm rác.",
  business: "Xem và đặt giữ lô vật liệu đã kiểm định, xem thống kê.",
  operator: "Điều hành đơn thu gom, thùng, điểm thưởng và đối tác.",
};

/** Bản demo: đổi vai trò để xem từng khu. Bản thật mỗi tài khoản có một vai trò cố định. */
export function DemoRolePicker({ role, onPick }: { role: UserRole; onPick: (r: UserRole) => void }) {
  return (
    <section aria-labelledby="demo-role" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h3 id="demo-role" className="flex items-center gap-2 text-[16px] font-bold text-foreground">
        <FlaskConical className="h-[18px] w-[18px] text-primary" aria-hidden="true" />
        Chế độ demo: đổi vai trò
      </h3>
      <p className="mt-1 text-[14px] text-muted-foreground">
        Bản thật mỗi tài khoản có một vai trò cố định. Ở bản demo bạn đổi qua lại để xem từng khu.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-labelledby="demo-role">
        {(Object.keys(ROLE_DESC) as UserRole[]).map((key) => (
          <label
            key={key}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors",
              role === key
                ? "border-primary bg-accent dark:bg-primary-soft dark:text-primary"
                : "border-border bg-card hover:border-primary/40 hover:bg-surface-hover"
            )}
          >
            <input
              type="radio"
              name="demo-role"
              value={key}
              checked={role === key}
              onChange={() => onPick(key)}
              className="mt-0.5 h-5 w-5 accent-primary"
            />
            <span>
              <span className="block text-[15px] font-bold text-foreground">{ROLE_LABEL[key]}</span>
              <span className="block text-[13px] text-muted-foreground">{ROLE_DESC[key]}</span>
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}
