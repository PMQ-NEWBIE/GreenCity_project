import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  withText?: boolean;
  variant?: "color" | "white";
  className?: string;
  subtitle?: boolean;
}

/** Biểu tượng Green City — vòng tái chế, Chợ Bến Thành trên bàn tay lá (ảnh đã tách nền). */
export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <img
      src="/logo-mark.webp"
      width={size}
      height={size}
      alt="Green City logo"
      draggable={false}
      className={cn("shrink-0 select-none object-contain", className)}
    />
  );
}

/** Chiếc lá thay dấu chấm trên chữ "I" — giống wordmark trong logo. */
function LeafDot({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M4 21C4 11 10 4.5 21 3c-.6 11.2-7.3 17.6-17 18z" fill="currentColor" />
      <path d="M4.5 20.5C9 15 12.5 11 17 7.5" stroke="white" strokeOpacity={0.55} strokeWidth={1.6} strokeLinecap="round" fill="none" />
    </svg>
  );
}

/**
 * Chữ "GREEN CITY" theo style logo: in hoa, nét hình học đậm,
 * GREEN xanh rừng — CITY xanh mạ, có lá trên chữ I.
 */
export function Wordmark({
  fontSize,
  variant = "color",
  className,
}: {
  fontSize: number;
  variant?: "color" | "white";
  className?: string;
}) {
  return (
    <span
      className={cn("whitespace-nowrap font-brand font-extrabold leading-none tracking-[-0.01em]", className)}
      style={{ fontSize }}
    >
      <span className={variant === "white" ? "text-white" : "text-brand-green"}>GREEN</span>{" "}
      <span className={variant === "white" ? "text-[#a3d65c]" : "text-brand-lime"}>
        C
        <span className="relative inline-block">
          I
          <LeafDot className="absolute -top-[0.36em] left-[0.02em] h-[0.42em] w-[0.42em]" />
        </span>
        TY
      </span>
    </span>
  );
}

export function Logo({
  size = 40,
  withText = true,
  variant = "color",
  className,
  subtitle = false,
}: LogoProps) {
  const subColor = variant === "white" ? "text-white/70" : "text-muted-foreground";

  return (
    <span className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      {variant === "white" ? (
        // Nền tròn trắng giúp biểu tượng xanh nổi rõ trên nền gradient tối
        <span
          className="flex shrink-0 items-center justify-center rounded-full bg-white shadow-md"
          style={{ width: size, height: size }}
        >
          <LogoMark size={Math.round(size * 0.84)} />
        </span>
      ) : (
        <LogoMark size={size} />
      )}
      {withText && (
        <span className="flex flex-col leading-none">
          <Wordmark fontSize={size * 0.4} variant={variant} className="pt-[0.2em]" />
          {subtitle && (
            <span className={cn("mt-1.5 font-medium tracking-wide", subColor)} style={{ fontSize: size * 0.26 }}>
              Turn Waste Into Value
            </span>
          )}
        </span>
      )}
    </span>
  );
}
