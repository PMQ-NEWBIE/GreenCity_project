"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { useApp } from "@/store/app-store";
import { ProductCard } from "@/components/greencity/ProductCard";
import { EmptyState } from "@/components/greencity/EmptyState";
import { PageContainer, buttonClass, inputClass } from "@/components/greencity/ui";
import { AREAS, type CategoryId, type Market } from "@/types";
import { categoriesOf, marketOf } from "@/lib/market";
import { cn } from "@/lib/utils";

type SortKey = "newest" | "price-asc" | "price-desc";
type StatusKey = "available" | "all";
type PriceKey = "all" | "p1" | "p2" | "p3" | "p4";

const PRICE_BUCKETS: { key: PriceKey; label: string; test: (p: number) => boolean }[] = [
  { key: "all", label: "Mọi mức giá", test: () => true },
  { key: "p1", label: "Dưới 5.000đ", test: (p) => p < 5000 },
  { key: "p2", label: "5.000đ – 50.000đ", test: (p) => p >= 5000 && p < 50000 },
  { key: "p3", label: "50.000đ – 200.000đ", test: (p) => p >= 50000 && p < 200000 },
  { key: "p4", label: "Trên 200.000đ", test: (p) => p >= 200000 },
];

const CATEGORY_PARAM = "danh-muc";

/**
 * Tìm tin để mua — chỉ trong một chợ:
 * người dân (chế độ mua) xem đồ thanh lý, người thu mua xem phế liệu.
 */
export function DiscoverView({ market = "secondhand" }: { market?: Market }) {
  const { state } = useApp();
  const CATEGORIES = categoriesOf(market);
  const isCategory = (v: string | null): v is CategoryId => CATEGORIES.some((c) => c.id === v);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawCategory = searchParams.get(CATEGORY_PARAM);
  const category: CategoryId | "all" = isCategory(rawCategory) ? rawCategory : "all";

  const [search, setSearch] = useState("");
  const [price, setPrice] = useState<PriceKey>("all");
  const [area, setArea] = useState("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [status, setStatus] = useState<StatusKey>("available");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Danh mục nằm trên URL → chia sẻ link được, nút Back hoạt động
  const setCategory = (id: CategoryId | "all") => {
    const params = new URLSearchParams(searchParams.toString());
    if (id === "all") params.delete(CATEGORY_PARAM);
    else params.set(CATEGORY_PARAM, id);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    const bucket = PRICE_BUCKETS.find((b) => b.key === price)!;
    const list = state.products.filter(
      (p) =>
        !p.isMine &&
        p.status !== "draft" &&
        marketOf(p.categoryId) === market &&
        (status === "all" || p.status === "available") &&
        (category === "all" || p.categoryId === category) &&
        (area === "all" || p.area === area) &&
        bucket.test(p.price) &&
        (!q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.area.toLowerCase().includes(q))
    );
    return list.sort((a, b) =>
      sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : a.postedHoursAgo - b.postedHoursAgo
    );
  }, [state.products, search, category, price, area, sort, status, market]);

  const activeFilters = [price !== "all", area !== "all", status !== "available"].filter(Boolean).length;
  const hasAnyFilter = activeFilters > 0 || category !== "all" || search.trim() !== "";

  const clearAll = () => {
    setSearch("");
    setPrice("all");
    setArea("all");
    setSort("newest");
    setStatus("available");
    setCategory("all");
  };

  const selectCls = cn(inputClass(), "select-chevron cursor-pointer appearance-none");

  return (
    <PageContainer>
      <h2 className="sr-only">Tìm và lọc tin đăng</h2>
      {/* Tìm kiếm */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <label htmlFor="discover-search" className="sr-only">
            Tìm theo tên món, mô tả hoặc khu vực
          </label>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            id="discover-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={market === "scrap" ? "Tìm: giấy carton, lon nhôm, sắt vụn…" : "Tìm: quạt, bàn ghế, tủ kệ cũ…"}
            className={cn(inputClass(), "pl-12 pr-11")}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Xóa từ khóa"
              className="absolute right-0.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setFiltersOpen((o) => !o)}
          aria-expanded={filtersOpen}
          aria-controls="discover-filters"
          className={cn(buttonClass.secondary, "shrink-0 px-4 lg:hidden", (filtersOpen || activeFilters > 0) && "border-primary/50 text-primary")}
        >
          <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
          <span className="hidden xs:inline">Bộ lọc</span>
          {activeFilters > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[12px] font-bold text-primary-foreground">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {/* Danh mục */}
      <div className="hide-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Lọc theo loại vật liệu">
        {[{ id: "all" as const, name: "Tất cả" }, ...CATEGORIES].map((c) => {
          const selected = category === c.id;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setCategory(c.id)}
              className={cn(
                "min-h-11 shrink-0 rounded-full border px-4 text-[14px] font-semibold transition-colors duration-150",
                selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground/80 hover:border-primary/50 hover:text-primary"
              )}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      {/* Bộ lọc: luôn hiện trên desktop, gập lại trên điện thoại */}
      <div id="discover-filters" className={cn("mt-4 grid gap-3 sm:grid-cols-2 lg:grid lg:grid-cols-4", filtersOpen ? "grid" : "hidden")}>
        <div>
          <label htmlFor="f-price" className="mb-1.5 block text-[13px] font-semibold text-muted-foreground">
            Giá
          </label>
          <select id="f-price" value={price} onChange={(e) => setPrice(e.target.value as PriceKey)} className={selectCls}>
            {PRICE_BUCKETS.map((b) => (
              <option key={b.key} value={b.key}>
                {b.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-area" className="mb-1.5 block text-[13px] font-semibold text-muted-foreground">
            Khu vực
          </label>
          <select id="f-area" value={area} onChange={(e) => setArea(e.target.value)} className={selectCls}>
            <option value="all">Toàn TP. Hồ Chí Minh</option>
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-sort" className="mb-1.5 block text-[13px] font-semibold text-muted-foreground">
            Sắp xếp
          </label>
          <select id="f-sort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={selectCls}>
            <option value="newest">Mới đăng trước</option>
            <option value="price-asc">Giá thấp trước</option>
            <option value="price-desc">Giá cao trước</option>
          </select>
        </div>
        <div>
          <label htmlFor="f-status" className="mb-1.5 block text-[13px] font-semibold text-muted-foreground">
            Tình trạng
          </label>
          <select id="f-status" value={status} onChange={(e) => setStatus(e.target.value as StatusKey)} className={selectCls}>
            <option value="available">Chỉ món còn hàng</option>
            <option value="all">Gồm cả món đã bán</option>
          </select>
        </div>
      </div>

      {/* Kết quả */}
      <div className="mt-6 flex min-h-11 items-center justify-between gap-3">
        <p className="text-[15px] text-muted-foreground" aria-live="polite">
          <strong className="text-foreground">{results.length}</strong> món
          {category !== "all" && <> trong nhóm {CATEGORIES.find((c) => c.id === category)?.name.toLowerCase()}</>}
        </p>
        {hasAnyFilter && (
          <button type="button" onClick={clearAll} className={buttonClass.ghost}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Xóa bộ lọc
          </button>
        )}
      </div>

      {results.length > 0 ? (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Chưa có món nào khớp"
          description="Thử từ khóa ngắn hơn, chọn khu vực khác hoặc xóa bộ lọc."
          action={
            <button type="button" onClick={clearAll} className={buttonClass.primary}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Xóa bộ lọc
            </button>
          }
        />
      )}
    </PageContainer>
  );
}
