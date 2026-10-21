import { CATEGORIES } from "@/data/mock-data";
import type { CategoryId, Market, Product, UserRole } from "@/types";

/**
 * Hai "chợ" tách theo danh mục:
 * - phế liệu (ve chai): người dân đăng, người thu mua (người ve chai, vựa) mua
 * - đồ thanh lý còn dùng được: người dân đăng, người dân khác mua
 * Mỗi bên chỉ thấy chợ của mình nên không còn cảnh cân sắt vụn lẫn với bàn ghế.
 */
export const MARKET_LABEL: Record<Market, string> = {
  scrap: "Phế liệu",
  secondhand: "Đồ thanh lý",
};

/** Ai sẽ thấy tin — hiện ngay lúc người bán chọn danh mục */
export const MARKET_AUDIENCE: Record<Market, string> = {
  scrap: "Tin hiện cho người thu mua: người ve chai, vựa phế liệu quanh bạn.",
  secondhand: "Tin hiện cho người dân đang tìm đồ cũ còn dùng được.",
};

export function marketOf(categoryId: CategoryId): Market {
  return CATEGORIES.find((c) => c.id === categoryId)?.market ?? "secondhand";
}

export const categoriesOf = (market: Market) => CATEGORIES.filter((c) => c.market === market);

/** Chợ mà vai trò này được mua. null = vai trò không mua ở chợ nào (nhân sự, doanh nghiệp mua lô ở khu riêng). */
export function marketFor(role: UserRole | undefined): Market | null {
  if (role === "resident") return "secondhand";
  if (role === "partner") return "scrap";
  return null;
}

export function canBuy(role: UserRole | undefined, product: Product): boolean {
  return !product.isMine && product.status === "available" && marketFor(role) === marketOf(product.categoryId);
}
