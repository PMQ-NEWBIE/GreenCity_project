"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Clock, Map, MapPin, Award, RotateCcw } from "lucide-react";
import {
  ROUTES,
  AREAS,
  GREEN_SHOP_KIND_LABEL,
  type GreenShopKind,
  type GreenShop,
} from "@/features/contracts";
import { GREEN_SHOPS } from "@/data/green-shops";
import { SmartImage } from "@/components/greencity/SmartImage";
import { EmptyState } from "@/components/greencity/EmptyState";
import {
  PageContainer,
  PageIntro,
  buttonClass,
  inputClass,
} from "@/components/greencity/ui";
import { cn } from "@/lib/utils";

const KINDS: { id: GreenShopKind | "all"; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "phan-bon", label: GREEN_SHOP_KIND_LABEL["phan-bon"] },
  { id: "lam-vuon", label: GREEN_SHOP_KIND_LABEL["lam-vuon"] },
  { id: "san-pham-xanh", label: GREEN_SHOP_KIND_LABEL["san-pham-xanh"] },
];

export function ShopsView() {
  const [kind, setKind] = useState<GreenShopKind | "all">("all");
  const [area, setArea] = useState<string>("all");

  const filteredShops = useMemo(() => {
    return GREEN_SHOPS.filter((shop) => {
      if (kind !== "all" && shop.kind !== kind) return false;
      if (area !== "all" && shop.area !== area) return false;
      return true;
    });
  }, [kind, area]);

  const clearFilters = () => {
    setKind("all");
    setArea("all");
  };

  const selectCls = cn(inputClass(), "select-chevron cursor-pointer appearance-none");

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageIntro title="Cửa hàng sản phẩm xanh">
          Khám phá các cơ sở sản xuất phân bón hữu cơ, tiệm đồ dùng sinh thái và vườn ươm cây xanh uy tín tại TP.HCM.
        </PageIntro>
        <Link
          href={ROUTES.map}
          className={cn(buttonClass.secondary, "shrink-0 min-h-11 px-4 text-[14px]")}
        >
          <Map className="h-4 w-4" aria-hidden="true" />
          Xem trên bản đồ
        </Link>
      </div>

      {/* Bộ lọc: loại gian hàng & khu vực */}
      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div
          className="hide-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
          role="group"
          aria-label="Lọc theo loại gian hàng"
        >
          {KINDS.map((k) => {
            const selected = kind === k.id;
            return (
              <button
                key={k.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setKind(k.id)}
                className={cn(
                  "min-h-11 shrink-0 rounded-full border px-4 text-[14px] font-semibold transition-colors duration-150",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground/80 hover:border-primary/50 hover:text-primary"
                )}
              >
                {k.label}
              </button>
            );
          })}
        </div>

        <div className="w-full sm:w-64">
          <label htmlFor="shop-area-filter" className="sr-only">
            Lọc theo khu vực
          </label>
          <select
            id="shop-area-filter"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className={selectCls}
          >
            <option value="all">Toàn TP. Hồ Chí Minh</option>
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Số lượng & đặt lại bộ lọc */}
      <div className="mt-6 flex min-h-11 items-center justify-between gap-3">
        <p className="text-[15px] text-muted-foreground" aria-live="polite">
          <strong className="text-foreground">{filteredShops.length}</strong> gian hàng
          {kind !== "all" && <span> thuộc nhóm {GREEN_SHOP_KIND_LABEL[kind].toLowerCase()}</span>}
          {area !== "all" && <span> tại {area}</span>}
        </p>
        {(kind !== "all" || area !== "all") && (
          <button type="button" onClick={clearFilters} className={buttonClass.ghost}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Lưới gian hàng */}
      {filteredShops.length === 0 ? (
        <EmptyState
          title="Không tìm thấy gian hàng nào"
          description="Hiện chưa có gian hàng phù hợp với bộ lọc đã chọn. Bạn hãy thử chọn khu vực khác."
          action={
            <button type="button" onClick={clearFilters} className={buttonClass.primary}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Xem tất cả gian hàng
            </button>
          }
        />
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
          {filteredShops.map((shop: GreenShop) => (
            <article
              key={shop.slug}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-[border-color,box-shadow] duration-200 hover:border-primary/40 hover:shadow-md"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden">
                <SmartImage
                  src={shop.cover}
                  alt={shop.name}
                  className="h-full w-full"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
                  imgClassName="transition-transform duration-300 group-hover:scale-[1.03]"
                />
                <span className="absolute left-3 top-3 rounded-full bg-card/90 px-2.5 py-0.5 text-[12px] font-semibold text-primary backdrop-blur-sm">
                  {GREEN_SHOP_KIND_LABEL[shop.kind]}
                </span>
                {shop.isPartnerReward && (
                  <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-bold text-primary-foreground shadow-sm">
                    <Award className="h-3 w-3" aria-hidden="true" />
                    Nhận đổi điểm
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <h3 className="text-[17px] font-bold leading-snug text-foreground">
                    <Link
                      href={ROUTES.shop(shop.slug)}
                      className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                    >
                      {shop.name}
                    </Link>
                  </h3>
                  <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
                    {shop.description}
                  </p>
                </div>

                <div className="mt-4 space-y-1.5 border-t border-border pt-3 text-[13px] text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                    <span className="truncate">{shop.address}, {shop.area}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span>{shop.openHours}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
