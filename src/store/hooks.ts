"use client";

import { useCallback, useMemo } from "react";
import { REWARDS } from "@/data/rewards";
import { balanceOf, checkRedeem, makeRedeemCode, pendingOf, REDEEM_VALID_DAYS, redemptionStatus } from "@/lib/points";
import { initialsOf } from "@/utils/format";
import type { DemoUser, ToastItem } from "@/types";
import type {
  NewSwapItem,
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
