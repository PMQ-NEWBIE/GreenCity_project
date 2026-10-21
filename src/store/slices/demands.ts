import type { PurchaseDemand } from "@/types/features";
import { demandsSeed } from "@/data/demands";

/** Nhu cầu thu mua của doanh nghiệp và các lời chào hàng của vựa / điểm thu gom. */
export interface DemandsState {
  list: PurchaseDemand[];
}

export type DemandsAction = { type: "DEMANDS_UPSERT"; demand: PurchaseDemand };

/** Rỗng cho tới khi HYDRATE chạy ở trình duyệt — dữ liệu mẫu có mốc thời gian tính theo lúc mở trang. */
export const demandsInitial: DemandsState = { list: [] };

export function demandsReducer(state: DemandsState, action: DemandsAction): DemandsState {
  switch (action.type) {
    case "DEMANDS_UPSERT": {
      const d = action.demand;
      return { list: state.list.some((x) => x.id === d.id) ? state.list.map((x) => (x.id === d.id ? d : x)) : [d, ...state.list] };
    }
    default:
      return state;
  }
}

function isDemand(v: unknown): v is PurchaseDemand {
  if (!v || typeof v !== "object") return false;
  const d = v as Record<string, unknown>;
  return typeof d.id === "string" && typeof d.material === "string" && Array.isArray(d.offers);
}

/** Lưu toàn bộ (cả nhu cầu mẫu, vì người dùng chào hàng vào đó); lần đầu chưa có thì nạp dữ liệu mẫu. */
export function demandsHydrate(raw: unknown): DemandsState {
  const list = (raw as { list?: unknown } | null)?.list;
  return { list: Array.isArray(list) ? list.filter(isDemand) : demandsSeed() };
}

export function demandsPersist(state: DemandsState): unknown {
  return state;
}
