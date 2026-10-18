"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Filter, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { useApp } from "@/store/app-store";
import { CATEGORIES } from "@/data/mock-data";
import { ProductCard } from "@/components/greencity/ProductCard";
import { EmptyState } from "@/components/greencity/EmptyState";
import { AREAS, type CategoryId } from "@/types";
import { cn } from "@/lib/utils";

type SortKey = "newest" | "price-asc" | "price-desc";
type StatusKey = "all" | "available" | "sold";
type PriceKey = "all" | "p1" | "p2" | "p3" | "p4";

const PRICE_BUCKETS: { key: PriceKey; label: string; test: (p: number) => boolean }[] = [
  { key: "all", label: "Mọi mức giá", test: () => true },
  { key: "p1", label: "Dưới 5.000đ", test: (p) => p < 5000 },
  { key: "p2", label: "5.000 – 50.000đ", test: (p) => p >= 5000 && p < 50000 },
  { key: "p3", label: "50.000 – 200.000đ", test: (p) => p >= 50000 && p < 200000 },
  { key: "p4", label: "Trên 200.000đ", test: (p) => p >= 200000 },
];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Mới nhất" },
  { key: "price-asc", label: "Giá tăng dần" },
  { key: "price-desc", label: "Giá giảm dần" },
];

export function DiscoverView() {
  const { state, setDiscoverPreset } = useApp();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"all" | CategoryId>(() => {
    const p = state.discoverPreset;
    return p && p !== "all" ? (p as CategoryId) : "all";
  });
  const [price, setPrice] = useState<PriceKey>("all");
  const [area, setArea] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [status, setStatus] = useState<StatusKey>("all");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = [...state.products];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.area.toLowerCase().includes(q)
      );
    }
    if (category !== "all") list = list.filter((p) => p.categoryId === category);
    const bucket = PRICE_BUCKETS.find((b) => b.key === price)!;
    list = list.filter((p) => bucket.test(p.price));
    if (area !== "all") list = list.filter((p) => p.area === area);
    if (status !== "all") list = list.filter((p) => p.status === status);

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      default:
        list.sort((a, b) => a.postedHoursAgo - b.postedHoursAgo);
    }
    return list;
  }, [state.products, search, category, price, area, status, sort]);

  const activeFilters =
    (category !== "all" ? 1 : 0) +
    (price !== "all" ? 1 : 0) +
    (area !== "all" ? 1 : 0) +
    (status !== "all" ? 1 : 0) +
    (search.trim() ? 1 : 0);

  const clearAll = () => {
    setSearch("");
    setCategory("all");
    setPrice("all");
    setArea("all");
    setStatus("all");
    setSort("newest");
    setDiscoverPreset("all");
  };

  const selectCls =
    "h-11 w-full cursor-pointer appearance-none rounded-xl border-[1.5px] border-[#dce7dc] bg-white px-4 text-[13.5px] font-semibold text-foreground outline-none transition-all duration-200 hover:border-[#a8c9ae] focus:border-primary focus:shadow-[0_0_0_3px_rgba(36,139,82,0.14)]";

  return (
    <div className="nice-scroll h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Thanh tìm kiếm */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm ve chai, đồ cũ, khu vực..."
              aria-label="Tìm kiếm sản phẩm"
              className="h-12 w-full rounded-2xl border-[1.5px] border-[#dce7dc] bg-white pl-11 pr-10 text-[14px] font-medium outline-none transition-all duration-200 placeholder:text-muted-foreground/60 hover:border-[#a8c9ae] focus:border-primary focus:shadow-[0_0_0_4px_rgba(36,139,82,0.12)]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Xóa tìm kiếm"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowFilters((s) => !s)}
            className={cn(
              "flex h-12 items-center gap-2 rounded-2xl border-[1.5px] px-5 text-[14px] font-semibold transition-all duration-200",
              showFilters || activeFilters > 0
                ? "border-primary/50 bg-accent/60 text-primary"
                : "border-[#dce7dc] bg-white text-foreground/75 hover:border-[#a8c9ae]"
            )}
          >
            <SlidersHorizontal className="h-4.5 w-4.5" />
            Bộ lọc
            {activeFilters > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-white">
                {activeFilters}
              </span>
            )}
          </button>
        </div>

        {/* Khu vực bộ lọc */}
        <motion.div
          initial={false}
          animate={{ height: showFilters ? "auto" : 0, opacity: showFilters ? 1 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div className="mt-4 rounded-3xl border border-border/70 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-[14px] font-bold text-forest">
                <Filter className="h-4 w-4 text-primary" />
                Lọc & sắp xếp
              </p>
              {activeFilters > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12.5px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Xóa tất cả
                </button>
              )}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label htmlFor="f-area" className="mb-1.5 block text-[12px] font-bold text-foreground/70">
                  Khu vực
                </label>
                <select id="f-area" value={area} onChange={(e) => setArea(e.target.value)} className={selectCls}>
                  <option value="all">Tất cả khu vực</option>
                  {AREAS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="f-price" className="mb-1.5 block text-[12px] font-bold text-foreground/70">
                  Mức giá
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
                <label htmlFor="f-sort" className="mb-1.5 block text-[12px] font-bold text-foreground/70">
                  Sắp xếp
                </label>
                <select id="f-sort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={selectCls}>
                  {SORT_OPTIONS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="mb-1.5 text-[12px] font-bold text-foreground/70">Trạng thái</p>
                <div className="flex h-11 items-center gap-2">
                  {(
                    [
                      { key: "all", label: "Tất cả" },
                      { key: "available", label: "Còn hàng" },
                      { key: "sold", label: "Đã bán" },
                    ] as const
                  ).map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setStatus(s.key)}
                      className={cn(
                        "flex-1 rounded-xl px-2 py-2 text-[12px] font-bold transition-all duration-200",
                        status === s.key
                          ? "bg-primary text-white shadow-sm shadow-primary/30"
                          : "bg-[#f2f6f2] text-foreground/65 hover:bg-accent hover:text-primary"
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Chips danh mục */}
        <div className="hide-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => {
              setCategory("all");
              setDiscoverPreset("all");
            }}
            className={cn(
              "shrink-0 rounded-full border-[1.5px] px-4 py-2.5 text-[13px] font-semibold transition-all duration-200",
              category === "all"
                ? "border-primary bg-primary text-white shadow-sm shadow-primary/30"
                : "border-[#dce7dc] bg-white text-foreground/70 hover:border-primary/50 hover:text-primary"
            )}
          >
            Tất cả danh mục
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setCategory(c.id);
                setDiscoverPreset("all");
              }}
              className={cn(
                "shrink-0 rounded-full border-[1.5px] px-4 py-2.5 text-[13px] font-semibold transition-all duration-200",
                category === c.id
                  ? "border-primary bg-primary text-white shadow-sm shadow-primary/30"
                  : "border-[#dce7dc] bg-white text-foreground/70 hover:border-primary/50 hover:text-primary"
              )}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Kết quả */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-[14px] font-semibold text-foreground/75">
            <span className="font-extrabold text-forest">{filtered.length}</span> sản phẩm
            {category !== "all" && (
              <span className="text-muted-foreground">
                {" "}
                trong danh mục{" "}
                {CATEGORIES.find((c) => c.id === category)?.name.toLowerCase()}
              </span>
            )}
          </p>
          <p className="hidden text-[12px] text-muted-foreground/70 sm:block">
            Dữ liệu mẫu demo — tự động lọc phía frontend
          </p>
        </div>

        {filtered.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-4 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Không tìm thấy kết quả phù hợp"
            description="Thử đổi từ khóa, xóa bộ lọc hoặc chọn danh mục khác — kho sản phẩm demo có 10+ món đang chờ khám phá."
            action={
              <button
                type="button"
                onClick={clearAll}
                className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-[14px] font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5"
              >
                <RotateCcw className="h-4 w-4" />
                Xóa bộ lọc và xem lại tất cả
              </button>
            }
          />
        )}
      </div>
    </div>
  );
}
