"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface GcModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md";
}

/** Hộp thoại: Escape / bấm nền để đóng, giữ focus trong hộp thoại và trả focus khi đóng. */
export function GcModal({ open, onClose, title, description, children, size = "md" }: GcModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <m.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/55 dark:bg-black/75 sm:items-center sm:p-6"
          onClick={onClose}
        >
          <m.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-border bg-popover text-popover-foreground shadow-2xl outline-none sm:rounded-3xl",
              size === "sm" ? "sm:max-w-md" : "sm:max-w-xl"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
              <div>
                <h2 id={titleId} className="text-lg font-bold text-foreground">
                  {title}
                </h2>
                {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng"
                className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-hover hover:text-foreground"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
