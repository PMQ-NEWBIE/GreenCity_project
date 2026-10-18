"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Leaf, LogIn, Menu, Plus, X } from "lucide-react";
import { useApp } from "@/store/app-store";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { id: "top", label: "Trang chủ" },
  { id: "categories", label: "Danh mục" },
  { id: "products", label: "Khám phá" },
  { id: "collect", label: "Thu gom" },
  { id: "process", label: "Giới thiệu" },
];

export function Navbar() {
  const { goAuth, setPending, toast } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const startSelling = () => {
    setMenuOpen(false);
    setPending({ screen: "app", page: "sell" });
    goAuth("register");
    toast("info", "Tạo tài khoản để đăng tin", "Đăng ký nhanh trong chế độ demo.");
  };

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "glass-header border-b border-border/70 py-2.5 shadow-[0_6px_24px_-18px_rgba(20,83,45,0.4)]"
          : "bg-transparent py-4"
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => scrollTo("top")}
          aria-label="Green City — về đầu trang"
          className="rounded-xl px-1 py-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <Logo size={38} />
        </button>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Điều hướng chính">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => scrollTo(link.id)}
              className="group relative rounded-xl px-3.5 py-2 text-[14px] font-semibold text-foreground/75 transition-colors duration-200 hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {link.label}
              <span className="absolute inset-x-3.5 -bottom-0.5 h-[2.5px] origin-left scale-x-0 rounded-full bg-primary transition-transform duration-250 ease-out group-hover:scale-x-100" />
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => goAuth("login")}
            className="hidden items-center gap-2 rounded-2xl border-[1.5px] border-border bg-white/80 px-4 py-2.5 text-[14px] font-semibold text-foreground transition-all duration-200 hover:-translate-y-px hover:border-primary/50 hover:text-primary sm:flex focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <LogIn className="h-4 w-4" />
            Đăng nhập
          </button>
          <motion.button
            type="button"
            onClick={startSelling}
            whileHover={{ y: -1.5 }}
            whileTap={{ scale: 0.97 }}
            className="hidden items-center gap-2 rounded-2xl bg-gradient-to-b from-[#2a9a5d] to-primary px-4 py-2.5 text-[14px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(20,83,45,0.6)] transition-shadow duration-200 hover:shadow-[0_12px_26px_-8px_rgba(20,83,45,0.7)] sm:flex focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Đăng tin
          </motion.button>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={menuOpen}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-white text-foreground transition-colors hover:bg-muted lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-b border-border/70 glass-header lg:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
              {NAV_LINKS.map((link, i) => (
                <motion.button
                  key={link.id}
                  type="button"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.04 }}
                  onClick={() => scrollTo(link.id)}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-left text-[15px] font-semibold text-foreground/85 transition-colors hover:bg-accent hover:text-forest"
                >
                  {link.label}
                  <Leaf className="h-4 w-4 text-primary/50" />
                </motion.button>
              ))}
              <div className="mt-3 flex flex-col gap-2.5 border-t border-border/60 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    goAuth("login");
                  }}
                  className="flex items-center justify-center gap-2 rounded-2xl border-[1.5px] border-border bg-white px-4 py-3.5 text-[15px] font-semibold"
                >
                  <LogIn className="h-4.5 w-4.5" />
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={startSelling}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-[#2a9a5d] to-primary px-4 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-primary/30"
                >
                  <Plus className="h-4.5 w-4.5" strokeWidth={2.5} />
                  Đăng tin miễn phí
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
