"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, X, RotateCcw, Camera } from "lucide-react";
import {
  ROUTES,
  WASTE_GROUPS,
  type WasteGroup,
  type SortingGuideItem,
} from "@/features/contracts";
import { SORTING_GUIDE } from "@/data/knowledge";
import { EmptyState } from "@/components/greencity/EmptyState";
import {
  PageContainer,
  PageIntro,
  buttonClass,
  inputClass,
} from "@/components/greencity/ui";
import { removeAccents, groupBadgeClass } from "./lib";
import { cn } from "@/lib/utils";

const GROUPS: WasteGroup[] = ["tai-che", "thuc-pham", "khac", "nguy-hai", "cong-kenh"];

export function SortingGuideView() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [selectedGroup, setSelectedGroup] = useState<WasteGroup | null>(null);

  const toggleGroup = (group: WasteGroup) => {
    setSelectedGroup((curr) => (curr === group ? null : group));
  };

  const results = useMemo(() => {
    const q = removeAccents(query);
    return SORTING_GUIDE.filter((item: SortingGuideItem) => {
      if (selectedGroup && item.group !== selectedGroup) {
        return false;
      }
      if (!q) return true;
      const matchName = removeAccents(item.name).includes(q);
      const matchAliases = item.aliases.some((alias) => removeAccents(alias).includes(q));
      return matchName || matchAliases;
    });
  }, [query, selectedGroup]);

  const clearAll = () => {
    setQuery("");
    setSelectedGroup(null);
  };

  return (
    <PageContainer>
      <PageIntro title="Sổ tay phân loại rác">
        Tra cứu cách sơ chế và phân loại đúng hơn 60 món đồ quen thuộc trong sinh hoạt gia đình tại Việt Nam.
      </PageIntro>

      {/* 5 thẻ giải thích nhóm chất thải ở đầu trang */}
      <section aria-label="5 nhóm phân loại rác" className="mt-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {GROUPS.map((group) => {
            const info = WASTE_GROUPS[group];
            const active = selectedGroup === group;
            return (
              <button
                key={group}
                type="button"
                onClick={() => toggleGroup(group)}
                aria-pressed={active}
                className={cn(
                  "flex flex-col items-start rounded-2xl border p-4 text-left transition-all duration-150 min-h-[110px]",
                  active
                    ? "border-primary bg-accent ring-2 ring-primary/20 shadow-sm"
                    : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
                )}
              >
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[12px] font-bold",
                    groupBadgeClass(group)
                  )}
                >
                  {info.label}
                </span>
                <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground line-clamp-3">
                  {info.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Ô tìm kiếm */}
      <div className="mt-6">
        <label htmlFor="sorting-search" className="sr-only">
          Tìm kiếm món đồ trong sổ tay
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="sorting-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên món: chai nhựa, lon bia, vỏ hộp sữa, pin, bóng đèn..."
            className={cn(inputClass(), "pl-12 pr-11")}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Xóa từ khóa tìm kiếm"
              className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Thanh đếm kết quả và đặt lại bộ lọc */}
      <div className="mt-5 flex min-h-11 items-center justify-between gap-3">
        <p className="text-[15px] text-muted-foreground" aria-live="polite">
          <strong className="text-foreground">{results.length}</strong> món
          {selectedGroup && (
            <span> trong nhóm {WASTE_GROUPS[selectedGroup].label.toLowerCase()}</span>
          )}
        </p>
        {(query || selectedGroup) && (
          <button
            type="button"
            onClick={clearAll}
            className={buttonClass.ghost}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Danh sách kết quả */}
      {results.length > 0 ? (
        <div className="mt-3 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((item: SortingGuideItem) => (
            <article
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-border bg-card p-4 sm:p-5 transition-[border-color,box-shadow] duration-150 hover:border-primary/40 hover:shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[16px] font-bold text-foreground">
                    {item.name}
                  </h3>
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                      groupBadgeClass(item.group)
                    )}
                  >
                    {WASTE_GROUPS[item.group].label}
                  </span>
                </div>

                {item.aliases.length > 0 && (
                  <p className="mt-1 text-[12px] text-muted-foreground">
                    Tên gọi khác: {item.aliases.join(", ")}
                  </p>
                )}

                <div className="mt-3 rounded-xl bg-muted/60 p-3">
                  <p className="text-[13px] font-semibold text-foreground/90">
                    Cách xử lý:
                  </p>
                  <p className="mt-0.5 text-[14px] leading-relaxed text-foreground/80">
                    {item.prep}
                  </p>
                </div>
              </div>

              {item.note && (
                <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
                  Ghi chú: {item.note}
                </p>
              )}
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Chưa có trong sổ tay"
          description={`Không tìm thấy kết quả nào phù hợp với "${query}". Bạn có thể gửi ảnh chụp món đồ để cộng tác viên giải đáp.`}
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={clearAll}
                className={buttonClass.secondary}
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Xem tất cả
              </button>
              <Link
                href={ROUTES.consult}
                className={buttonClass.primary}
              >
                <Camera className="h-4 w-4" aria-hidden="true" />
                Gửi ảnh nhờ tư vấn
              </Link>
            </div>
          }
        />
      )}
    </PageContainer>
  );
}
