import type { Order, OrderStatus } from "@/types/features";

/** Ai đang xem đơn: người mua (đơn mình đặt) hay người bán (đơn tới tin của mình). */
export type OrderSide = "buyer" | "seller";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Chờ người bán xác nhận",
  accepted: "Đã nhận đơn, chờ giao",
  done: "Đã giao xong",
  declined: "Người bán từ chối",
  cancelled: "Đã hủy",
};

/** Cùng trạng thái nhưng nói theo việc người bán phải làm. */
export const ORDER_STATUS_LABEL_SELLER: Record<OrderStatus, string> = {
  pending: "Chờ bạn xác nhận",
  accepted: "Đã nhận, chờ giao",
  done: "Đã giao xong",
  declined: "Bạn đã từ chối",
  cancelled: "Đã hủy",
};

export const ORDER_OPEN: OrderStatus[] = ["pending", "accepted"];
export const isOpen = (o: Order) => ORDER_OPEN.includes(o.status);

/** Lý do gợi sẵn khi từ chối / hủy — chọn nhanh trên điện thoại thay vì gõ. */
export const DECLINE_REASONS = ["Hàng đã bán cho người khác", "Không hợp khung giờ hẹn", "Số lượng không đủ", "Lý do khác"];
export const CANCEL_REASONS = ["Không cần nữa", "Đổi khung giờ, sẽ hẹn lại", "Đã giao dịch chỗ khác", "Lý do khác"];

/** Các trạng thái mà bên này được phép chuyển đơn sang. */
export function nextSteps(order: Order, side: OrderSide): OrderStatus[] {
  if (side === "seller") {
    if (order.status === "pending") return ["accepted", "declined"];
    if (order.status === "accepted") return ["done", "cancelled"];
    return [];
  }
  return isOpen(order) ? ["cancelled"] : [];
}

export function transition(order: Order, side: OrderSide, to: OrderStatus, at: string, note?: string): Order | null {
  if (!nextSteps(order, side).includes(to)) return null;
  return { ...order, status: to, events: [...order.events, { at, status: to, by: side, ...(note ? { note } : {}) }] };
}

/** Bên mô phỏng của bản demo (người bán trong dữ liệu mẫu, người mua mẫu) */
export const isDemoParty = (id: string) => id.startsWith("demo:");
