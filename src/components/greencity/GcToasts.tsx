"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useApp } from "@/store/app-store";
import { cn } from "@/lib/utils";

/** Hệ thống toast: desktop góc trên phải (dưới header), mobile đáy giữa — không che nút quan trọng. */
export function GcToasts() {
  const { state, dismissToast } = useApp();

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[90] flex flex-col items-center gap-2 sm:inset-x-auto sm:bottom-auto sm:top-[84px] sm:right-5 sm:items-end"
    >
      <AnimatePresence>
        {state.toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "pointer-events-auto relative flex w-full max-w-sm items-start gap-3 rounded-2xl border bg-white p-4 pr-10 shadow-lg shadow-forest/10",
              t.kind === "success" && "border-[#bfe6c8]",
              t.kind === "error" && "border-[#f3c1c1]",
              t.kind === "info" && "border-[#cfe0d2]"
            )}
          >
            {t.kind === "success" && (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-leaf" />
            )}
            {t.kind === "error" && (
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            )}
            {t.kind === "info" && (
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-warn" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{t.title}</p>
              {t.description && (
                <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">
                  {t.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              aria-label="Đóng thông báo"
              className="absolute right-2.5 top-2.5 rounded-full p-1.5 text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
