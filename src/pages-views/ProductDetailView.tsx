"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  Clock,
  Heart,
  MapPin,
  MessageCircle,
  Package2,
  Phone,
  Star,
  Tag,
} from "lucide-react";
import { useApp } from "@/store/app-store";
import { CATEGORIES } from "@/data/mock-data";
import { GcModal } from "@/components/greencity/GcModal";
import { SmartImage } from "@/components/greencity/SmartImage";
import { ProductCard } from "@/components/greencity/ProductCard";
import { EmptyState } from "@/components/greencity/EmptyState";
import { formatHoursAgo, formatPrice } from "@/utils/format";
import { cn } from "@/lib/utils";

const SELLER_TYPE_LABEL: Record<string, string> = {
  individual: "Người bán cá nhân",
  collector: "Người thu gom",
  scrapyard: "Vựa phế liệu",
};

export function ProductDetailView({ productId }: { productId?: string }) {
  const { state, goApp, toggleFavorite, toast } = useApp();
  const product = state.products.find((p) => p.id === productId);

  if (!product) {
    return (
      <div className="nice-scroll h-full overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <EmptyState
            title="Không tìm thấy sản phẩm"
            description="Tin đăng có thể đã bị xóa hoặc liên kết không đúng trong phiên demo này."
            action={
              <button
                type="button"
                onClick={() => goApp("discover")}
                className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-[14px] font-semibold text-white shadow-lg shadow-primary/25"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại danh sách
              </button>
            }
          />
        </div>
      </div>
    );
  }

  const category = CATEGORIES.find((c) => c.id === product.categoryId);
  const liked = state.favorites.includes(product.id);
  const sold = product.status === "sold";
  const related = state.products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  return <ProductDetailInner key={product.id} product={product} category={category ?? null} liked={liked} sold={sold} related={related} />;
}

function ProductDetailInner({
  product,
  category,
  liked,
  sold,
  related,
}: {
  product: import("@/types").Product;
  category: import("@/types").Category | null;
  liked: boolean;
  sold: boolean;
  related: import("@/types").Product[];
}) {
  const { goApp, toggleFavorite, toast, state } = useApp();
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <div className="nice-scroll h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <button
          type="button"
          onClick={() => goApp("discover")}
          className="group flex items-center gap-2 rounded-xl px-2 py-1.5 text-[14px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-forest"
        >
          <ArrowLeft className="h-4.5 w-4.5 transition-transform duration-200 group-hover:-translate-x-1" />
          Quay lại danh sách
        </button>

        <div className="mt-5 grid gap-8 lg:grid-cols-[1.05fr_1fr]">
          {/* Ảnh */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative overflow-hidden rounded-[28px] border border-border/60 bg-white p-2 shadow-sm">
              <div className="relative overflow-hidden rounded-[22px]">
                <SmartImage
                  src={product.image}
                  alt={product.name}
                  className="aspect-[4/3] w-full"
                  priority
                />
                <span
                  className={cn(
                    "absolute left-4 top-4 rounded-full px-3 py-1.5 text-[12px] font-bold backdrop-blur-sm",
                    sold ? "bg-forest/75 text-white" : "bg-white/90 text-forest"
                  )}
                >
                  {sold ? "Đã bán" : "Còn hàng"}
                </span>
              </div>
            </div>
            {category && (
              <button
                type="button"
                onClick={() => goApp("discover")}
                className="group mt-4 flex w-full items-center gap-3.5 rounded-2xl border border-border/70 bg-white p-3.5 text-left transition-all duration-200 hover:border-primary/40 hover:shadow-md"
              >
                <SmartImage
                  src={category.image}
                  alt={category.name}
                  className="h-14 w-14 shrink-0 rounded-xl"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Danh mục
                  </p>
                  <p className="truncate text-[15px] font-bold text-forest">{category.name}</p>
                </div>
                <span className="shrink-0 rounded-full bg-accent px-3 py-1.5 text-[12px] font-bold text-primary">
                  {category.priceHint}
                </span>
              </button>
            )}
          </motion.div>

          {/* Thông tin */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col"
          >
            <h2 className="text-balance text-[26px] font-extrabold leading-tight tracking-tight text-forest">
              {product.name}
            </h2>

            <div className="mt-4 flex items-baseline gap-2">
              <p className="text-[32px] font-extrabold leading-none text-primary">
                {formatPrice(product.price)}
              </p>
              <span className="text-[15px] font-bold text-muted-foreground">/ {product.unit}</span>
            </div>
            {sold && (
              <p className="mt-2 rounded-xl bg-muted px-3.5 py-2 text-[13px] font-semibold text-muted-foreground">
                Tin đăng đã được giao dịch trong phiên demo — tham khảo giá để so sánh.
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-[13.5px] text-muted-foreground">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary/70" />
                {product.area}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary/70" />
                Đăng {formatHoursAgo(product.postedHoursAgo).toLowerCase()}
              </span>
              <span className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary/70" />
                {category?.shortName ?? "Khác"}
              </span>
            </div>

            <div className="mt-6 rounded-2xl border border-border/70 bg-white p-5">
              <h3 className="text-[14px] font-bold text-forest">Mô tả chi tiết</h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-foreground/80">
                {product.description}
              </p>
              <p className="mt-3 text-[12px] text-muted-foreground/70">
                * Mô tả do người bán demo nhập — hãy cân đo lại khi giao dịch thật.
              </p>
            </div>

            {/* Người đăng */}
            <div className="mt-5 flex items-center gap-4 rounded-2xl border border-border/70 bg-white p-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-[#2a9a5d] to-primary text-[16px] font-bold text-white">
                {product.seller.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-[15px] font-bold text-forest">
                  <span className="truncate">{product.seller.name}</span>
                  <BadgeCheck className="h-4.5 w-4.5 shrink-0 text-primary" />
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[12.5px] text-muted-foreground">
                  <span>{SELLER_TYPE_LABEL[product.seller.type]}</span>
                  <span className="text-border">•</span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-warn text-warn" />
                    {product.seller.rating.toFixed(1)}
                  </span>
                  <span className="text-border">•</span>
                  <span>{product.seller.deals} giao dịch demo</span>
                </p>
              </div>
              <p className="hidden shrink-0 text-[11.5px] text-muted-foreground/60 sm:block">
                Tham gia {product.seller.joined}
              </p>
            </div>

            {/* Nút hành động */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setContactOpen(true)}
                disabled={sold}
                className={cn(
                  "flex h-[52px] flex-1 items-center justify-center gap-2.5 rounded-2xl text-[15px] font-semibold text-white shadow-[0_14px_30px_-12px_rgba(20,83,45,0.5)]",
                  sold
                    ? "cursor-not-allowed bg-muted text-muted-foreground shadow-none"
                    : "bg-gradient-to-b from-[#2a9a5d] to-primary"
                )}
              >
                <MessageCircle className="h-[18px] w-[18px]" strokeWidth={2.2} />
                {sold ? "Tin đã đóng" : "Liên hệ người bán"}
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  toggleFavorite(product.id);
                  if (!liked) {
                    toast("success", "Đã thêm vào yêu thích", product.name);
                  }
                }}
                aria-pressed={liked}
                className={cn(
                  "flex h-[52px] items-center justify-center gap-2.5 rounded-2xl border-[1.5px] px-6 text-[15px] font-semibold transition-colors duration-200",
                  liked
                    ? "border-primary/50 bg-accent/70 text-primary"
                    : "border-border bg-white text-foreground/75 hover:border-primary/40 hover:text-primary"
                )}
              >
                <Heart className={cn("h-[18px] w-[18px]", liked && "fill-current")} />
                {liked ? "Đã yêu thích" : "Yêu thích"}
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Sản phẩm liên quan */}
        {related.length > 0 && (
          <section className="mt-12">
            <h3 className="text-[18px] font-bold tracking-tight text-forest">
              Sản phẩm cùng danh mục
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-4 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Modal liên hệ demo */}
      <GcModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        title={`Liên hệ ${product.seller.name}`}
        description="Thông tin liên hệ giả lập cho mục đích trình diễn."
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 rounded-2xl border border-border/70 bg-[#f7faf6] p-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-b from-[#2a9a5d] to-primary text-[16px] font-bold text-white">
              {product.seller.initials}
            </span>
            <div>
              <p className="text-[15px] font-bold text-forest">{product.seller.name}</p>
              <p className="text-[12.5px] text-muted-foreground">
                {SELLER_TYPE_LABEL[product.seller.type]} • {product.area}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-white p-4">
              <span className="flex items-center gap-3 text-[14px] font-semibold text-foreground/80">
                <Phone className="h-4.5 w-4.5 text-primary" />
                Số điện thoại (demo)
              </span>
              <span className="font-mono text-[14px] font-bold text-forest">090x xxx xxx</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-white p-4">
              <span className="flex items-center gap-3 text-[14px] font-semibold text-foreground/80">
                <Package2 className="h-4.5 w-4.5 text-primary" />
                Phản hồi trung bình
              </span>
              <span className="text-[14px] font-bold text-forest">dưới 2 giờ (demo)</span>
            </div>
          </div>
          <p className="text-center text-[12px] leading-relaxed text-muted-foreground/70">
            Đây là modal minh họa — không có cuộc gọi hay tin nhắn thật được thực hiện trong bản demo
            này.
          </p>
        </div>
      </GcModal>
    </div>
  );
}
