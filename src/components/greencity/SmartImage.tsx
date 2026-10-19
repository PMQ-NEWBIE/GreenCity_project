"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface SmartImageProps {
  src: string;
  alt: string;
  /** Khung chứa — cần có kích thước/aspect-ratio từ bên ngoài để không bị nhảy layout. */
  className?: string;
  imgClassName?: string;
  /** Gợi ý chiều rộng hiển thị để trình duyệt chọn đúng ảnh trong srcset. */
  sizes?: string;
  /** Ảnh nằm ngay màn hình đầu (LCP) → tải sớm, không lazy. */
  eager?: boolean;
}

/** Ảnh có nền chờ + ảnh thay thế khi lỗi tải. Dùng next/image để có srcset và lazy-load. */
export function SmartImage({
  src,
  alt,
  className,
  imgClassName,
  sizes = "(max-width: 640px) 100vw, 400px",
  eager = false,
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {failed ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
          <ImageOff className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
          <span className="text-[11px] font-medium">Không tải được ảnh</span>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          quality={70}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : undefined}
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            "object-cover transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0",
            imgClassName
          )}
        />
      )}
    </div>
  );
}
