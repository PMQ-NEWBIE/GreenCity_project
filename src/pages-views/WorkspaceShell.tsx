"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Lock, LogOut } from "lucide-react";
import { useApp } from "@/store/app-store";
import { useDemoStarter } from "@/store/use-demo-starter";
import { useOrders, useOrderDemo } from "@/store/use-orders";
import { useDemandDemo } from "@/store/use-demands";
import { useCollect } from "@/store/hooks";
import { isOpen } from "@/lib/orders";
import { Logo } from "@/components/greencity/Logo";
import { ThemeToggle } from "@/components/greencity/ThemeToggle";
import { GcModal } from "@/components/greencity/GcModal";
import { EmptyState } from "@/components/greencity/EmptyState";
import { PageContainer, buttonClass } from "@/components/greencity/ui";
import { ROUTES, loginHref } from "@/lib/routes";
import { canAccess, homeFor, isStaff, rolesFor } from "@/lib/access";
import { ROLE_LABEL } from "@/data/labels";
import type { UserRole } from "@/types";
import { initialsOf } from "@/utils/format";
import { cn } from "@/lib/utils";
import { WORKSPACE_LABEL, WORKSPACE_SHORT, titleFor, workspaceNav } from "./nav";
import { BottomNav, DemoBanner, DemoRolePicker, NavGroups, ShellLoading, type BadgeCounts } from "./shell-parts";

/**
 * Khung trang riêng cho nhân sự và đối tác: nhóm vận hành, cộng tác viên, doanh nghiệp tái chế.
 * Sidebar nền tối + nhãn khu để nhìn là biết đang ở chỗ làm việc, không lẫn với trang mua bán của người dân.
 */
export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const { state, logout, setRole, toast } = useApp();
  // Đối tác thu mua đặt đơn vào tin phế liệu của người dân → đếm đơn đang mở, mô phỏng người bán (bản demo)
  const { bought } = useOrders();
  const { requests } = useCollect();
  useOrderDemo();
  useDemandDemo();
  useDemoStarter();
  const router = useRouter();
  const pathname = usePathname();
  const [accountOpen, setAccountOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const user = state.user;

  // Chưa đăng nhập → đăng nhập. Người dân không có việc ở đây → về trang mua bán.
  useEffect(() => {
    if (!state.ready) return;
    if (!user) router.replace(state.signedOut ? ROUTES.home : loginHref(pathname));
    else if (!isStaff(user.role)) router.replace(homeFor(user.role, state.mode));
  }, [state.ready, state.signedOut, state.mode, user, pathname, router]);

  if (!state.ready || !user || !isStaff(user.role)) return <ShellLoading />;

  const role = user.role as Exclude<UserRole, "resident">;
  const groups = workspaceNav(role);
  const items = groups.flatMap((g) => g.items);
  const area = WORKSPACE_LABEL[role];
  const badges: BadgeCounts = {
    bought: bought.filter(isOpen).length,
    pickups: requests.filter((r) => r.status === "cho-nhan").length,
  };

  const pickRole = (r: UserRole) => {
    setRole(r);
    setAccountOpen(false);
    toast("success", `Đã chuyển sang vai trò ${ROLE_LABEL[r].toLowerCase()}`);
    router.replace(homeFor(r, state.mode));
  };
  const onLogout = () => {
    logout();
    toast("info", "Đã đăng xuất", "Hẹn gặp lại bạn.");
  };

  return (
    <div className="min-h-dvh bg-background lg:grid lg:grid-cols-[256px_minmax(0,1fr)]">
      {/* ---------- Sidebar tối (desktop) ---------- */}
      <aside className="sticky top-0 hidden h-dvh flex-col bg-gc-950 text-gc-50 dark:bg-surface dark:text-foreground dark:border-r dark:border-border lg:flex">
        <Link href={homeFor(role)} className="mx-5 mt-5 w-fit rounded-xl" aria-label={`Về trang đầu ${area.toLowerCase()}`}>
          <Logo size={40} variant="white" />
        </Link>
        <p className="mx-5 mt-4 w-fit rounded-lg border border-gc-50/15 bg-gc-50/10 dark:border-primary-border/60 dark:bg-primary-soft dark:text-primary px-2.5 py-1 text-[12.5px] font-bold uppercase tracking-wide text-gc-200">{area}</p>
        <nav aria-label={area} className="mt-5 flex flex-1 flex-col overflow-y-auto px-3 pb-3">
          <NavGroups groups={groups} pathname={pathname} badges={badges} tone="dark" dense />
        </nav>
        <button
          type="button"
          onClick={() => setAccountOpen(true)}
          className="m-3 flex items-center gap-3 rounded-2xl border border-gc-50/12 dark:border-border p-3 text-left hover:bg-gc-50/8 dark:hover:bg-surface-hover"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gc-50 text-[14px] font-bold text-gc-900 dark:bg-primary dark:text-primary-foreground">
            {initialsOf(user.name)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-bold text-white dark:text-foreground">{user.name}</span>
            <span className="block truncate text-[12px] text-gc-200/80 dark:text-text-muted">{ROLE_LABEL[role]}</span>
            <span className="sr-only">Tài khoản</span>
          </span>
        </button>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <span className="shrink-0 rounded-lg bg-gc-950 dark:bg-surface dark:border dark:border-border dark:text-foreground px-2 py-1 text-[11.5px] font-bold uppercase tracking-wide text-gc-100 lg:hidden" title={area}>{WORKSPACE_SHORT[role]}</span>
            <h1 className="truncate text-[17px] font-bold text-foreground">{titleFor(pathname)}</h1>
            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              <ThemeToggle />
              <button
                type="button"
                onClick={() => setAccountOpen(true)}
                aria-label="Tài khoản"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gc-950 text-[13px] font-bold text-gc-50 dark:bg-primary dark:text-primary-foreground lg:hidden"
              >
                {initialsOf(user.name)}
              </button>
            </div>
          </div>
          <DemoBanner />
        </header>

        <main key={pathname} className={cn("page-enter flex-1 lg:pb-12", items.length > 1 ? "pb-28" : "pb-12")}>
          {canAccess(pathname, role) ? children : <NoAccess pathname={pathname} role={role} />}
        </main>
      </div>

      {items.length > 1 && <BottomNav items={items.slice(0, 4)} pathname={pathname} badges={badges} onMore={() => setMoreOpen(true)} />}

      <GcModal open={moreOpen} onClose={() => setMoreOpen(false)} title={area} size="sm">
        <nav aria-label={area}>
          <NavGroups groups={groups} pathname={pathname} badges={badges} onNavigate={() => setMoreOpen(false)} />
        </nav>
      </GcModal>

      <GcModal open={accountOpen} onClose={() => setAccountOpen(false)} title="Tài khoản" description={`${user.name} · ${user.email}`}>
        <DemoRolePicker role={role} onPick={pickRole} />
        <button type="button" onClick={onLogout} className={cn(buttonClass.secondary, "mt-4 w-full hover:border-destructive/50 hover:text-destructive")}>
          <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
          Đăng xuất
        </button>
      </GcModal>
    </div>
  );
}

/** Trang của khu khác (ví dụ cộng tác viên mở link bảng điều hành). */
function NoAccess({ pathname, role }: { pathname: string; role: UserRole }) {
  const roles = rolesFor(pathname) ?? [];
  return (
    <PageContainer>
      <EmptyState
        icon={Lock}
        title={`Trang này dành cho ${roles.map((r) => ROLE_LABEL[r].toLowerCase()).join(" và ")}`}
        description={`Tài khoản của bạn là ${ROLE_LABEL[role].toLowerCase()}.`}
        action={
          <Link href={homeFor(role)} className={buttonClass.primary}>
            Về khu của bạn
          </Link>
        }
      />
    </PageContainer>
  );
}
