"use client";

import { AnimatePresence, m } from "framer-motion";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useApp } from "@/store/app-store";
import { cn } from "@/lib/utils";

const ICONS = { success: CheckCircle2, error: XCircle, info: Info } as const;

/** Thông báo ngắn: desktop góc trên phải (dưới thanh trên cùng), mobile phía trên thanh điều hướng đáy. */
export function GcToasts() {
  const { state, dismissToast } = useApp();

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[90] flex flex-col items-center gap-2 lg:inset-x-auto lg:bottom-auto lg:right-5 lg:top-20 lg:items-end"
    >
      <AnimatePresence initial={false}>
        {state.toasts.map((t) => {
          const Icon = ICONS[t.kind];
          return (
            <m.div
              key={t.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              role={t.kind === "error" ? "alert" : "status"}
              className={cn(
                "pointer-events-auto relative flex w-full max-w-sm items-start gap-3 rounded-2xl border bg-card p-4 pr-12 text-card-foreground shadow-lg",
                t.kind === "error" ? "border-destructive/40" : "border-border"
              )}
            >
              <Icon
                className={cn("mt-0.5 h-5 w-5 shrink-0", t.kind === "error" ? "text-destructive" : "text-primary")}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-foreground">{t.title}</p>
                {t.description && (
                  <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">{t.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(t.id)}
                aria-label="Đóng thông báo"
                className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </m.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
