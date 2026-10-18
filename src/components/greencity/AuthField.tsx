"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  error?: string;
  hint?: ReactNode;
  shake?: boolean;
}

/**
 * Input floating-label với đầy đủ trạng thái:
 * default / hover / focus / filled / error / disabled.
 * Label trượt lên khi focus hoặc đã có giá trị (150–250ms).
 */
export function AuthField({
  label,
  error,
  hint,
  shake,
  type = "text",
  disabled,
  value,
  className,
  ...props
}: AuthFieldProps) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const [reveal, setReveal] = useState(false);
  const isPassword = type === "password";
  const shownType = isPassword && !reveal ? "password" : "text";
  const filled = value !== undefined && String(value).length > 0;
  const floated = focused || filled;

  return (
    <div className={cn("w-full", shake && "animate-nudge", className)}>
      <div
        className={cn(
          "group relative rounded-2xl border-[1.5px] bg-white transition-all duration-200 ease-out",
          "border-[#dce7dc]",
          !disabled && !error && "hover:border-[#a8c9ae]",
          focused && !error && !disabled && "border-primary shadow-[0_0_0_4px_rgba(36,139,82,0.14)]",
          error && "border-destructive shadow-[0_0_0_4px_rgba(220,38,38,0.10)]",
          disabled && "cursor-not-allowed border-border bg-muted/60 opacity-70"
        )}
      >
        <label
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute left-4 z-1 origin-left font-medium transition-all duration-200 ease-out",
            floated
              ? "top-2.5 text-[11px] font-semibold tracking-wide"
              : "top-1/2 -translate-y-1/2 text-[15px]",
            focused && !error && "text-primary",
            !focused && !error && "text-muted-foreground",
            error && "text-destructive",
            disabled && "text-muted-foreground/60"
          )}
        >
          {label}
        </label>
        <input
          id={id}
          type={shownType}
          disabled={disabled}
          value={value}
          aria-invalid={!!error}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            "h-[58px] w-full rounded-2xl bg-transparent px-4 pt-5 pb-1.5 text-[15px] font-medium text-foreground outline-none",
            "placeholder:text-transparent",
            isPassword && "pr-12",
            disabled && "cursor-not-allowed"
          )}
          {...props}
        />
        {isPassword && !disabled && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setReveal((r) => !r)}
            aria-label={reveal ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2.5 text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {reveal ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
          </button>
        )}
      </div>
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            key="err"
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex items-center gap-1.5 overflow-hidden pl-1.5 text-[13px] font-medium text-destructive"
          >
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="pt-1">{error}</span>
          </motion.p>
        )}
        {!error && hint && <div className="pt-1.5 pl-1.5">{hint}</div>}
      </AnimatePresence>
    </div>
  );
}
