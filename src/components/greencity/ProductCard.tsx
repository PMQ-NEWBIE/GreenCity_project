"use client";

import Link from "next/link";
import { Clock, Heart, MapPin } from "lucide-react";
import type { Product, ProductStatus } from "@/types";
import { useApp } from "@/store/app-store";
import { useLinks } from "@/store/use-links";
import { formatHoursAgo, formatPrice } from "@/utils/format";
import { SmartImage } from "./SmartImage";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<ProductStatus, string> = {
  available: "Còn hàng",
  sold: "Đã bán",
  draft: "Bản nháp",
};

export function ProductCard({ product }: { product: Product }) {
  const { state, toggleFavorite, toast } = useApp();
  const links = useLinks();
  const liked = state.favorites.includes(product.id);
  const sold = product.status === "sold";

  const onFavorite = () => {
    toggleFavorite(product.id);
    toast("success", liked ? "Đã bỏ khỏi Yêu thích" : "Đã lưu vào Yêu thích", product.name);
  };

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-[border-color,box-shadow] duration-200",
        "hover:border-primary/40 hover:shadow-md focus-within:border-primary/40",
        sold && "opacity-80"
      )}
    >
      <div className="relative aspect-[4/3]">
        <SmartImage
          src={product.image}
          alt=""
          className="h-full w-full"
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 300px"
          imgClassName={cn("transition-transform duration-300", !sold && "group-hover:scale-[1.03]", sold && "grayscale-[40%]")}
        />
        <span
          className={cn(
            "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[12px] font-semibold backdrop-blur-xs",
            product.status === "available" && "bg-card/95 text-primary shadow-xs",
            product.status === "sold" && "bg-black/75 text-white",
            product.status === "draft" && "border border-brown-border bg-brown-soft text-brown-text dark:text-beige"
          )}
        >
          {STATUS_LABEL[product.status]}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        <h3 className="line-clamp-2 text-[14px] font-semibold leading-snug text-foreground sm:text-[15px]">
          {/* Link phủ cả thẻ (after:inset-0) — một vùng bấm lớn, vẫn là thẻ <a> thật */}
          <Link
            href={links.product(product.id)}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {product.name}
          </Link>
        </h3>
        <p className="text-[16px] font-bold text-primary sm:text-[17px]">{formatPrice(product.price, product.unit)}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-1 text-[12px] text-muted-foreground sm:text-[13px]">
          <span className="flex min-w-0 items-center gap-1">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{product.area}</span>
          </span>
          {/* Thẻ hẹp (2 cột trên điện thoại): ưu tiên chỗ cho khu vực */}
          <span className="hidden shrink-0 items-center gap-1 sm:flex">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {formatHoursAgo(product.postedHoursAgo)}
          </span>
        </div>
      </div>

      {/* Nút tim nằm trên lớp link (z-10) để bấm riêng được */}
      <button
        type="button"
        onClick={onFavorite}
        aria-label={liked ? `Bỏ yêu thích ${product.name}` : `Lưu ${product.name} vào Yêu thích`}
        aria-pressed={liked}
        className={cn(
          "absolute right-2 top-2 z-10 flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-150",
          liked ? "text-primary-foreground" : "text-foreground/70 hover:text-primary"
        )}
      >
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full border shadow-sm",
            liked ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
          )}
        >
          <Heart className={cn("h-[17px] w-[17px]", liked && "fill-current")} aria-hidden="true" />
        </span>
      </button>
    </article>
  );
}
