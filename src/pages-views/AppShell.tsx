"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  Heart,
  House,
  LogOut,
  PackagePlus,
  Truck,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { useApp } from "@/store/app-store";
import { Logo, LogoMark } from "@/components/greencity/Logo";
import { ThemeToggle } from "@/components/greencity/ThemeToggle";
import { ROUTES, loginHref } from "@/lib/routes";
import { initialsOf } from "@/utils/format";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  /** Nhãn ngắn cho thanh điều hướng đáy trên điện thoại */
  short: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { href: ROUTES.dashboard, label: "Tổng quan", short: "Tổng quan", icon: House },
  { href: ROUTES.discover, label: "Khám phá & mua", short: "Khám phá", icon: Compass },
  { href: ROUTES.sell, label: "Đăng tin bán", short: "Đăng tin", icon: PackagePlus },
  { href: ROUTES.collect, label: "Gọi thu gom", short: "Thu gom", icon: Truck },
  { href: ROUTES.favorites, label: "Đã lưu", short: "Đã lưu", icon: Heart },
  { href: ROUTES.profile, label: "Hồ sơ của tôi", short: "Hồ sơ", icon: UserRound },
];

/** Thanh đáy trên điện thoại: 5 mục, "Đăng tin" ở giữa. "Đã lưu" nằm ở thanh trên. */
const MOBILE_NAV = [NAV[0], NAV[1], NAV[2], NAV[3], NAV[5]];

const PAGE_TITLES: { prefix: string; title: string }[] = [
  { prefix: ROUTES.dashboard, title: "Tổng quan" },
  { prefix: ROUTES.discover, title: "Khám phá & mua" },
  { prefix: "/san-pham", title: "Chi tiết tin đăng" },
  { prefix: ROUTES.sell, title: "Đăng tin bán" },
  { prefix: ROUTES.collect, title: "Gọi thu gom" },
  { prefix: ROUTES.favorites, title: "Đã lưu" },
  { prefix: ROUTES.profile, title: "Hồ sơ của tôi" },
];

const DEMO_BANNER_KEY = "greencity-demo-banner-hidden";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { state, logout, toast } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  // Banner chỉ hiện sau khi store sẵn sàng (sau hydrate) nên đọc localStorage ngay ở đây không gây lệch HTML
  const [bannerHidden, setBannerHidden] = useState(() => {
    try {
      return typeof window !== "undefined" && window.localStorage.getItem(DEMO_BANNER_KEY) === "1";
    } catch {
      return false;
    }
  });
  const user = state.user;

  // Chưa đăng nhập → sang trang đăng nhập (xong quay lại đúng trang này).
  // Vừa tự bấm đăng xuất → về trang chủ.
  useEffect(() => {
    if (state.ready && !user) router.replace(state.signedOut ? ROUTES.home : loginHref(pathname));
  }, [state.ready, state.signedOut, user, pathname, router]);

  if (!state.ready || !user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background" aria-busy="true">
        <LogoMark size={64} className="opacity-80" />
        <span className="sr-only">Đang tải…</span>
      </div>
    );
  }

  const title = PAGE_TITLES.find((p) => pathname.startsWith(p.prefix))?.title ?? "Green City";
  const favCount = state.favorites.length;

  const onLogout = () => {
    logout();
    toast("info", "Đã đăng xuất", "Hẹn gặp lại bạn.");
  };

  const hideBanner = () => {
    setBannerHidden(true);
    try {
      window.localStorage.setItem(DEMO_BANNER_KEY, "1");
    } catch {
      /* không lưu được thì chỉ ẩn trong phiên này */
    }
  };

  return (
    <div className="min-h-dvh bg-background lg:grid lg:grid-cols-[256px_minmax(0,1fr)]">
      {/* ---------- Sidebar (desktop) ---------- */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-border bg-card lg:flex">
        <Link href={ROUTES.dashboard} className="mx-5 mb-4 mt-5 w-fit rounded-xl" aria-label="Về trang Tổng quan">
          <Logo size={44} />
        </Link>
        <nav aria-label="Điều hướng chính" className="flex flex-1 flex-col gap-1 overflow-y-auto px-3">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-[15px] font-semibold transition-colors duration-150",
                  active ? "bg-accent text-primary" : "text-foreground/75 hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                {item.label}
                {item.href === ROUTES.favorites && favCount > 0 && (
                  <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[12px] font-bold text-primary-foreground">
                    {favCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="m-3 flex items-center gap-3 rounded-2xl border border-border p-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-[14px] font-bold text-primary-foreground">
            {initialsOf(user.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-bold text-foreground">{user.name}</p>
            <p className="truncate text-[12px] text-muted-foreground">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            aria-label="Đăng xuất"
            title="Đăng xuất"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-destructive"
          >
            <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* ---------- Thanh trên ---------- */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/95">
          <div className="flex h-16 items-center gap-2 px-4 sm:px-6 lg:px-8">
            <Link href={ROUTES.dashboard} className="rounded-xl lg:hidden" aria-label="Về trang Tổng quan">
              <Logo size={36} withText={false} />
            </Link>
            <h1 className="ml-1 truncate text-[17px] font-bold text-foreground lg:ml-0">{title}</h1>
            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              <Link
                href={ROUTES.favorites}
                aria-label={`Đã lưu (${favCount})`}
                className="relative flex h-11 w-11 items-center justify-center rounded-xl text-foreground/75 hover:bg-muted hover:text-foreground lg:hidden"
              >
                <Heart className="h-5 w-5" aria-hidden="true" />
                {favCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
                    {favCount}
                  </span>
                )}
              </Link>
              <ThemeToggle />
              <Link
                href={ROUTES.profile}
                aria-label="Hồ sơ của tôi"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-[13px] font-bold text-primary-foreground"
              >
                {initialsOf(user.name)}
              </Link>
            </div>
          </div>
          {!bannerHidden && (
            <div className="flex items-center gap-3 border-t border-border bg-accent px-4 py-2 text-[13px] text-accent-foreground sm:px-6 lg:px-8">
              <p className="flex-1">
                Bạn đang dùng <strong>bản demo</strong>: dữ liệu là minh họa và chỉ lưu trên trình duyệt này.
              </p>
              <button
                type="button"
                onClick={hideBanner}
                aria-label="Ẩn thông báo bản demo"
                className="-my-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-background/60"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </header>

        {/* ---------- Nội dung ---------- */}
        <main key={pathname} className="page-enter flex-1 pb-28 lg:pb-12">
          {children}
        </main>
      </div>

      {/* ---------- Thanh đáy (điện thoại / máy tính bảng) ---------- */}
      <nav
        aria-label="Điều hướng chính"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {MOBILE_NAV.map((item) => {
            const active = isActive(pathname, item.href);
            const isSell = item.href === ROUTES.sell;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-16 flex-col items-center justify-center gap-1 text-[11.5px] font-semibold",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {isSell ? (
                    <span className="flex h-9 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                      <item.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  ) : (
                    <item.icon className="h-[22px] w-[22px]" aria-hidden="true" />
                  )}
                  {item.short}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
