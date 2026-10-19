import type { MaterialLot } from "@/types/features";
import { lotsSeed } from "@/data/lots";

/** Lô vật liệu đã kiểm định (A7). Lưu toàn bộ vì vận hành và doanh nghiệp đổi được cả lô mẫu. */
export interface LotsState {
  lots: MaterialLot[];
}

export type LotsAction = { type: "LOTS_UPSERT"; lot: MaterialLot };

/** Rỗng cho tới khi HYDRATE chạy ở trình duyệt — lô mẫu có mốc thời gian tính theo lúc mở trang. */
export const lotsInitial: LotsState = { lots: [] };

export function lotsReducer(state: LotsState, action: LotsAction): LotsState {
  switch (action.type) {
    case "LOTS_UPSERT": {
      const l = action.lot;
      return { lots: state.lots.some((x) => x.id === l.id) ? state.lots.map((x) => (x.id === l.id ? l : x)) : [l, ...state.lots] };
    }
    default:
      return state;
  }
}

export function lotsHydrate(raw: unknown): LotsState {
  const list = (raw as { lots?: unknown } | null)?.lots;
  if (!Array.isArray(list)) return { lots: lotsSeed() };
  return { lots: list.filter((v) => !!v && typeof v === "object" && typeof (v as { id?: unknown }).id === "string") as MaterialLot[] };
}

export function lotsPersist(state: LotsState): unknown {
  return state;
}
