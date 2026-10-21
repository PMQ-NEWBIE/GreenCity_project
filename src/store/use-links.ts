"use client";

import { ROUTES } from "@/lib/routes";
import { useApp } from "./app-store";

/**
 * Đường dẫn tới tin đăng / đơn theo khu của người đang xem:
 * người thu mua làm việc trong khu riêng (/doi-tac/...), người dân dùng trang mua bán.
 * Component dùng chung (thẻ tin, thẻ đơn, trang chi tiết) lấy link từ đây thay vì ROUTES trực tiếp.
 */
export function useLinks() {
  const role = useApp().state.user?.role;
  const partner = role === "partner";
  return {
    /** Đơn gọi thu gom: người dân theo dõi, người mua thao tác, ban điều hành giám sát */
    pickup: (id: string) => (partner ? ROUTES.partnerPickup(id) : role === "operator" ? ROUTES.opsPickup(id) : ROUTES.collectRequest(id)),
    product: (id: string) => (partner ? ROUTES.partnerListing(id) : ROUTES.product(id)),
    order: (id: string) => (partner ? ROUTES.partnerOrder(id) : ROUTES.order(id)),
    /** Danh sách đơn mình đặt */
    boughtList: partner ? ROUTES.partnerOrders : ROUTES.buyerOrders,
    /** Nơi tìm tin để mua */
    market: partner ? ROUTES.partner : ROUTES.discover,
  };
}
