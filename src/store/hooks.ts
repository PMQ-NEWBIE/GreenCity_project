"use client";

import { useCallback, useMemo } from "react";
import { REWARDS } from "@/data/rewards";
import { balanceOf, checkRedeem, makeRedeemCode, pendingOf, REDEEM_VALID_DAYS, redemptionStatus } from "@/lib/points";
import { initialsOf } from "@/utils/format";
import { POINT_RULES } from "@/data/point-rules";
import {
  assignTeam,
  canCancel,
  cancel as cancelPickup,
  complete as completePickup,
  recordWeighing,
  startTrip,
  totalAmount,
  totalKg,
} from "@/lib/pickup";
import type { Area, DemoUser, ToastItem } from "@/types";
import type {
  NewSwapItem,
  Partner,
  PayoutMethod,
  PickupRequest,
  WeighLine,
  PointEntry,
  RedeemResult,
  Redemption,
  Reward,
  SwapItem,
  SwapStatus,
} from "@/types/features";
import { newId, useApp } from "./app-store";
import { stockLeft } from "./slices/rewards";

export function useCurrentUser(): DemoUser | null {
  return useApp().state.user;
}

export function useToast(): (kind: ToastItem["kind"], title: string, description?: string) => void {
  return useApp().toast;
}

const byNewest = <T extends { at: string }>(a: T, b: T) => b.at.localeCompare(a.at);

/** Sổ điểm của người đang đăng nhập, mới nhất trước. */
export function usePoints(): { balance: number; pending: number; entries: PointEntry[] } {
  const { state } = useApp();
  const uid = state.user?.email;
  return useMemo(() => {
    const entries = uid ? state.points.entries.filter((e) => e.userId === uid).sort(byNewest) : [];
    return { balance: balanceOf(entries), pending: pendingOf(entries), entries };
  }, [state.points.entries, uid]);
}

export function useRewards(): {
  rewards: Reward[];
  redemptions: Redemption[];
  redeem: (rewardId: string) => RedeemResult;
} {
  const { state, getState, dispatch } = useApp();
  const uid = state.user?.email;

  const rewards = useMemo(
    () => REWARDS.map((r) => ({ ...r, stock: stockLeft(r, state.rewards.redemptions) })),
    [state.rewards.redemptions]
  );

  const redemptions = useMemo(() => {
    const now = new Date();
    return state.rewards.redemptions
      .filter((r) => r.userId === uid)
      .map((r) => ({ ...r, status: redemptionStatus(r, now) }))
      .sort(byNewest);
  }, [state.rewards.redemptions, uid]);

  const redeem = useCallback(
    (rewardId: string): RedeemResult => {
      // Đọc trạng thái mới nhất (không phải bản của lần vẽ trước) để chặn bấm hai lần
      const s = getState();
      const user = s.user;
      if (!user) return { ok: false, reason: "not_logged_in" };
      const reward = REWARDS.find((r) => r.id === rewardId);
      if (!reward) return { ok: false, reason: "out_of_stock" };
      const block = checkRedeem({
        loggedIn: true,
        stockLeft: stockLeft(reward, s.rewards.redemptions),
        balance: balanceOf(s.points.entries.filter((e) => e.userId === user.email)),
        cost: reward.pointsCost,
      });
      if (block) return { ok: false, reason: block };

      const now = new Date();
      const redemption: Redemption = {
        id: newId("rd"),
        rewardId: reward.id,
        rewardName: reward.name,
        pointsSpent: reward.pointsCost,
        code: makeRedeemCode(),
        at: now.toISOString(),
        expiresAt: new Date(now.getTime() + REDEEM_VALID_DAYS * 86_400_000).toISOString(),
        status: "ready",
        userId: user.email,
      };
      const entry: PointEntry = {
        id: newId("pt"),
        at: redemption.at,
        delta: -reward.pointsCost,
        reason: "redeem",
        title: `Đổi quà · ${reward.name}`,
        status: "confirmed",
        refId: redemption.id,
        userId: user.email,
      };
      dispatch({ type: "REWARDS_REDEEM", redemption, entry });
      return { ok: true, redemption };
    },
    [getState, dispatch]
  );

  return { rewards, redemptions, redeem };
}

export function useSwap(): {
  items: SwapItem[];
  addItem: (input: NewSwapItem) => SwapItem;
  setStatus: (id: string, status: SwapStatus) => void;
  removeItem: (id: string) => void;
} {
  const { state, getState, dispatch } = useApp();
  const uid = state.user?.email;

  const items = useMemo(
    () =>
      state.swap.items
        .map((i) => ({ ...i, isMine: !!uid && i.ownerId === uid }))
        .sort((a, b) => b.postedAt.localeCompare(a.postedAt)),
    [state.swap.items, uid]
  );

  const addItem = useCallback(
    (input: NewSwapItem): SwapItem => {
      const user = getState().user;
      const name = user?.name ?? "Bạn";
      const item: SwapItem = {
        ...input,
        wants: input.giveaway ? "" : input.wants.trim(),
        id: newId("s"),
        postedAt: new Date().toISOString(),
        status: "open",
        owner: { name, initials: initialsOf(name) },
        ownerId: user?.email ?? "khach",
        isMine: true,
      };
      dispatch({ type: "SWAP_ADD", item });
      return item;
    },
    [getState, dispatch]
  );

  /** Chỉ người đăng mới đổi trạng thái hoặc xóa được đồ của mình. */
  const isOwn = useCallback(
    (id: string) => {
      const s = getState();
      const item = s.swap.items.find((i) => i.id === id);
      return !!item && !!item.ownerId && item.ownerId === (s.user?.email ?? "khach");
    },
    [getState]
  );

  const setStatus = useCallback(
    (id: string, status: SwapStatus) => {
      if (isOwn(id)) dispatch({ type: "SWAP_SET_STATUS", id, status });
    },
    [isOwn, dispatch]
  );

  const removeItem = useCallback(
    (id: string) => {
      if (isOwn(id)) dispatch({ type: "SWAP_REMOVE", id });
    },
    [isOwn, dispatch]
  );

  return { items, addItem, setStatus, removeItem };
}

/* ------------------------------ Thu gom tận nhà ------------------------------ */

export interface NewPickup {
  materials: string[];
  quantity: string;
  area: Area;
  address: string;
  time: string;
  note: string;
  photos: string[];
  presorted: boolean;
}

/** Mã người nhận đơn thu gom của một tài khoản người mua (vựa, ve chai dạo). */
export const buyerTeamId = (email: string) => `u:${email}`;

/**
 * Đơn thu gom ("gọi người tới lấy"): người dân tạo/hủy; người mua (vựa, ve chai dạo) tự nhận đơn,
 * lên đường, cân, thanh toán. Ban điều hành chỉ theo dõi. Hoàn tất thì tự cộng điểm cho người gửi theo POINT_RULES.
 */
export function useCollect() {
  const { state, getState, dispatch } = useApp();
  const uid = state.user?.email;

  const requests = useMemo(
    () => [...state.collect.requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [state.collect.requests]
  );
  const mine = useMemo(() => (uid ? requests.filter((r) => r.ownerId === uid) : []), [requests, uid]);

  const find = useCallback((id: string) => getState().collect.requests.find((r) => r.id === id), [getState]);
  const save = useCallback((request: PickupRequest) => dispatch({ type: "COLLECT_UPDATE", request }), [dispatch]);

  const create = useCallback(
    (input: NewPickup): PickupRequest => {
      const user = getState().user;
      const now = new Date().toISOString();
      const request: PickupRequest = {
        ...input,
        id: newId("r"),
        ownerId: user?.email,
        ownerName: user?.name ?? "Bạn",
        createdAt: now,
        status: "cho-nhan",
        history: [{ status: "cho-nhan", at: now }],
      };
      dispatch({ type: "COLLECT_ADD", request });
      return request;
    },
    [getState, dispatch]
  );

  const cancel = useCallback(
    (id: string, reason: string) => {
      const r = find(id);
      if (r && canCancel(r.status)) save(cancelPickup(r, reason, new Date().toISOString()));
    },
    [find, save]
  );

  const assign = useCallback(
    (id: string, team: NonNullable<PickupRequest["team"]>, appointment: string) => {
      const r = find(id);
      if (r?.status === "cho-nhan") save(assignTeam(r, team, appointment, new Date().toISOString()));
    },
    [find, save]
  );

  /** Người mua đang đăng nhập tự nhận một yêu cầu còn chờ, kèm giờ hẹn. */
  const take = useCallback(
    (id: string, appointment: string) => {
      const user = getState().user;
      const r = find(id);
      if (!user || user.role !== "partner" || r?.status !== "cho-nhan") return;
      const team = { id: buyerTeamId(user.email), name: user.name, phoneMasked: "09xx xxx xxx" };
      // Ghi vào danh bạ người mua để ban điều hành thấy ai đang làm việc ở khu nào
      if (!getState().partners.partners.some((p) => p.id === team.id))
        dispatch({
          type: "PARTNERS_UPSERT",
          partner: { id: team.id, kind: "thu-gom", name: user.name, areas: [r.area], phoneMasked: team.phoneMasked, contactName: user.name, note: "Tài khoản người mua trên Green City", active: true },
        });
      save(assignTeam(r, team, appointment, new Date().toISOString()));
    },
    [getState, find, save, dispatch]
  );

  const depart = useCallback(
    (id: string) => {
      const r = find(id);
      if (r?.status === "da-nhan") save(startTrip(r, new Date().toISOString()));
    },
    [find, save]
  );

  const weigh = useCallback(
    (id: string, lines: WeighLine[], sortedConfirmed: boolean) => {
      const r = find(id);
      if (r?.status === "dang-den") save(recordWeighing(r, lines, sortedConfirmed, new Date().toISOString()));
    },
    [find, save]
  );

  const finish = useCallback(
    (id: string, method: PayoutMethod) => {
      const r = find(id);
      if (r?.status !== "da-can") return;
      const now = new Date().toISOString();
      const { request, points } = completePickup(r, method, POINT_RULES, now);
      save(request);
      if (!r.ownerId) return; // đơn mẫu của người khác: không có sổ điểm
      const kgPoints = points.kg + points.sorted;
      if (kgPoints > 0)
        dispatch({
          type: "POINTS_ADD",
          entry: {
            id: newId("pt"),
            at: now,
            delta: kgPoints,
            reason: "home_pickup",
            title: `Thu gom tận nhà · ${totalKg(r.weighLines).toLocaleString("vi-VN")}kg${points.sorted ? ", đã phân loại" : ""}`,
            status: "confirmed",
            refId: r.id,
            userId: r.ownerId,
          },
        });
      if (points.cash > 0)
        dispatch({
          type: "POINTS_ADD",
          entry: {
            id: newId("pt"),
            at: now,
            delta: points.cash,
            reason: "home_pickup",
            title: `Quy đổi tiền ve chai · ${totalAmount(r.weighLines).toLocaleString("vi-VN")}đ`,
            status: "confirmed",
            refId: r.id,
            userId: r.ownerId,
          },
        });
    },
    [find, save, dispatch]
  );

  return { requests, mine, create, cancel, assign, take, depart, weigh, finish };
}

export function usePartners() {
  const { state, dispatch } = useApp();
  const upsert = useCallback((partner: Partner) => dispatch({ type: "PARTNERS_UPSERT", partner }), [dispatch]);
  return { partners: state.partners.partners, upsert };
}
