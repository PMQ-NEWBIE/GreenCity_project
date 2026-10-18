import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  withText?: boolean;
  variant?: "color" | "white";
  className?: string;
  subtitle?: boolean;
}

/** Logo Green City — vòng tuần hoàn tái chế + mầm lá giữa tâm. */
export function LogoMark({ size = 40, id }: { size?: number; id?: string }) {
  const gid = id ?? "gc-grad";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label="Green City logo"
    >
      <defs>
        <linearGradient id={gid} x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2FA763" />
          <stop offset="1" stopColor="#14532D" />
        </linearGradient>
      </defs>
      {/* Vòng tuần hoàn */}
      <path
        d="M24 5.5A18.5 18.5 0 0 1 42.5 24"
        stroke={`url(#${gid})`}
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path
        d="M42.5 24A18.5 18.5 0 0 1 24 42.5"
        stroke={`url(#${gid})`}
        strokeWidth="3.4"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M24 42.5A18.5 18.5 0 0 1 7.4 33.2"
        stroke={`url(#${gid})`}
        strokeWidth="3.4"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M7.4 33.2A18.5 18.5 0 0 1 5.5 22"
        stroke={`url(#${gid})`}
        strokeWidth="3.4"
        strokeLinecap="round"
        opacity="0.35"
      />
      {/* Mũi tên vòng tuần hoàn */}
      <path
        d="M42.5 14.5v9.8h-9.8"
        stroke={`url(#${gid})`}
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Mầm lá giữa tâm */}
      <path
        d="M24 12.5c-8.4 2.7-13.2 8.3-13.2 15.5 0 6.9 4.5 11.7 10.8 11.7-2.5-2.1-3.9-4.8-3.9-8 0-2.5.8-4.6 2.3-6.2-.3 4.2 2.1 6.9 5.9 6.9 4.9 0 8-3.5 8-9 0-4.8-4.1-9.1-9.9-10.9z"
        fill={`url(#${gid})`}
      />
      {/* Điểm nâu đất */}
      <circle cx="39.6" cy="39" r="2.6" fill="#8B6848" />
      <circle cx="9.2" cy="10.4" r="1.8" fill="#A7E8B2" />
    </svg>
  );
}

export function Logo({
  size = 40,
  withText = true,
  variant = "color",
  className,
  subtitle = false,
}: LogoProps) {
  const textColor = variant === "white" ? "text-white" : "text-forest";
  const subColor = variant === "white" ? "text-mint/80" : "text-muted-foreground";

  return (
    <span className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <LogoMark size={size} />
      {withText && (
        <span className="flex flex-col leading-none">
          <span className={cn("font-extrabold tracking-tight", textColor)} style={{ fontSize: size * 0.46 }}>
            Green<span className="text-leaf">City</span>
          </span>
          {subtitle && (
            <span className={cn("mt-1 font-medium tracking-wide", subColor)} style={{ fontSize: size * 0.26 }}>
              Turn Waste Into Value
            </span>
          )}
        </span>
      )}
    </span>
  );
}
