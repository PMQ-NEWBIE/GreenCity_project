"use client";

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

/** Nút hành động chính với 3 trạng thái: bình thường / đang xử lý / xong. */
export function SubmitButton({
  status,
  children,
  loadingText = "Đang xử lý...",
  successText = "Xong!",
  disabled,
  onClick,
  type = "submit",
  className,
}: SubmitButtonProps) {
  const busy = status === "loading";
  const success = status === "success";
  const off = disabled || busy || success;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={off}
      aria-busy={busy}
      className={cn(
        "flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-[15px] font-semibold text-primary-foreground shadow-sm",
        "transition-all duration-150 hover:bg-primary-hover active:bg-primary-active active:scale-[0.99]",
        busy && "cursor-wait",
        disabled && !busy && !success && "cursor-not-allowed opacity-60",
        className
      )}
    >
      {busy ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          {loadingText}
        </>
      ) : success ? (
        <>
          <Check className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
          {successText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
