"use client";

import { useCallback, useMemo } from "react";
import { DEMO_RESIDENTS } from "@/data/demo-users";
import { REWARDS } from "@/data/rewards";
import { balanceOf, pendingOf, redemptionStatus } from "@/lib/points";
import type { PointEntry, Redemption } from "@/types/features";
import { newId, useApp } from "./app-store";

export interface LedgerUser {
  email: string;
  name: string;
  balance: number;
  pending: number;
  entries: PointEntry[];
}

/** Sổ điểm của mọi người dùng (A10 · Điểm thưởng) và các lần đổi quà chờ giao. */
export function useLedger() {
  const { state, getState, dispatch } = useApp();
  const me = state.user;

  const users = useMemo<LedgerUser[]>(() => {
    const byUser = new Map<string, PointEntry[]>();
    for (const e of state.points.entries) {
      if (!e.userId) continue;
      byUser.set(e.userId, [...(byUser.get(e.userId) ?? []), e]);
    }
    const nameOf = (email: string) =>
      email === me?.email ? me.name : (DEMO_RESIDENTS.find((u) => u.email === email)?.name ?? email.split("@")[0]);
    return [...byUser.entries()]
      .map(([email, entries]) => {
        const sorted = [...entries].sort((a, b) => b.at.localeCompare(a.at));
        return { email, name: nameOf(email), balance: balanceOf(sorted), pending: pendingOf(sorted), entries: sorted };
      })
      .sort((a, b) => a.name.localeCompare(b.name, "vi"));
  }, [state.points.entries, me]);

  /** Chỉnh điểm tay — bắt buộc có lý do, ghi thành mục "Điều chỉnh" đã ghi nhận. */
  const adjust = useCallback(
    (email: string, delta: number, reason: string) => {
      if (!delta || !reason.trim()) return;
      dispatch({
        type: "POINTS_ADD",
        entry: {
          id: newId("pt"),
          at: new Date().toISOString(),
          delta,
          reason: "admin_adjust",
          title: `Điều chỉnh bởi ${getState().user?.name ?? "vận hành"}`,
          note: reason.trim(),
          status: "confirmed",
          userId: email,
        },
      });
    },
    [dispatch, getState]
  );

  const redemptions = useMemo<Redemption[]>(() => {
    const now = new Date();
    return state.rewards.redemptions
      .map((r) => ({ ...r, status: redemptionStatus(r, now) }))
      .sort((a, b) => b.at.localeCompare(a.at));
  }, [state.rewards.redemptions]);

  const markCollected = useCallback(
    (id: string) => dispatch({ type: "REWARDS_SET_STATUS", id, status: "collected" }),
    [dispatch]
  );

  const partnerOf = (rewardId: string) => REWARDS.find((r) => r.id === rewardId)?.partnerName ?? "";

  return { users, adjust, redemptions, markCollected, partnerOf };
}
