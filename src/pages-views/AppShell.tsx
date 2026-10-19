"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, LayoutGrid, Lock, LogIn, LogOut, X } from "lucide-react";
import { useApp } from "@/store/app-store";
import { Logo, LogoMark } from "@/components/greencity/Logo";
import { ThemeToggle } from "@/components/greencity/ThemeToggle";
import { GcModal } from "@/components/greencity/GcModal";
import { EmptyState } from "@/components/greencity/EmptyState";
import { PageContainer, buttonClass } from "@/components/greencity/ui";
import { ROUTES, loginHref } from "@/lib/routes";
import { canAccess, isPublicPath, rolesFor } from "@/lib/access";
import { ROLE_LABEL } from "@/data/labels";
import { initialsOf } from "@/utils/format";
import { cn } from "@/lib/utils";
import { MOBILE_NAV, isActive, navFor, titleFor, type NavGroup } from "./nav";

const DEMO_BANNER_KEY = "greencity-demo-banner-hidden";

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
  const [moreOpen, setMoreOpen] = useState(false);
  const user = state.user;
  const publicPage = isPublicPath(pathname);

  // Chưa đăng nhập ở trang cần tài khoản → sang trang đăng nhập (xong quay lại đúng trang này).
  // Vừa tự bấm đăng xuất → về trang chủ.
  useEffect(() => {
    if (state.ready && !user && !publicPage) router.replace(state.signedOut ? ROUTES.home : loginHref(pathname));
  }, [state.ready, state.signedOut, user, publicPage, pathname, router]);

  // Menu dài (vai trò vận hành): cuộn mục đang mở vào tầm nhìn
  useEffect(() => {
    document.querySelector('aside [aria-current="page"]')?.scrollIntoView({ block: "nearest" });
  }, [pathname, state.ready]);

  if (!state.ready || (!user && !publicPage)) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background" aria-busy="true">
        <LogoMark size={64} className="opacity-80" />
        <span className="sr-only">Đang tải…</span>
      </div>
    );
  }

  const groups = navFor(user?.role ?? null);
  const allowed = !user || canAccess(pathname, user.role);
  const favCount = state.favorites.length;
  const inMobileNav = MOBILE_NAV.some((i) => isActive(pathname, i.href));

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
        <Link href={user ? ROUTES.dashboard : ROUTES.home} className="mx-5 mb-2 mt-5 w-fit rounded-xl" aria-label="Về trang Tổng quan">
          <Logo size={44} />
        </Link>
        <nav aria-label="Điều hướng chính" className="flex flex-1 flex-col overflow-y-auto px-3 pb-3">
          <NavGroups groups={groups} pathname={pathname} favCount={favCount} dense />
        </nav>
        {user ? (
          <div className="m-3 flex items-center gap-3 rounded-2xl border border-border p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-[14px] font-bold text-primary-foreground">
              {initialsOf(user.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-bold text-foreground">{user.name}</p>
              <p className="truncate text-[12px] text-muted-foreground">{ROLE_LABEL[user.role]}</p>
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
        ) : (
          <div className="m-3 flex flex-col gap-2">
            <Link href={loginHref(pathname)} className={buttonClass.primary}>
              <LogIn className="h-[18px] w-[18px]" aria-hidden="true" />
              Đăng nhập
            </Link>
            <Link href={ROUTES.register} className={buttonClass.secondary}>
              Tạo tài khoản
            </Link>
          </div>
        )}
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* ---------- Thanh trên ---------- */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/95">
          <div className="flex h-16 items-center gap-2 px-4 sm:px-6 lg:px-8">
            <Link href={user ? ROUTES.dashboard : ROUTES.home} className="rounded-xl lg:hidden" aria-label="Về trang Tổng quan">
              <Logo size={36} withText={false} />
            </Link>
            <h1 className="ml-1 truncate text-[17px] font-bold text-foreground lg:ml-0">{titleFor(pathname)}</h1>
            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              {user && (
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
              )}
              <ThemeToggle />
              {user ? (
                <Link
                  href={ROUTES.profile}
                  aria-label="Hồ sơ của tôi"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-[13px] font-bold text-primary-foreground"
                >
                  {initialsOf(user.name)}
                </Link>
              ) : (
                <Link href={loginHref(pathname)} className={cn(buttonClass.primary, "min-h-10 px-4 text-[14px] lg:hidden")}>
                  Đăng nhập
                </Link>
              )}
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
          {allowed ? children : <NoAccess pathname={pathname} role={user!.role} />}
        </main>
      </div>

      {/* ---------- Thanh đáy (điện thoại / máy tính bảng) ---------- */}
      <nav
        aria-label="Điều hướng nhanh"
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
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-haspopup="dialog"
              className={cn(
                "flex min-h-16 w-full flex-col items-center justify-center gap-1 text-[11.5px] font-semibold",
                !inMobileNav ? "text-primary" : "text-muted-foreground"
              )}
            >
              <LayoutGrid className="h-[22px] w-[22px]" aria-hidden="true" />
              Thêm
            </button>
          </li>
        </ul>
      </nav>

      <GcModal open={moreOpen} onClose={() => setMoreOpen(false)} title="Tất cả mục" size="sm">
        <nav aria-label="Tất cả mục">
          <NavGroups groups={groups} pathname={pathname} favCount={favCount} onNavigate={() => setMoreOpen(false)} />
        </nav>
      </GcModal>
    </div>
  );
}

function NavGroups({
  groups,
  pathname,
  favCount,
  onNavigate,
  dense = false,
}: {
  groups: NavGroup[];
  pathname: string;
  favCount: number;
  onNavigate?: () => void;
  /** Sidebar desktop (bấm bằng chuột): dòng thấp hơn để cả menu vừa màn hình 900px. */
  dense?: boolean;
}) {
  return (
    <>
      {groups.map((g, gi) => (
        <div key={g.title} className={cn(gi > 0 && (dense ? "mt-2.5" : "mt-4"))}>
          <p className="px-3.5 pb-0.5 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">{g.title}</p>
          <ul className="flex flex-col gap-0.5">
            {g.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3.5 font-semibold transition-colors duration-150",
                      dense ? "min-h-9 text-[14.5px]" : "min-h-11 text-[15px]",
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
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </>
  );
}

/** Trang dành cho vai trò khác — bản demo cho đổi vai trò trong Hồ sơ. */
function NoAccess({ pathname, role }: { pathname: string; role: keyof typeof ROLE_LABEL }) {
  const roles = rolesFor(pathname) ?? [];
  return (
    <PageContainer>
      <EmptyState
        icon={Lock}
        title={`Trang này dành cho ${roles.map((r) => ROLE_LABEL[r].toLowerCase()).join(" và ")}`}
        description={`Bạn đang dùng vai trò ${ROLE_LABEL[role].toLowerCase()}. Bản demo cho phép đổi vai trò trong Hồ sơ để xem thử.`}
        action={
          <Link href={ROUTES.profile} className={buttonClass.primary}>
            Đổi vai trò
          </Link>
        }
      />
    </PageContainer>
  );
}
