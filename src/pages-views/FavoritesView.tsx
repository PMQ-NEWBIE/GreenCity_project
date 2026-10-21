"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useApp } from "@/store/app-store";
import { ProductCard } from "@/components/greencity/ProductCard";
import { EmptyState } from "@/components/greencity/EmptyState";
import { PageContainer, PageIntro, buttonClass } from "@/components/greencity/ui";
import { ROUTES } from "@/lib/routes";
import { marketFor, marketOf } from "@/lib/market";

export function FavoritesView() {
  const { state } = useApp();
  const market = marketFor(state.user?.role);
  const favorites = state.products.filter(
    (p) => p.status !== "draft" && state.favorites.includes(p.id) && (!market || marketOf(p.categoryId) === market)
  );

  return (
    <PageContainer>
      <PageIntro title="Món đã lưu">
        {favorites.length > 0
          ? `Bạn đang theo dõi ${favorites.length} món. Bấm lại hình trái tim để bỏ lưu.`
          : undefined}
      </PageIntro>

      {favorites.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {favorites.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Heart}
          title="Chưa lưu món nào"
          description="Khi xem tin, bấm hình trái tim để lưu lại — món đó sẽ nằm ở đây để bạn xem sau."
          action={
            <Link href={ROUTES.discover} className={buttonClass.primary}>
              Đi xem các tin đăng
            </Link>
          }
        />
      )}
    </PageContainer>
  );
}
