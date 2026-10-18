"use client";

import { Heart } from "lucide-react";
import { useApp } from "@/store/app-store";
import { ProductCard } from "@/components/greencity/ProductCard";
import { EmptyState } from "@/components/greencity/EmptyState";
import { Reveal } from "@/components/greencity/Reveal";

export function FavoritesView() {
  const { state, goApp } = useApp();
  const favorites = state.products.filter((p) => state.favorites.includes(p.id));

  return (
    <div className="nice-scroll h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Reveal>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[24px] font-extrabold tracking-tight text-forest">
                Sản phẩm yêu thích
              </h2>
              <p className="mt-1.5 text-[14px] text-muted-foreground">
                {favorites.length > 0
                  ? `Bạn đang theo dõi ${favorites.length} sản phẩm trong phiên demo.`
                  : "Nhấn tim trên sản phẩm bất kỳ để lưu vào đây."}
              </p>
            </div>
            {favorites.length > 0 && (
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary">
                <Heart className="h-5 w-5 fill-current" />
              </span>
            )}
          </div>
        </Reveal>

        {favorites.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-4 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Heart}
            title="Danh sách yêu thích đang trống"
            description="Khám phá các tin đăng ve chai và đồ cũ, nhấn biểu tượng tim để lưu những món bạn quan tâm."
            action={
              <button
                type="button"
                onClick={() => goApp("discover")}
                className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-[14px] font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5"
              >
                Khám phá sản phẩm ngay
              </button>
            }
          />
        )}
      </div>
    </div>
  );
}
