"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Compass,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Recycle,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import { useApp } from "@/store/app-store";
import { Logo } from "@/components/greencity/Logo";
import { DashboardView } from "./DashboardView";
import { DiscoverView } from "./DiscoverView";
import { ProductDetailView } from "./ProductDetailView";
import { SellView } from "./SellView";
import { CollectView } from "./CollectView";
import { FavoritesView } from "./FavoritesView";
import { ProfileView } from "./ProfileView";
import { initialsOf } from "@/utils/format";
import { cn } from "@/lib/utils";
import type { AppPage } from "@/types";

const NAV_ITEMS: { page: AppPage; label: string; icon: typeof LayoutDashboard }[] = [
  { page: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { page: "discover", label: "Khám phá", icon: Compass },
  { page: "sell", label: "Đăng tin bán", icon: Package },
  { page: "collect", label: "Yêu cầu thu gom", icon: Truck },
  { page: "favorites", label: "Yêu thích", icon: Heart },
  { page: "profile", label: "Hồ sơ cá nhân", icon: UserRound },
];

const PAGE_TITLES: Record<AppPage, string> = {
  dashboard: "Tổng quan",
  discover: "Khám phá sản phẩm",
  product: "Chi tiết sản phẩm",
  sell: "Đăng tin bán hàng",
  collect: "Yêu cầu thu gom",
  favorites: "Sản phẩm yêu thích",
  profile: "Hồ sơ cá nhân",
};

function NavPill({ item, active, onClick, badge }: { item: (typeof NAV_ITEMS)[number]; active: boolean; onClick: () => void; badge?: number }) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[14px] font-semibold transition-colors duration-200",
        active ? "text-primary" : "text-foreground/62 hover:bg-accent/70 hover:text-forest"
      )}
    >
      {active && (
        <motion.span
          layoutId="nav-pill"
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
          className="absolute inset-0 rounded-2xl bg-accent"
        />
      )}
      <Icon className={cn("relative h-[19px] w-[19px] transition-transform duration-200", !active && "group-hover:scale-110")} />
      <span className="relative">{item.label}</span>
      {item.page === "favorites" && badge !== undefined && badge > 0 && (
        <span className="relative ml-auto rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-white">
          {badge}
        </span>
      )}
    </button>
  );
}

export function AppShell() {
  const { state, goApp, logout, toast, setDiscoverPreset } = useApp();
  const route = state.route as { screen: "app"; page: AppPage; productId?: string };
  const page = route.page;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const favCount = state.favorites.length;

  const user = state.user;

  // Guard: khi logout, AnimatePresence vẫn giữ shell trong lúc exit — tránh crash null
  if (!user) return null;

  const goPage = (p: AppPage) => {
    setDrawerOpen(false);
    setNotifOpen(false);
    setDiscoverPreset("all");
    goApp(p);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="px-6 pb-4 pt-6">
        <Logo size={40} />
      </div>
      <nav className="nice-scroll flex flex-1 flex-col gap-1 overflow-y-auto px-4" aria-label="Điều hướng ứng dụng">
        {NAV_ITEMS.map((item) => (
          <NavPill key={item.page} item={item} active={page === item.page} onClick={() => goPage(item.page)} badge={item.page === "favorites" ? favCount : undefined} />
        ))}
      </nav>
      <div className="mt-4 border-t border-border px-4 pb-5 pt-4">
        <div className="flex items-center gap-3 rounded-2xl bg-[#f3f8f2] p-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-[#2a9a5d] to-primary text-[15px] font-bold text-white shadow-md shadow-primary/25">
            {initialsOf(user.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13.5px] font-bold text-forest">{user.name}</p>
            <p className="truncate text-[12px] text-muted-foreground">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              toast("info", "Đã đăng xuất (demo)", "Hẹn gặp lại bạn ở phiên trình diễn sau.");
              logout();
            }}
            aria-label="Đăng xuất"
            title="Đăng xuất"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-all duration-200 hover:bg-white hover:text-destructive"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-dvh w-[272px] shrink-0 border-r border-border bg-white lg:block">
        {sidebarContent}
      </aside>

      {/* Drawer mobile */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 z-40 bg-forest/40 backdrop-blur-[2px] lg:hidden"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-50 w-[290px] border-r border-border bg-white shadow-2xl lg:hidden"
            >
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Đóng menu"
                className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Vùng nội dung */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 glass-header border-b border-border/80">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Mở menu"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-foreground transition-colors hover:bg-muted lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="lg:hidden">
              <Logo size={32} />
            </div>
            <h1 className="hidden text-[17px] font-bold tracking-tight text-forest lg:block">
              {PAGE_TITLES[page]}
            </h1>
            <div className="ml-auto flex items-center gap-2.5">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotifOpen((o) => !o)}
                  aria-label="Thông báo"
                  className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-foreground/70 transition-colors hover:text-primary",
                    notifOpen && "border-primary/50 text-primary"
                  )}
                >
                  <Bell className="h-[18px] w-[18px]" />
                  <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-warn text-[10px] font-bold text-white">
                    3
                  </span>
                </button>
                <AnimatePresence>
                  {notifOpen && (
                    <>
                      <button
                        type="button"
                        aria-label="Đóng thông báo"
                        className="fixed inset-0 z-40 cursor-default"
                        onClick={() => setNotifOpen(false)}
                      />
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 top-12 z-50 w-[300px] overflow-hidden rounded-2xl border border-border bg-white shadow-xl"
                    >
                      <p className="border-b border-border bg-[#fafcfa] px-4 py-3 text-[13px] font-bold text-forest">
                        Thông báo (demo)
                      </p>
                      <div className="flex flex-col">
                        {[
                          { icon: Heart, t: "Có người quan tâm tin của bạn", d: "Chai nhựa PET — Quận 7", time: "5 phút trước" },
                          { icon: Truck, t: "Yêu cầu thu gom đã được ghép", d: "Người thu gom tại Quận 3", time: "1 giờ trước" },
                          { icon: Recycle, t: "Lô lon nhôm đã tái chế", d: "8kg — Tân Bình", time: "Hôm qua" },
                        ].map((n, i) => (
                          <div key={i} className="flex items-start gap-3 border-b border-border/60 px-4 py-3 transition-colors last:border-0 hover:bg-accent/50">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                              <n.icon className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="text-[13px] font-semibold leading-snug text-foreground">{n.t}</p>
                              <p className="mt-0.5 text-[12px] text-muted-foreground">{n.d}</p>
                              <p className="mt-0.5 text-[11px] text-muted-foreground/70">{n.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
              <button
                type="button"
                onClick={() => goPage("profile")}
                aria-label="Hồ sơ cá nhân"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-b from-[#2a9a5d] to-primary text-[13px] font-bold text-white shadow-md shadow-primary/25"
              >
                {initialsOf(user.name)}
              </button>
            </div>
          </div>
        </header>

        {/* Nội dung trang */}
        <main className="relative flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${page}-${route.productId ?? ""}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="min-h-full"
            >
              <PageRouter page={page} productId={route.productId} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function PageRouter({ page, productId }: { page: AppPage; productId?: string }) {
  switch (page) {
    case "dashboard":
      return <DashboardView />;
    case "discover":
      return <DiscoverView />;
    case "product":
      return <ProductDetailView productId={productId} />;
    case "sell":
      return <SellView />;
    case "collect":
      return <CollectView />;
    case "favorites":
      return <FavoritesView />;
    case "profile":
      return <ProfileView />;
    default:
      return <DashboardView />;
  }
}
