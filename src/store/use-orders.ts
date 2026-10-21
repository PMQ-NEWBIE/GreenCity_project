"use client";

import { useCallback, useEffect, useMemo } from "react";
import { TIME_OPTIONS, type Product } from "@/types";
import type { Order, OrderStatus } from "@/types/features";
import { isDemoParty, isOpen, transition, type OrderSide } from "@/lib/orders";
import { canBuy, marketOf } from "@/lib/market";
import { newId, useApp } from "./app-store";

export interface NewOrder {
  quantity: string;
  meetTime: string;
  note: string;
}

const byNewest = (a: Order, b: Order) => b.createdAt.localeCompare(a.createdAt);

const snapshot = (p: Product): Order["product"] => ({ name: p.name, image: p.image, price: p.price, unit: p.unit, area: p.area });

/**
 * Đơn mua bán của người đang đăng nhập.
 * - bought: đơn mình đặt (chế độ mua)
 * - incoming: đơn người khác đặt vào tin của mình (chế độ bán)
 */
export function useOrders() {
  const { state, getState, dispatch } = useApp();
  const uid = state.user?.email;
  const all = state.orders.list;
  const bought = useMemo(() => (uid ? all.filter((o) => o.buyerId === uid).sort(byNewest) : []), [all, uid]);
  const incoming = useMemo(() => (uid ? all.filter((o) => o.sellerId === uid).sort(byNewest) : []), [all, uid]);

  const sideOf = useCallback(
    (o: Order): OrderSide | null => (o.sellerId === uid ? "seller" : o.buyerId === uid ? "buyer" : null),
    [uid]
  );

  /** Đơn đang mở của chính mình cho một tin (để không đặt trùng). */
  const openFor = useCallback((productId: string) => bought.find((o) => o.productId === productId && isOpen(o)), [bought]);

  const byId = useCallback((id: string) => all.find((o) => o.id === id), [all]);

  const place = useCallback(
    (product: Product, input: NewOrder): Order | null => {
      const user = getState().user;
      if (!user || !canBuy(user.role, product)) return null;
      const now = new Date().toISOString();
      const order: Order = {
        id: newId("dh"),
        productId: product.id,
        product: snapshot(product),
        buyerId: user.email,
        buyerName: user.name,
        sellerId: `demo:${product.seller.name}`,
        sellerName: product.seller.name,
        quantity: input.quantity.trim(),
        meetTime: input.meetTime,
        note: input.note.trim(),
        createdAt: now,
        status: "pending",
        events: [{ at: now, status: "pending", by: "buyer" }],
      };
      dispatch({ type: "ORDERS_UPSERT", order });
      return order;
    },
    [getState, dispatch]
  );

  /** Chuyển trạng thái; người bán giao xong thì tin chuyển sang "đã bán". */
  const act = useCallback(
    (id: string, to: OrderStatus, note?: string): Order | null => {
      const s = getState();
      const me = s.user?.email;
      const order = s.orders.list.find((o) => o.id === id);
      const side: OrderSide | null = !order || !me ? null : order.sellerId === me ? "seller" : order.buyerId === me ? "buyer" : null;
      if (!order || !side) return null;
      const next = transition(order, side, to, new Date().toISOString(), note);
      if (!next) return null;
      dispatch({ type: "ORDERS_UPSERT", order: next });
      if (to === "done" && side === "seller") dispatch({ type: "SET_PRODUCT_STATUS", id: order.productId, status: "sold" });
      return next;
    },
    [getState, dispatch]
  );

  return { bought, incoming, sideOf, openFor, byId, place, act };
}

/* ------------------------------ Bản demo ------------------------------ */

/** Người mua mẫu: tin phế liệu có người thu mua tới đặt, tin đồ thanh lý có người dân khác đặt */
const DEMO_BUYERS = {
  scrap: ["Anh Tư Hòa (ve chai)", "Vựa phế liệu Minh Đức", "Cô Sáu Út thu mua"],
  secondhand: ["Chị Mai (Quận 3)", "Anh Bình (Gò Vấp)", "Cô Thu (Phú Nhuận)"],
};
/** Người mua mẫu ghé đặt sau chừng này mili giây kể từ lúc thấy tin trên sàn */
const DEMO_BUYER_AFTER = 15_000;
/** Người bán trong dữ liệu mẫu nhận đơn sau chừng này mili giây */
const DEMO_SELLER_AFTER = 12_000;

function demoQuantity(unit: string) {
  return unit === "kg" ? "Khoảng 10 kg" : unit === "chai" ? "Khoảng 50 chai" : unit === "lô" ? "Cả lô" : "1 món";
}

/**
 * Trình duyệt chỉ có một người dùng nên bên kia của đơn được mô phỏng:
 * - tin mình đăng: sau ít giây có một người mua mẫu đặt (mỗi tin một lần) → người bán thấy đơn đến
 * - đơn mình đặt vào tin mẫu: người bán mẫu tự nhận đơn → người mua thấy đơn chuyển bước
 * Gắn một lần trong AppShell của người dân.
 */
export function useOrderDemo() {
  const { state, getState, dispatch, toast } = useApp();
  const active = state.user?.role === "resident" || state.user?.role === "partner";

  useEffect(() => {
    if (!active) return;
    const tick = () => {
      const s = getState();
      const me = s.user;
      if (!me) return;
      const now = Date.now();
      const iso = new Date(now).toISOString();

      for (const o of s.orders.list) {
        if (o.buyerId !== me.email || !isDemoParty(o.sellerId) || o.status !== "pending") continue;
        if (now - Date.parse(o.createdAt) < DEMO_SELLER_AFTER) continue;
        dispatch({ type: "ORDERS_UPSERT", order: { ...o, status: "accepted", events: [...o.events, { at: iso, status: "accepted", by: "seller" }] } });
        toast("success", `${o.sellerName} đã nhận đơn`, o.product.name);
      }

      // Chỉ người dân có tin đăng; người thu mua chỉ là bên mua
      if (me.role !== "resident") return;
      s.products
        .filter((p) => p.isMine && p.status === "available")
        .forEach((p, i) => {
          const seen = s.orders.demoSeen[p.id];
          if (!seen) return dispatch({ type: "ORDERS_DEMO_SEEN", productId: p.id, at: iso });
          if (now - Date.parse(seen) < DEMO_BUYER_AFTER) return;
          if (s.orders.list.some((o) => o.productId === p.id && isDemoParty(o.buyerId))) return;
          const names = DEMO_BUYERS[marketOf(p.categoryId)];
          const buyer = names[i % names.length];
          const order: Order = {
            id: newId("dh"),
            productId: p.id,
            product: snapshot(p),
            buyerId: `demo:${buyer}`,
            buyerName: buyer,
            sellerId: me.email,
            sellerName: me.name,
            quantity: demoQuantity(p.unit),
            meetTime: TIME_OPTIONS[i % TIME_OPTIONS.length],
            note: "Bản demo: đây là người mua mô phỏng để bạn thử nhận đơn.",
            createdAt: iso,
            status: "pending",
            events: [{ at: iso, status: "pending", by: "buyer" }],
          };
          dispatch({ type: "ORDERS_UPSERT", order });
          toast("info", "Có đơn mới", `${buyer} muốn mua ${p.name}`);
        });
    };
    tick();
    const t = window.setInterval(tick, 4000);
    return () => window.clearInterval(t);
  }, [active, getState, dispatch, toast]);
}
