"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Phone,
  Map,
  Award,
  Sprout,
  Wrench,
  Leaf,
  Gift,
} from "lucide-react";
import {
  ROUTES,
  GREEN_SHOP_KIND_LABEL,
  type GreenShopKind,
  type GreenShopProduct,
} from "@/features/contracts";
import { GREEN_SHOPS } from "@/data/green-shops";
import { SmartImage } from "@/components/greencity/SmartImage";
import { GcModal } from "@/components/greencity/GcModal";
import { EmptyState } from "@/components/greencity/EmptyState";
import { PageContainer, buttonClass } from "@/components/greencity/ui";
import { formatPrice } from "@/utils/format";
import { cn } from "@/lib/utils";

function kindIcon(kind: GreenShopKind) {
  switch (kind) {
    case "phan-bon":
      return <Sprout className="h-6 w-6 text-primary" aria-hidden="true" />;
    case "lam-vuon":
      return <Wrench className="h-6 w-6 text-primary" aria-hidden="true" />;
    case "san-pham-xanh":
      return <Leaf className="h-6 w-6 text-primary" aria-hidden="true" />;
  }
}

export function ShopDetailView({ slug }: { slug: string }) {
  const shop = GREEN_SHOPS.find((s) => s.slug === slug);
  const [contactOpen, setContactOpen] = useState(false);

  if (!shop) {
    return (
      <PageContainer>
        <EmptyState
          title="Không tìm thấy gian hàng"
          description="Gian hàng bạn đang tìm không tồn tại hoặc đã thay đổi thông tin liên kết."
          action={
            <Link href={ROUTES.shops} className={buttonClass.primary}>
              Về danh sách gian hàng
            </Link>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-4xl">
      {/* Nút quay lại */}
      <div className="mb-4">
        <Link
          href={ROUTES.shops}
          className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Tất cả gian hàng
        </Link>
      </div>

      {/* Ảnh bìa gian hàng */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border shadow-sm">
        <SmartImage
          src={shop.cover}
          alt={shop.name}
          className="h-full w-full"
          eager
          sizes="(max-width: 1024px) 100vw, 896px"
        />
        {shop.isPartnerReward && (
          <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[13px] font-bold text-primary-foreground shadow-md">
            <Award className="h-4 w-4" aria-hidden="true" />
            Đối tác nhận đổi điểm
          </span>
        )}
      </div>

      {/* Đầu trang: Đúng duy nhất 1 thẻ h2 */}
      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-[13px] font-semibold text-primary">
            {GREEN_SHOP_KIND_LABEL[shop.kind]}
          </span>
          <span className="rounded-full bg-muted px-3 py-1 text-[13px] font-medium text-muted-foreground">
            {shop.area}
          </span>
        </div>
        <h2 className="mt-2 text-[24px] font-extrabold tracking-tight text-foreground sm:text-[32px]">
          {shop.name}
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground sm:text-[16px]">
          {shop.description}
        </p>
      </header>

      {/* Khối thông tin liên hệ và vị trí */}
      <section aria-labelledby="shop-info-heading" className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
        <h3 id="shop-info-heading" className="text-[17px] font-bold text-foreground">
          Thông tin liên hệ & địa chỉ
        </h3>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="text-[12px] font-semibold uppercase text-muted-foreground">Địa chỉ</p>
              <p className="mt-0.5 text-[14px] font-medium text-foreground">
                {shop.address}, {shop.area}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="text-[12px] font-semibold uppercase text-muted-foreground">Giờ mở cửa</p>
              <p className="mt-0.5 text-[14px] font-medium text-foreground">{shop.openHours}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="text-[12px] font-semibold uppercase text-muted-foreground">Điện thoại</p>
              <p className="mt-0.5 font-mono text-[14px] font-bold text-foreground">
                {shop.phoneMasked}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-4">
          <button
            type="button"
            onClick={() => setContactOpen(true)}
            className={buttonClass.primary}
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            Liên hệ gian hàng
          </button>
          <Link
            href={`${ROUTES.map}?gian-hang=${shop.slug}`}
            className={buttonClass.secondary}
          >
            <Map className="h-4 w-4" aria-hidden="true" />
            Xem trên bản đồ
          </Link>
        </div>
      </section>

      {/* Hộp quà tặng nếu gian hàng là đối tác nhận đổi điểm */}
      {shop.isPartnerReward && (
        <section className="mt-8 flex flex-col gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Gift className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-foreground">
                Gian hàng này nhận đổi điểm Green City
              </h3>
              <p className="mt-0.5 text-[14px] text-muted-foreground">
                Bạn có thể dùng điểm thưởng để đổi lấy các phần quà của gian hàng này tại trang Đổi quà.
              </p>
            </div>
          </div>
          <Link href={ROUTES.rewards} className={cn(buttonClass.primary, "shrink-0 min-h-11 px-4 text-[14px]")}>
            Đổi quà ngay
          </Link>
        </section>
      )}

      {/* Lưới sản phẩm của gian hàng */}
      <section aria-labelledby="products-heading" className="mt-10 mb-8">
        <h3 id="products-heading" className="text-[19px] font-bold text-foreground">
          Sản phẩm tiêu biểu ({shop.products.length})
        </h3>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {shop.products.map((product: GreenShopProduct) => (
            <div
              key={product.id}
              className="flex gap-4 rounded-2xl border border-border bg-card p-4 transition-[border-color,box-shadow] duration-150 hover:border-primary/40 hover:shadow-sm"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-accent">
                {product.image ? (
                  <SmartImage
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full"
                    sizes="80px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-primary">
                    {kindIcon(shop.kind)}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-[15px] font-bold leading-snug text-foreground">
                  {product.name}
                </h4>
                <p className="mt-1 text-[15px] font-bold text-primary">
                  {formatPrice(product.price, product.unit)}
                </p>
                <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal liên hệ gian hàng */}
      <GcModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        title={`Liên hệ ${shop.name}`}
        description="Gọi điện hoặc ghé trực tiếp gian hàng trong giờ hoạt động."
        size="sm"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-2xl border border-border p-4">
            <span className="flex items-center gap-3 text-[14px] font-semibold text-foreground/80">
              <Phone className="h-[18px] w-[18px] text-primary" aria-hidden="true" />
              Số điện thoại
            </span>
            <span className="font-mono text-[15px] font-bold text-foreground">
              {shop.phoneMasked}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-border p-4">
            <span className="flex items-center gap-3 text-[14px] font-semibold text-foreground/80">
              <MapPin className="h-[18px] w-[18px] text-primary" aria-hidden="true" />
              Địa chỉ
            </span>
            <span className="text-[14px] font-bold text-foreground">
              {shop.address}, {shop.area}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-border p-4">
            <span className="flex items-center gap-3 text-[14px] font-semibold text-foreground/80">
              <Clock className="h-[18px] w-[18px] text-primary" aria-hidden="true" />
              Giờ mở cửa
            </span>
            <span className="text-[14px] font-bold text-foreground">
              {shop.openHours}
            </span>
          </div>

          <p className="mt-1 text-center text-[13px] text-muted-foreground">
            Bản demo nên số điện thoại được che. Khi cần mua hàng thật, bạn có thể ghé trực tiếp địa chỉ trên.
          </p>
        </div>
      </GcModal>
    </PageContainer>
  );
}
