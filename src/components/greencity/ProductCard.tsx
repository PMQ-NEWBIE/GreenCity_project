"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Clock, Heart, MapPin } from "lucide-react";
import type { Product } from "@/types";
import { useApp } from "@/store/app-store";
import { formatHoursAgo, formatPrice } from "@/utils/format";
import { SmartImage } from "./SmartImage";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { state, goApp, goAuth, setPending, toggleFavorite, toast } = useApp();
  const reduced = useReducedMotion();
  const liked = state.favorites.includes(product.id);
  const sold = product.status === "sold";

  const openProduct = () => {
    if (sold) return;
    if (state.user) {
      goApp("product", product.id);
    } else {
      setPending({ screen: "app", page: "product", productId: product.id });
      goAuth("login");
      toast("info", "Đăng nhập để xem chi tiết", "Chỉ cần vài giây trong chế độ demo.");
    }
  };

  const onFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(product.id);
    if (!liked) {
      toast("success", "Đã thêm vào yêu thích", product.name);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: reduced ? 0 : 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.36), ease: [0.22, 1, 0.36, 1] }}
      whileHover={sold ? undefined : { y: -4 }}
      onClick={openProduct}
      className={cn(
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow duration-300",
        sold ? "cursor-default" : "hover:elevate-card-hover elevate-card"
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <SmartImage
          src={product.image}
          alt={product.name}
          className="h-full w-full"
          imgClassName={cn(
            "transition-transform duration-500 ease-out",
            !sold && "group-hover:scale-[1.045]",
            sold && "grayscale-[45%] opacity-80"
          )}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span
          className={cn(
            "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide backdrop-blur-sm",
            sold ? "bg-forest/70 text-white" : "bg-white/90 text-forest"
          )}
        >
          {sold ? "Đã bán" : "Còn hàng"}
        </span>
        {product.isMine && (
          <span className="absolute bottom-3 left-3 rounded-full bg-earth/90 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white">
            Tin của bạn
          </span>
        )}
        <motion.button
          type="button"
          aria-label={liked ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
          aria-pressed={liked}
          whileTap={{ scale: 0.82 }}
          onClick={onFavorite}
          className={cn(
            "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition-all duration-200",
            liked
              ? "bg-primary text-white shadow-primary/40"
              : "bg-white/92 text-muted-foreground hover:bg-white hover:text-primary"
          )}
        >
          <motion.span
            key={liked ? "liked" : "unliked"}
            initial={reduced ? false : { scale: 0.4 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 17 }}
          >
            <Heart className={cn("h-[17px] w-[17px]", liked && "fill-current")} />
          </motion.span>
        </motion.button>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="line-clamp-2 min-h-[44px] text-[15px] font-semibold leading-snug text-foreground transition-colors duration-200 group-hover:text-primary">
          {product.name}
        </h3>
        <p className="text-[17px] font-extrabold text-primary">
          {formatPrice(product.price, product.unit)}
        </p>
        <div className="mt-1 flex items-center justify-between gap-2 text-[12.5px] text-muted-foreground">
          <span className="flex min-w-0 items-center gap-1">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{product.area}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatHoursAgo(product.postedHoursAgo)}
          </span>
        </div>
      </div>
    </motion.article>
  );
}
