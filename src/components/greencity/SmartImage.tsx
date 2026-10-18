"use client";

import { useState } from "react";
import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  objectPosition?: string;
}

/**
 * Ảnh có skeleton fade-in + fallback gradient khi lỗi tải.
 * Khung ảnh cần aspect-ratio từ class bên ngoài để tránh layout shift.
 */
export function SmartImage({
  src,
  alt,
  className,
  imgClassName,
  priority = false,
  objectPosition,
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {!failed && (
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          style={objectPosition ? { objectPosition } : undefined}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0",
            imgClassName
          )}
        />
      )}
      {failed && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#e8f3e9] via-[#d3e8d4] to-[#b9dcc0]">
          <div className="flex flex-col items-center gap-2 text-forest/60">
            <Leaf className="h-8 w-8" strokeWidth={1.5} />
            <span className="px-2 text-center text-[11px] font-medium tracking-wide">
              Hình ảnh minh họa
            </span>
          </div>
        </div>
      )}
      {!loaded && !failed && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted to-[#e4ede4]" />
      )}
    </div>
  );
}
