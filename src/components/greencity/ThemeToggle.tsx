"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check, Laptop, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  variant?: "button" | "segmented";
}

const THEME_OPTIONS = [
  { value: "light", label: "Sáng", icon: Sun, desc: "Giao diện sáng tiêu chuẩn" },
  { value: "dark", label: "Tối", icon: Moon, desc: "Bảo vệ mắt, dịu nhẹ" },
  { value: "system", label: "Hệ thống", icon: Laptop, desc: "Tự động theo thiết bị" },
] as const;

const emptySubscribe = () => () => {};

export function ThemeToggle({ className, variant = "button" }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const handleThemeChange = (val: string) => {
    if (typeof document !== "undefined" && !reduced) {
      document.documentElement.classList.add("theme-transitioning");
      window.setTimeout(() => {
        document.documentElement.classList.remove("theme-transitioning");
      }, 240);
    }
    setTheme(val);
  };

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!mounted) {
    return (
      <div
        className={cn(
          "h-10 w-10 rounded-xl border border-border bg-card/60 opacity-60",
          className
        )}
        aria-hidden="true"
      />
    );
  }

  // Segmented control variant (e.g. for ProfileView / settings)
  if (variant === "segmented") {
    return (
      <div
        role="radiogroup"
        aria-label="Chọn chế độ giao diện"
        className={cn(
          "grid grid-cols-1 gap-2.5 sm:grid-cols-3",
          className
        )}
      >
        {THEME_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const active = theme === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => handleThemeChange(opt.value)}
              className={cn(
                "group relative flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all duration-200",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                active
                  ? "border-primary bg-primary/8 dark:bg-primary/15 shadow-sm"
                  : "border-border bg-card hover:border-primary/40 hover:bg-muted/50"
              )}
            >
              <div className="flex w-full items-center justify-between">
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                    active
                      ? "bg-primary text-white"
                      : "bg-muted text-foreground/70 group-hover:text-primary"
                  )}
                >
                  <Icon className="h-4.5 w-4.5" />
                </span>
                {active && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                )}
              </div>
              <div>
                <p className="text-[14px] font-bold text-foreground">{opt.label}</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">{opt.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // Button dropdown variant (for topbars, headers)
  const CurrentIcon =
    theme === "system"
      ? Laptop
      : resolvedTheme === "dark"
      ? Moon
      : Sun;

  return (
    <div ref={menuRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Chuyển đổi giao diện (Sáng / Tối / Hệ thống)"
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-all duration-200",
          "hover:border-primary/50 hover:bg-accent/60 hover:text-primary",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          open && "border-primary text-primary shadow-sm"
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={theme === "system" ? "system" : resolvedTheme}
            initial={reduced ? false : { scale: 0.5, rotate: -30, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={reduced ? undefined : { scale: 0.5, rotate: 30, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center"
          >
            <CurrentIcon className="h-[18px] w-[18px]" />
          </m.div>
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <m.div
            role="menu"
            aria-label="Tùy chọn giao diện"
            initial={reduced ? false : { opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-12 z-50 min-w-[160px] overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-xl"
          >
            <p className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Giao diện
            </p>
            {THEME_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = theme === opt.value;
              return (
                <button
                  key={opt.value}
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    handleThemeChange(opt.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl px-2.5 py-2 text-left text-[13px] font-semibold transition-colors duration-150",
                    "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary",
                    isSelected
                      ? "bg-primary text-white"
                      : "text-foreground hover:bg-accent hover:text-primary"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4 shrink-0" />
                    {opt.label}
                  </span>
                  {isSelected && <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />}
                </button>
              );
            })}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
