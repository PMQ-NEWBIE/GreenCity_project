"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Clock,
  Heart,
  MapPin,
  Plus,
  Repeat,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import {
  ROUTES,
  AREAS,
  SWAP_CATEGORY_LABEL,
  SWAP_CONDITION_LABEL,
  SWAP_STATUS_LABEL,
  formatRelativeTime,
  useSwap,
  type SwapCategory,
  type SwapStatus,
  type SwapItem,
} from "@/features/contracts";
import { SmartImage } from "@/components/greencity/SmartImage";
import { EmptyState } from "@/components/greencity/EmptyState";
import {
  PageContainer,
  PageIntro,
  buttonClass,
  inputClass,
} from "@/components/greencity/ui";
import { cn } from "@/lib/utils";

const CATEGORIES: { id: SwapCategory | "all"; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "quan-ao", label: SWAP_CATEGORY_LABEL["quan-ao"] },
  { id: "sach", label: SWAP_CATEGORY_LABEL["sach"] },
  { id: "gia-dung", label: SWAP_CATEGORY_LABEL["gia-dung"] },
  { id: "do-tre-em", label: SWAP_CATEGORY_LABEL["do-tre-em"] },
  { id: "khac", label: SWAP_CATEGORY_LABEL["khac"] },
];

export function SwapView() {
  const { items } = useSwap();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<SwapCategory | "all">("all");
  const [area, setArea] = useState<string>("all");
  const [giveawayOnly, setGiveawayOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState<SwapStatus | "all">("open");

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (area !== "all" && item.area !== area) return false;
      if (giveawayOnly && !item.giveaway) return false;
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (
        q &&
        !item.title.toLowerCase().includes(q) &&
        !item.description.toLowerCase().includes(q) &&
        !item.area.toLowerCase().includes(q) &&
        !item.wants.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [items, search, category, area, giveawayOnly, statusFilter]);

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setArea("all");
    setGiveawayOnly(false);
    setStatusFilter("open");
  };

  const hasAnyFilter =
    search.trim() !== "" ||
    category !== "all" ||
    area !== "all" ||
    giveawayOnly ||
    statusFilter !== "open";

  const selectCls = cn(inputClass(), "select-chevron cursor-pointer appearance-none");

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageIntro title="Cho tặng, đổi đồ cũ">
          Nơi người dân chia sẻ, tặng miễn phí hoặc đổi lấy món đồ khác bạn đang cần. Hoàn toàn không sử dụng tiền mặt.
        </PageIntro>
        <Link
          href={ROUTES.swapPost}
          className={cn(buttonClass.primary, "shrink-0 min-h-12 px-5")}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Đăng đồ trao đổi
        </Link>
      </div>

      {/* Tìm kiếm */}
      <div className="mt-6">
        <label htmlFor="swap-search" className="sr-only">
          Tìm kiếm đồ trao đổi
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="swap-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên món, mô tả hoặc khu vực: áo khoác, sách giáo khoa, nồi cơm điện..."
            className={cn(inputClass(), "pl-12 pr-11")}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Xóa từ khóa tìm kiếm"
              className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Chip phân loại */}
      <div
        className="hide-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
        role="group"
        aria-label="Lọc theo loại đồ"
      >
        {CATEGORIES.map((c) => {
          const selected = category === c.id;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setCategory(c.id)}
              className={cn(
                "min-h-11 shrink-0 rounded-full border px-4 text-[14px] font-semibold transition-colors duration-150",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground/80 hover:border-primary/50 hover:text-primary"
              )}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Bộ lọc: khu vực, trạng thái, công tắc tặng miễn phí */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="swap-area-filter" className="mb-1 block text-[13px] font-semibold text-muted-foreground">
            Khu vực
          </label>
          <select
            id="swap-area-filter"
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

        <div>
          <label htmlFor="swap-status-filter" className="mb-1 block text-[13px] font-semibold text-muted-foreground">
            Trạng thái tin
          </label>
          <select
            id="swap-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as SwapStatus | "all")}
            className={selectCls}
          >
            <option value="open">Đang mở tìm người đổi/nhận</option>
            <option value="all">Tất cả trạng thái</option>
            <option value="reserved">Đã có người hẹn</option>
            <option value="done">Đã trao đổi xong</option>
          </select>
        </div>

        <div className="flex items-end">
          <label className="flex h-12 w-full cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-4 transition-colors hover:border-primary/40">
            <input
              type="checkbox"
              checked={giveawayOnly}
              onChange={(e) => setGiveawayOnly(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary accent-primary"
            />
            <span className="text-[14px] font-semibold text-foreground">
              Chỉ đồ tặng miễn phí
            </span>
          </label>
        </div>
      </div>

      {/* Thanh đếm kết quả */}
      <div className="mt-6 flex min-h-11 items-center justify-between gap-3">
        <p className="text-[15px] text-muted-foreground" aria-live="polite">
          <strong className="text-foreground">{filteredItems.length}</strong> món đồ
          {category !== "all" && <span> trong nhóm {SWAP_CATEGORY_LABEL[category].toLowerCase()}</span>}
        </p>
        {hasAnyFilter && (
          <button type="button" onClick={clearFilters} className={buttonClass.ghost}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Lưới thẻ trao đổi */}
      {filteredItems.length === 0 ? (
        <EmptyState
          title="Chưa có món đồ nào phù hợp"
          description="Thử tìm với từ khóa khác, đổi khu vực hoặc xóa bớt các điều kiện lọc."
          action={
            <button type="button" onClick={clearFilters} className={buttonClass.primary}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Xóa bộ lọc
            </button>
          }
        />
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-5">
          {filteredItems.map((item: SwapItem) => {
            const isDone = item.status === "done";
            const isReserved = item.status === "reserved";

            return (
              <article
                key={item.id}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-[border-color,box-shadow] duration-200 hover:border-primary/40 hover:shadow-md",
                  isDone && "opacity-60 grayscale-[30%]"
                )}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <SmartImage
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                    imgClassName="transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-card/90 px-2.5 py-0.5 text-[11px] font-semibold text-primary backdrop-blur-sm">
                      {SWAP_CONDITION_LABEL[item.condition]}
                    </span>
                    {isReserved && (
                      <span className="rounded-full bg-warn px-2.5 py-0.5 text-[11px] font-bold text-primary-foreground shadow-sm">
                        Đã có người hẹn
                      </span>
                    )}
                    {isDone && (
                      <span className="rounded-full bg-foreground/80 px-2.5 py-0.5 text-[11px] font-bold text-background">
                        Đã trao đổi
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-foreground">
                      <Link
                        href={ROUTES.swapItem(item.id)}
                        className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                      >
                        {item.title}
                      </Link>
                    </h3>

                    <div className="mt-2.5">
                      {item.giveaway ? (
                        <span className="inline-flex items-center gap-1 text-[13px] font-bold text-primary">
                          <Heart className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                          Tặng miễn phí
                        </span>
                      ) : (
                        <p className="line-clamp-1 text-[13px] text-muted-foreground">
                          <span className="font-semibold text-foreground">Muốn đổi:</span>{" "}
                          {item.wants}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-2.5 text-[12px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                      <span className="truncate">{item.area}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {formatRelativeTime(item.postedAt)}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
