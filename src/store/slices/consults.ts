import type { ConsultTicket } from "@/types/features";
import { consultsSeed } from "@/data/consults";

/** Câu hỏi tư vấn phân loại (A8). */
export interface ConsultsState {
  tickets: ConsultTicket[];
}

export type ConsultsAction = { type: "CONSULTS_UPSERT"; ticket: ConsultTicket };

/** Rỗng cho tới khi HYDRATE chạy ở trình duyệt — câu hỏi mẫu có mốc thời gian tính theo lúc mở trang. */
export const consultsInitial: ConsultsState = { tickets: [] };

export function consultsReducer(state: ConsultsState, action: ConsultsAction): ConsultsState {
  switch (action.type) {
    case "CONSULTS_UPSERT": {
      const t = action.ticket;
      return { tickets: state.tickets.some((x) => x.id === t.id) ? state.tickets.map((x) => (x.id === t.id ? t : x)) : [t, ...state.tickets] };
    }
    default:
      return state;
  }
}

export function consultsHydrate(raw: unknown): ConsultsState {
  const list = (raw as { tickets?: unknown } | null)?.tickets;
  if (!Array.isArray(list)) return { tickets: consultsSeed() };
  return { tickets: list.filter((v) => !!v && typeof v === "object" && typeof (v as { id?: unknown }).id === "string") as ConsultTicket[] };
}

export function consultsPersist(state: ConsultsState): unknown {
  return state;
}
