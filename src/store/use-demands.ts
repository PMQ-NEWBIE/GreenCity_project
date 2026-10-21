"use client";

import { useCallback, useEffect, useMemo } from "react";
import type { Area } from "@/types";
import type { DemandOffer, DemandOfferStatus, PurchaseDemand } from "@/types/features";
import { newId, useApp } from "./app-store";

export interface NewDemand {
  material: string;
  kg: number;
  pricePerKg: number;
  area: Area | null;
  note: string;
}

export interface NewOffer {
  kg: number;
  pricePerKg: number;
  note: string;
}

const byNewest = (a: PurchaseDemand, b: PurchaseDemand) => b.createdAt.localeCompare(a.createdAt);

/**
 * Nhu cầu thu mua: doanh nghiệp đăng → vựa (người thu mua) và điểm thu gom (cộng tác viên) chào hàng
 * → doanh nghiệp nhận / từ chối từng lời chào, gom đủ thì đóng nhu cầu.
 */
export function useDemands() {
  const { state, getState, dispatch } = useApp();
  const uid = state.user?.email;
  const all = useMemo(() => [...state.demands.list].sort(byNewest), [state.demands.list]);
  const open = useMemo(() => all.filter((d) => d.status === "dang-mua"), [all]);
  const mine = useMemo(() => (uid ? all.filter((d) => d.businessId === uid) : []), [all, uid]);
  /** Lời chào của mình (vựa / điểm thu gom) kèm nhu cầu tương ứng */
  const myOffers = useMemo(
    () => (uid ? all.flatMap((d) => d.offers.filter((o) => o.fromId === uid).map((o) => ({ demand: d, offer: o }))) : []),
    [all, uid]
  );

  const find = useCallback((id: string) => getState().demands.list.find((d) => d.id === id), [getState]);
  const save = useCallback((demand: PurchaseDemand) => dispatch({ type: "DEMANDS_UPSERT", demand }), [dispatch]);

  const post = useCallback(
    (input: NewDemand): PurchaseDemand | null => {
      const user = getState().user;
      if (!user || user.role !== "business") return null;
      const demand: PurchaseDemand = {
        ...input,
        id: newId("nc"),
        businessId: user.email,
        businessName: user.name,
        note: input.note.trim(),
        createdAt: new Date().toISOString(),
        status: "dang-mua",
        offers: [],
      };
      save(demand);
      return demand;
    },
    [getState, save]
  );

  const offer = useCallback(
    (demandId: string, input: NewOffer): DemandOffer | null => {
      const user = getState().user;
      const d = find(demandId);
      if (!user || !d || d.status !== "dang-mua" || (user.role !== "partner" && user.role !== "collaborator")) return null;
      const o: DemandOffer = {
        ...input,
        id: newId("ch"),
        fromId: user.email,
        fromName: user.name,
        fromKind: user.role === "collaborator" ? "diem-thu-gom" : "vua",
        note: input.note.trim(),
        at: new Date().toISOString(),
        status: "cho",
      };
      save({ ...d, offers: [...d.offers, o] });
      return o;
    },
    [getState, find, save]
  );

  /** Doanh nghiệp nhận hoặc từ chối một lời chào hàng */
  const decide = useCallback(
    (demandId: string, offerId: string, status: Exclude<DemandOfferStatus, "cho">) => {
      const d = find(demandId);
      if (!d || d.businessId !== getState().user?.email) return;
      save({ ...d, offers: d.offers.map((o) => (o.id === offerId && o.status === "cho" ? { ...o, status } : o)) });
    },
    [find, getState, save]
  );

  /** Gom đủ hàng → đóng nhu cầu, không nhận chào hàng nữa */
  const close = useCallback(
    (demandId: string) => {
      const d = find(demandId);
      if (d && d.businessId === getState().user?.email) save({ ...d, status: "da-du" });
    },
    [find, getState, save]
  );

  return { all, open, mine, myOffers, post, offer, decide, close };
}

/* ------------------------------ Bản demo ------------------------------ */

const DEMO_SELLERS: { name: string; kind: DemandOffer["fromKind"] }[] = [
  { name: "Vựa Minh Đức", kind: "vua" },
  { name: "Điểm thu gom chợ Gò Vấp", kind: "diem-thu-gom" },
];
/** Một vựa mẫu chào hàng vào nhu cầu doanh nghiệp vừa đăng sau chừng này mili giây */
const DEMO_OFFER_AFTER = 15_000;
/** Doanh nghiệp mẫu trả lời lời chào của mình sau chừng này mili giây */
const DEMO_REPLY_AFTER = 12_000;

/**
 * Bên kia của nhu cầu thu mua được mô phỏng (trình duyệt chỉ có một người dùng):
 * - doanh nghiệp đăng nhu cầu → sau ít giây có vựa / điểm thu gom mẫu chào hàng
 * - vựa / điểm thu gom chào vào nhu cầu mẫu → doanh nghiệp mẫu nhận lời chào
 * Gắn một lần trong khung khu làm việc.
 */
export function useDemandDemo() {
  const { state, getState, dispatch, toast } = useApp();
  const role = state.user?.role;
  const active = role === "business" || role === "partner" || role === "collaborator";

  useEffect(() => {
    if (!active) return;
    const tick = () => {
      const s = getState();
      const me = s.user;
      if (!me) return;
      const now = Date.now();
      const iso = new Date(now).toISOString();
      s.demands.list.forEach((d, i) => {
        if (me.role === "business" && d.businessId === me.email && d.status === "dang-mua" && d.offers.length === 0) {
          if (now - Date.parse(d.createdAt) < DEMO_OFFER_AFTER) return;
          const seller = DEMO_SELLERS[i % DEMO_SELLERS.length];
          const o: DemandOffer = {
            id: newId("ch"),
            fromId: `demo:${seller.name}`,
            fromName: seller.name,
            fromKind: seller.kind,
            kg: Math.min(d.kg, Math.round(d.kg * 0.4)),
            pricePerKg: d.pricePerKg,
            note: "Bản demo: lời chào hàng mô phỏng để bạn thử nhận / từ chối.",
            at: iso,
            status: "cho",
          };
          dispatch({ type: "DEMANDS_UPSERT", demand: { ...d, offers: [...d.offers, o] } });
          toast("info", "Có chào hàng mới", `${seller.name} chào ${o.kg}kg ${d.material.toLowerCase()}`);
          return;
        }
        if (me.role !== "business" && d.businessId.startsWith("demo:")) {
          const waiting = d.offers.filter((o) => o.fromId === me.email && o.status === "cho" && now - Date.parse(o.at) >= DEMO_REPLY_AFTER);
          if (waiting.length === 0) return;
          dispatch({
            type: "DEMANDS_UPSERT",
            demand: { ...d, offers: d.offers.map((o) => (waiting.includes(o) ? { ...o, status: "nhan" } : o)) },
          });
          toast("success", `${d.businessName} đã nhận lời chào`, `${d.material} · hẹn xe tới lấy`);
        }
      });
    };
    tick();
    const t = window.setInterval(tick, 4000);
    return () => window.clearInterval(t);
  }, [active, getState, dispatch, toast]);
}
