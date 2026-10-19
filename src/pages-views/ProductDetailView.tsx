"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BadgeCheck, Clock, Heart, MapPin, MessageCircle, Phone, Star, Tag, Trash2 } from "lucide-react";
import { useApp } from "@/store/app-store";
import { CATEGORIES } from "@/data/mock-data";
import { GcModal } from "@/components/greencity/GcModal";
import { SmartImage } from "@/components/greencity/SmartImage";
import { ProductCard } from "@/components/greencity/ProductCard";
import { EmptyState } from "@/components/greencity/EmptyState";
import { PageContainer, buttonClass } from "@/components/greencity/ui";
import { ROUTES } from "@/lib/routes";
import { formatHoursAgo, formatPrice } from "@/utils/format";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

const SELLER_TYPE_LABEL: Record<Product["seller"]["type"], string> = {
  individual: "Người bán cá nhân",
  collector: "Người thu gom",
  scrapyard: "Vựa phế liệu",
};

export function ProductDetailView({ productId }: { productId: string }) {
  const { state, toggleFavorite, removeProduct, toast } = useApp();
  const router = useRouter();
  const [contactOpen, setContactOpen] = useState(false);
  const product = state.products.find((p) => p.id === productId);

  if (!product) {
    return (
      <PageContainer>
        <EmptyState
          title="Không tìm thấy tin đăng"
          description="Tin có thể đã bị xóa, hoặc đường dẫn bị sai."
          action={
            <Link href={ROUTES.discover} className={buttonClass.primary}>
              Xem các tin khác
            </Link>
          }
        />
      </PageContainer>
    );
  }

  const category = CATEGORIES.find((c) => c.id === product.categoryId);
  const liked = state.favorites.includes(product.id);
  const sold = product.status === "sold";
  const related = state.products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id && p.status === "available")
    .slice(0, 4);

  const onFavorite = () => {
    toggleFavorite(product.id);
    toast("success", liked ? "Đã bỏ khỏi Yêu thích" : "Đã lưu vào Yêu thích", product.name);
  };

  const onDelete = () => {
    removeProduct(product.id);
    toast("success", "Đã xóa tin", product.name);
    router.replace(ROUTES.profile);
  };

  return (
    <PageContainer>
      <Link href={ROUTES.discover} className={cn(buttonClass.ghost, "-ml-3 text-muted-foreground hover:text-foreground")}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Danh sách tin
      </Link>

      <div className="mt-3 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        <SmartImage
          src={product.image}
          alt={product.name}
          eager
          sizes="(max-width: 1024px) 100vw, 600px"
          className="aspect-[4/3] w-full rounded-3xl border border-border"
          imgClassName={sold ? "grayscale-[40%]" : undefined}
        />

        <div className="flex flex-col">
          {product.status !== "available" && (
            <p
              className={cn(
                "mb-4 rounded-xl px-4 py-3 text-[14px] font-semibold",
                sold ? "bg-muted text-muted-foreground" : "bg-earth/10 text-earth"
              )}
            >
              {sold ? "Món này đã được bán — bạn có thể tham khảo giá." : "Bản nháp — tin chưa hiện trên sàn, chỉ bạn nhìn thấy."}
            </p>
          )}

          <h2 className="text-balance text-[26px] font-extrabold leading-tight tracking-tight text-foreground">
            {product.name}
          </h2>
          <p className="mt-3 text-[30px] font-extrabold leading-none text-primary">
            {formatPrice(product.price)}
            <span className="text-[16px] font-bold text-muted-foreground"> / {product.unit}</span>
          </p>

          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-muted-foreground">
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
              {product.area}
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
              Đăng {formatHoursAgo(product.postedHoursAgo).toLowerCase()}
            </li>
            {category && (
              <li>
                <Link href={`${ROUTES.discover}?danh-muc=${category.id}`} className="flex items-center gap-2 hover:text-primary">
                  <Tag className="h-4 w-4 text-primary" aria-hidden="true" />
                  {category.name}
                </Link>
              </li>
            )}
          </ul>

          {/* Hành động chính */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {product.isMine ? (
              <>
                <p className="flex min-h-12 flex-1 items-center rounded-xl bg-accent px-4 text-[14px] font-semibold text-accent-foreground">
                  Đây là tin của bạn
                </p>
                <button type="button" onClick={onDelete} className={cn(buttonClass.secondary, "hover:border-destructive/50 hover:text-destructive")}>
                  <Trash2 className="h-[18px] w-[18px]" aria-hidden="true" />
                  Xóa tin
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setContactOpen(true)}
                  disabled={sold}
                  className={cn(buttonClass.primary, "flex-1")}
                >
                  <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" />
                  {sold ? "Món đã bán" : "Liên hệ người bán"}
                </button>
                <button type="button" onClick={onFavorite} aria-pressed={liked} className={cn(buttonClass.secondary, liked && "border-primary/50 text-primary")}>
                  <Heart className={cn("h-[18px] w-[18px]", liked && "fill-current")} aria-hidden="true" />
                  {liked ? "Đã lưu" : "Lưu lại"}
                </button>
              </>
            )}
          </div>

          <section className="mt-6 rounded-2xl border border-border bg-card p-5">
            <h3 className="text-[15px] font-bold text-foreground">Mô tả</h3>
            <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-foreground/85">{product.description}</p>
          </section>

          {!product.isMine && (
            <section className="mt-4 flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-[16px] font-bold text-primary-foreground">
                {product.seller.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-[15px] font-bold text-foreground">
                  <span className="truncate">{product.seller.name}</span>
                  <BadgeCheck className="h-4 w-4 shrink-0 text-primary" aria-label="Đã xác minh" />
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[13px] text-muted-foreground">
                  <span>{SELLER_TYPE_LABEL[product.seller.type]}</span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-warn text-warn" aria-hidden="true" />
                    {product.seller.rating.toFixed(1)}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{product.seller.deals} lần giao dịch</span>
                </p>
              </div>
            </section>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related" className="mt-12">
          <h3 id="related" className="text-[19px] font-bold text-foreground">
            Cùng loại {category ? category.shortName.toLowerCase() : ""}
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <GcModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        title={`Liên hệ ${product.seller.name}`}
        description="Gọi hoặc nhắn tin để hẹn giờ xem hàng và cân đo."
        size="sm"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-2xl border border-border p-4">
            <span className="flex items-center gap-3 text-[14px] font-semibold text-foreground/80">
              <Phone className="h-[18px] w-[18px] text-primary" aria-hidden="true" />
              Số điện thoại
            </span>
            <span className="font-mono text-[15px] font-bold text-foreground">090x xxx xxx</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-border p-4">
            <span className="flex items-center gap-3 text-[14px] font-semibold text-foreground/80">
              <MapPin className="h-[18px] w-[18px] text-primary" aria-hidden="true" />
              Khu vực
            </span>
            <span className="text-[15px] font-bold text-foreground">{product.area}</span>
          </div>
          <p className="text-center text-[13px] text-muted-foreground">
            Bản demo nên số điện thoại được che. Khi giao dịch thật, nhớ cân lại trước khi trả tiền.
          </p>
        </div>
      </GcModal>
    </PageContainer>
  );
}
