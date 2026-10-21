"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogIn, LogOut } from "lucide-react";
import { useApp } from "@/store/app-store";
import { useOrders, useOrderDemo } from "@/store/use-orders";
import { Logo } from "@/components/greencity/Logo";
import { ThemeToggle } from "@/components/greencity/ThemeToggle";
import { GcModal } from "@/components/greencity/GcModal";
import { buttonClass } from "@/components/greencity/ui";
import { ROUTES, loginHref } from "@/lib/routes";
import { homeFor, isPublicPath, isStaff, type AppMode } from "@/lib/access";
import { isOpen } from "@/lib/orders";
import { initialsOf } from "@/utils/format";
import { cn } from "@/lib/utils";
import { mobileNav, modeForPath, residentNav, titleFor } from "./nav";
import { BottomNav, DemoBanner, NavGroups, ShellLoading, type BadgeCounts } from "./shell-parts";

/**
 * Khung trang của người dân. Một tài khoản, hai chế độ:
 *  - Tôi bán: tin của mình, đơn người khác đặt, gọi thu gom
 *  - Tôi mua: tìm tin, đơn mình đặt, đồ đã lưu
 * Mỗi chế độ chỉ hiện menu của nó. Nhân sự / đối tác (vai trò khác) được đưa sang khu làm việc riêng.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { state, logout, setMode, toast } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const { incoming, bought } = useOrders();
  useOrderDemo();

  const user = state.user;
  const publicPage = isPublicPath(pathname);
  const staff = !!user && isStaff(user.role);
  // Trang thuộc riêng một chế độ quyết định chế độ (vẽ ngay theo trang, store đồng bộ sau)
  const routeMode = modeForPath(pathname);
  const mode: AppMode = routeMode ?? state.mode;

  // Chưa đăng nhập ở trang cần tài khoản → đăng nhập (xong quay lại đúng trang). Vừa tự đăng xuất → trang chủ.
  // Nhân sự / đối tác → khu làm việc của họ.
  useEffect(() => {
    if (!state.ready) return;
    if (!user && !publicPage) router.replace(state.signedOut ? ROUTES.home : loginHref(pathname));
    else if (user && isStaff(user.role)) router.replace(homeFor(user.role));
  }, [state.ready, state.signedOut, user, staff, publicPage, pathname, router]);

  useEffect(() => {
    if (state.ready && routeMode && routeMode !== state.mode) setMode(routeMode);
  }, [state.ready, routeMode, state.mode, setMode]);

  if (!state.ready || (!user && !publicPage) || staff) return <ShellLoading />;

  const badges: BadgeCounts = {
    incoming: incoming.filter((o) => o.status === "pending").length,
    bought: bought.filter(isOpen).length,
    favorites: state.favorites.length,
  };
  const groups = residentNav(mode);

  const switchMode = (m: AppMode) => {
    setMoreOpen(false);
    if (m === mode) return;
    setMode(m);
    router.push(homeFor("resident", m));
  };

  const onLogout = () => {
    logout();
    toast("info", "Đã đăng xuất", "Hẹn gặp lại bạn.");
  };

  return (
    <div className="min-h-dvh bg-background lg:grid lg:grid-cols-[264px_minmax(0,1fr)]">
      {/* ---------- Sidebar (desktop) ---------- */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-border bg-card lg:flex">
        <Link href={user ? homeFor("resident", mode) : ROUTES.home} className="mx-5 mb-4 mt-5 w-fit rounded-xl" aria-label="Về trang đầu">
          <Logo size={44} />
        </Link>
        <ModeSwitch mode={mode} onChange={switchMode} className="mx-3" />
        <nav aria-label="Điều hướng chính" className="mt-4 flex flex-1 flex-col overflow-y-auto px-3 pb-3">
          <NavGroups groups={groups} pathname={pathname} badges={badges} dense />
        </nav>
        {user ? (
          <div className="m-3 flex items-center gap-1 rounded-2xl border border-border p-2">
            <Link href={ROUTES.profile} className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1.5 hover:bg-muted">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-[14px] font-bold text-primary-foreground">
                {initialsOf(user.name)}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-bold text-foreground">{user.name}</span>
                <span className="block truncate text-[12px] text-muted-foreground">Hồ sơ của tôi</span>
              </span>
            </Link>
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
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
          <div className="flex h-16 items-center gap-2 px-4 sm:px-6 lg:px-8">
            <h1 className="truncate text-[17px] font-bold text-foreground">{titleFor(pathname)}</h1>
            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              <ModeSwitch mode={mode} onChange={switchMode} compact className="lg:hidden" />
              <ThemeToggle />
              {user ? (
                <Link
                  href={ROUTES.profile}
                  aria-label="Hồ sơ của tôi"
                  className="hidden h-10 w-10 items-center justify-center rounded-xl bg-primary text-[13px] font-bold text-primary-foreground shadow-xs sm:flex"
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
          <DemoBanner />
        </header>

        {/* ---------- Nội dung ---------- */}
        <main key={pathname} className="page-enter flex-1 pb-28 lg:pb-12">
          {children}
        </main>
      </div>

      <BottomNav
        items={mobileNav(mode)}
        pathname={pathname}
        badges={badges}
        highlight={mode === "sell" ? ROUTES.sell : undefined}
        onMore={() => setMoreOpen(true)}
      />

      <GcModal open={moreOpen} onClose={() => setMoreOpen(false)} title="Tất cả mục" size="sm">
        <ModeSwitch mode={mode} onChange={switchMode} />
        <nav aria-label="Tất cả mục" className="mt-5">
          <NavGroups groups={groups} pathname={pathname} badges={badges} onNavigate={() => setMoreOpen(false)} />
        </nav>
        {user && (
          <div className="mt-5 flex gap-2 border-t border-border pt-4">
            <Link href={ROUTES.profile} onClick={() => setMoreOpen(false)} className={cn(buttonClass.secondary, "flex-1")}>
              Hồ sơ của tôi
            </Link>
            <button type="button" onClick={onLogout} className={cn(buttonClass.secondary, "hover:border-destructive/50 hover:text-destructive")}>
              <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
              Đăng xuất
            </button>
          </div>
        )}
      </GcModal>
    </div>
  );
}

const MODES: { key: AppMode; label: string; short: string }[] = [
  { key: "sell", label: "Tôi bán", short: "Bán" },
  { key: "buy", label: "Tôi mua", short: "Mua" },
];

/** Công tắc chế độ — hai nút như tab, nhìn là biết đang ở phía nào. */
function ModeSwitch({
  mode,
  onChange,
  compact = false,
  className,
}: {
  mode: AppMode;
  onChange: (m: AppMode) => void;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div role="group" aria-label="Chế độ" className={cn("grid grid-cols-2 rounded-xl border border-border/60 bg-muted/80 p-1", className)}>
      {MODES.map((m) => (
        <button
          key={m.key}
          type="button"
          aria-pressed={mode === m.key}
          onClick={() => onChange(m.key)}
          className={cn(
            "rounded-lg font-bold transition-all duration-150",
            compact ? "min-h-9 px-3 text-[13.5px]" : "min-h-10 px-3 text-[14.5px]",
            mode === m.key ? "border border-border/40 bg-card text-primary shadow-xs" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {compact ? m.short : m.label}
        </button>
      ))}
    </div>
  );
}
