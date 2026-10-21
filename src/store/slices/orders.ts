import type { Order } from "@/types/features";

/**
 * Đơn mua bán giữa người dân với nhau.
 * demoSeen: mốc người dùng đăng từng tin (id tin → thời điểm) — bản demo dùng để mô phỏng một người mua
 * tới đặt sau ít giây, cho người bán thấy đơn đến mà không cần tài khoản thứ hai.
 */
export interface OrdersState {
  list: Order[];
  demoSeen: Record<string, string>;
}

export type OrdersAction =
  | { type: "ORDERS_UPSERT"; order: Order }
  | { type: "ORDERS_DEMO_SEEN"; productId: string; at: string };

export const ordersInitial: OrdersState = { list: [], demoSeen: {} };

export function ordersReducer(state: OrdersState, action: OrdersAction): OrdersState {
  switch (action.type) {
    case "ORDERS_UPSERT": {
      const o = action.order;
      return {
        ...state,
        list: state.list.some((x) => x.id === o.id) ? state.list.map((x) => (x.id === o.id ? o : x)) : [o, ...state.list],
      };
    }
    case "ORDERS_DEMO_SEEN":
      return state.demoSeen[action.productId] ? state : { ...state, demoSeen: { ...state.demoSeen, [action.productId]: action.at } };
    default:
      return state;
  }
}

function isOrder(v: unknown): v is Order {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return typeof o.id === "string" && typeof o.productId === "string" && typeof o.buyerId === "string" && Array.isArray(o.events);
}

export function ordersHydrate(raw: unknown): OrdersState {
  const r = (raw ?? {}) as { list?: unknown; demoSeen?: unknown };
  const seen = r.demoSeen && typeof r.demoSeen === "object" ? (r.demoSeen as Record<string, string>) : {};
  return { list: Array.isArray(r.list) ? r.list.filter(isOrder) : [], demoSeen: seen };
}

export function ordersPersist(state: OrdersState): unknown {
  return state;
}
