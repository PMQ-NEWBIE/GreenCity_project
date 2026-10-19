"use client";

import { useId, useState, type InputHTMLAttributes } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  error?: string;
  hint?: string;
}

/** Ô nhập có nhãn cố định phía trên, lỗi gắn với ô qua aria-describedby. */
export function AuthField({ label, error, hint, type = "text", className, ...props }: AuthFieldProps) {
  const id = useId();
  const msgId = `${id}-msg`;
  const [reveal, setReveal] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={cn("w-full", className)}>
      <label htmlFor={id} className="mb-1.5 block text-[14px] font-semibold text-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isPassword && reveal ? "text" : type}
          aria-invalid={!!error}
          aria-describedby={error || hint ? msgId : undefined}
          className={cn(
            "h-12 w-full rounded-xl border bg-card px-4 text-[15px] text-foreground outline-none transition-[border-color,box-shadow] duration-150",
            "placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/15",
            error ? "border-destructive" : "border-input",
            isPassword && "pr-12"
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((r) => !r)}
            aria-label={reveal ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            className="absolute right-0.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
          >
            {reveal ? <EyeOff className="h-[18px] w-[18px]" aria-hidden="true" /> : <Eye className="h-[18px] w-[18px]" aria-hidden="true" />}
          </button>
        )}
      </div>
      {error ? (
        <p id={msgId} className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={msgId} className="mt-1.5 text-[13px] text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
