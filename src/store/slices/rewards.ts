import type { Redemption, Reward } from "@/types/features";

/**
 * Lịch sử đổi quà. Tồn kho không lưu riêng: còn lại = REWARDS[i].stock − số lần đã đổi,
 * nên dữ liệu không bao giờ lệch nhau.
 */
export interface RewardsState {
  redemptions: Redemption[];
}

export type RewardsAction = { type: "REWARDS_SET_STATUS"; id: string; status: Redemption["status"] };

export const rewardsInitial: RewardsState = { redemptions: [] };

export function rewardsReducer(state: RewardsState, action: RewardsAction): RewardsState {
  switch (action.type) {
    case "REWARDS_SET_STATUS":
      return { redemptions: state.redemptions.map((r) => (r.id === action.id ? { ...r, status: action.status } : r)) };
    default:
      return state;
  }
}

export function stockLeft(reward: Reward, redemptions: readonly Redemption[]): number {
  return Math.max(0, reward.stock - redemptions.filter((r) => r.rewardId === reward.id).length);
}

function isRedemption(v: unknown): v is Redemption {
  if (!v || typeof v !== "object") return false;
  const r = v as Record<string, unknown>;
  return typeof r.id === "string" && typeof r.rewardId === "string" && typeof r.code === "string";
}

export function rewardsHydrate(raw: unknown): RewardsState {
  const list = (raw as { redemptions?: unknown } | null)?.redemptions;
  return { redemptions: Array.isArray(list) ? list.filter(isRedemption) : [] };
}

export function rewardsPersist(state: RewardsState): unknown {
  return { redemptions: state.redemptions };
}
