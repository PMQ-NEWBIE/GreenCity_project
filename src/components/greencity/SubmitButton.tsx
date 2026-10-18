"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubmitButtonProps {
  status: "idle" | "loading" | "success";
  children: React.ReactNode;
  loadingText?: string;
  successText?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
}

/** Nút hành động chính: hover nâng 1–2px, active thu nhỏ, loading spinner, success check. */
export function SubmitButton({
  status,
  children,
  loadingText = "Đang xử lý...",
  successText = "Thành công!",
  disabled,
  onClick,
  type = "submit",
  className,
}: SubmitButtonProps) {
  const busy = status === "loading";
  const success = status === "success";
  const off = disabled || busy || success;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={off}
      whileHover={off ? undefined : { y: -2, boxShadow: "0 14px 30px -12px rgba(20,83,45,0.45)" }}
      whileTap={off ? undefined : { scale: 0.985, y: 0 }}
      transition={{ type: "spring", stiffness: 480, damping: 26 }}
      className={cn(
        "relative flex h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-2xl text-[15px] font-semibold text-white",
        "bg-gradient-to-b from-[#2a9a5d] to-primary shadow-[0_8px_22px -10px_rgba(20,83,45,0.55)]",
        "focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary",
        busy && "cursor-wait opacity-90",
        success && "cursor-default from-[#2a9a5d] to-primary",
        off && !busy && !success && "cursor-not-allowed opacity-60"
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {busy && (
          <motion.span
            key="loading"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="flex items-center gap-2"
          >
            <Loader2 className="h-5 w-5 animate-spin" />
            {loadingText}
          </motion.span>
        )}
        {!busy && success && (
          <motion.span
            key="success"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/25">
              <Check className="h-4 w-4" strokeWidth={3} />
            </span>
            {successText}
          </motion.span>
        )}
        {!busy && !success && (
          <motion.span
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
