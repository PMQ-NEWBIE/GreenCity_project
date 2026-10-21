import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/* Kiểu nút dùng chung — vùng bấm tối thiểu 48px */
export const buttonClass = {
  primary:
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-[15px] font-semibold text-primary-foreground shadow-xs transition-all duration-150 hover:bg-primary-hover active:bg-primary-active active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-disabled disabled:text-disabled-foreground",
  secondary:
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 text-[15px] font-semibold text-foreground transition-all duration-150 hover:border-primary/50 hover:text-primary hover:bg-accent/40 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:border-border/60 disabled:text-disabled-foreground",
  ghost:
    "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-3 text-[14px] font-semibold text-primary transition-colors duration-150 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60 disabled:text-disabled-foreground",
} as const;

export function inputClass(error?: string) {
  return cn(
    "h-12 w-full rounded-xl border bg-card px-4 text-[15px] text-foreground outline-none transition-[border-color,box-shadow] duration-150",
    "placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-disabled/40 disabled:text-disabled-foreground",
    error ? "border-destructive focus:border-destructive focus:ring-destructive/15" : "border-input"
  );
}

export function PageContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8", className)}>{children}</div>;
}

export function PageIntro({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="max-w-2xl">
      <h2 className="text-[24px] font-extrabold tracking-tight text-foreground sm:text-[28px]">{title}</h2>
      {children && <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{children}</p>}
    </div>
  );
}

/** Tiêu đề một bước trong form: số thứ tự + câu hỏi rõ ràng + gợi ý ngắn. */
export function StepHeading({ step, title, hint, id }: { step: number; title: string; hint?: string; id?: string }) {
  return (
    <div className="flex items-start gap-3">
      <span
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[14px] font-bold text-primary-foreground shadow-xs"
      >
        {step}
      </span>
      <div>
        <h3 id={id} className="text-[17px] font-bold leading-8 text-foreground">
          <span className="sr-only">Bước {step}: </span>
          {title}
        </h3>
        {hint && <p className="text-[14px] text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}

export function FieldError({ id, msg }: { id?: string; msg?: string }) {
  if (!msg) return null;
  return (
    <p id={id} className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-destructive">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {msg}
    </p>
  );
}

/** Nút chọn dạng chip (chọn một hoặc nhiều). */
export function ChoiceChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-xl border px-4 text-[14px] font-semibold transition-all duration-150",
        selected
          ? "border-primary bg-primary text-primary-foreground shadow-xs"
          : "border-border bg-card text-foreground/80 hover:border-primary/50 hover:text-primary hover:bg-accent/30"
      )}
    >
      {children}
    </button>
  );
}
