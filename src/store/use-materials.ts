"use client";

import { useCallback, useMemo } from "react";
import { LOT_IMAGE } from "@/data/lots";
import { checkReserve, holdExpiresAt, withEffectiveStatus, type ReserveBlock } from "@/lib/materials";
import type { Area } from "@/types";
import type { LotGrade, MaterialLot } from "@/types/features";
import { newId, useApp } from "./app-store";

export interface NewLot {
  material: string;
  weightKg: number;
  pricePerKg: number;
  grade: LotGrade;
  purity: number;
  moisture: number;
  warehouse: string;
  area: Area;
  note: string;
}

/**
 * Chợ lô vật liệu: vựa (người thu mua) và điểm thu gom (cộng tác viên) đăng lô đã gom đủ số lượng;
 * doanh nghiệp đặt giữ 48 giờ; người đăng lô chốt bán hoặc bỏ giữ. Ban điều hành chỉ theo dõi.
 * Hạn giữ tính lúc đọc: quá 48 giờ chưa chốt thì lô tự về "đang bán".
 */
export function useMaterials() {
  const { state, getState, dispatch } = useApp();
  const uid = state.user?.email;

  const lots = useMemo(() => {
    const now = new Date();
    return state.lots.lots.map((l) => withEffectiveStatus(l, now));
  }, [state.lots.lots]);
  const myHolds = useMemo(() => lots.filter((l) => l.status === "dang-giu" && l.reservation?.businessId === uid), [lots, uid]);
  /** Lô do chính tài khoản này đăng (vựa / điểm thu gom) */
  const myLots = useMemo(() => lots.filter((l) => !!uid && l.sellerId === uid), [lots, uid]);

  const current = useCallback(
    (id: string) => {
      const l = getState().lots.lots.find((x) => x.id === id);
      return l ? withEffectiveStatus(l, new Date()) : undefined;
    },
    [getState]
  );
  const save = useCallback((lot: MaterialLot) => dispatch({ type: "LOTS_UPSERT", lot }), [dispatch]);

  const reserve = useCallback(
    (id: string, pickupAt: Date, note: string): ReserveBlock | null => {
      const lot = current(id);
      const user = getState().user;
      if (!lot || !user) return "not_available";
      const now = new Date();
      const block = checkReserve(lot, pickupAt, now);
      if (block) return block;
      save({
        ...lot,
        status: "dang-giu",
        reservation: {
          businessId: user.email,
          businessName: user.name,
          at: now.toISOString(),
          expiresAt: holdExpiresAt(now),
          pickupAt: pickupAt.toISOString(),
          note: note.trim(),
        },
      });
      return null;
    },
    [current, getState, save]
  );

  /** Doanh nghiệp tự bỏ giữ, hoặc vận hành bỏ giữ giúp. */
  const release = useCallback(
    (id: string) => {
      const lot = current(id);
      if (lot?.status === "dang-giu") save({ ...lot, status: "san-sang", reservation: undefined });
    },
    [current, save]
  );

  const markSold = useCallback(
    (id: string) => {
      const lot = current(id);
      if (lot?.status !== "dang-giu" || !lot.reservation) return;
      save({ ...lot, status: "da-ban", soldAt: new Date().toISOString(), soldTo: lot.reservation.businessName, reservation: undefined });
    },
    [current, save]
  );

  const createLot = useCallback(
    (input: NewLot): MaterialLot => {
      const now = new Date();
      const user = getState().user;
      const seq = String(getState().lots.lots.length + 1).padStart(2, "0");
      const lot: MaterialLot = {
        ...input,
        id: newId("lo"),
        code: `LO-${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${seq}`,
        inspector: user?.name ?? "Ban điều hành",
        sellerId: user?.email,
        sellerName: user?.name,
        sellerKind: user?.role === "collaborator" ? "diem-thu-gom" : "vua",
        inspectedAt: now.toISOString(),
        image: LOT_IMAGE[input.material] ?? "",
        status: "san-sang",
      };
      save(lot);
      return lot;
    },
    [getState, save]
  );

  return { lots, myHolds, myLots, reserve, release, markSold, createLot };
}
