import type { SwapItem, SwapStatus } from "@/types/features";
import { swapSeed } from "@/data/swap-seed";

/** Đồ trao đổi: dữ liệu mẫu (tạo lại mỗi lần mở trang) + đồ người dùng tự đăng (được lưu). */
export interface SwapState {
  items: SwapItem[];
}

export type SwapAction =
  | { type: "SWAP_ADD"; item: SwapItem }
  | { type: "SWAP_SET_STATUS"; id: string; status: SwapStatus }
  | { type: "SWAP_REMOVE"; id: string };

/** Rỗng cho tới khi HYDRATE chạy ở trình duyệt — dữ liệu mẫu có mốc thời gian tính theo lúc mở trang. */
export const swapInitial: SwapState = { items: [] };

export function swapReducer(state: SwapState, action: SwapAction): SwapState {
  switch (action.type) {
    case "SWAP_ADD":
      return { items: [action.item, ...state.items] };
    case "SWAP_SET_STATUS":
      return { items: state.items.map((i) => (i.id === action.id ? { ...i, status: action.status } : i)) };
    case "SWAP_REMOVE":
      return { items: state.items.filter((i) => i.id !== action.id) };
    default:
      return state;
  }
}

function isSwapItem(v: unknown): v is SwapItem {
  if (!v || typeof v !== "object") return false;
  const i = v as Record<string, unknown>;
  return typeof i.id === "string" && typeof i.title === "string" && typeof i.ownerId === "string";
}

export function swapHydrate(raw: unknown): SwapState {
  const list = (raw as { items?: unknown } | null)?.items;
  const mine = Array.isArray(list) ? list.filter(isSwapItem) : [];
  return { items: [...mine, ...swapSeed()] };
}

/** Chỉ lưu đồ có người đăng là người dùng thật (ownerId); đồ mẫu tạo lại khi tải trang. */
export function swapPersist(state: SwapState): unknown {
  return { items: state.items.filter((i) => i.ownerId) };
}
