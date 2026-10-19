import type { LitterReport } from "@/types/features";
import { litterSeed } from "@/data/litter";

/** Báo cáo điểm rác tự phát của mọi người — lưu toàn bộ vì cộng tác viên đổi trạng thái cả báo cáo mẫu. */
export interface LitterState {
  reports: LitterReport[];
}

export type LitterAction = { type: "LITTER_UPSERT"; report: LitterReport };

/** Rỗng cho tới khi HYDRATE chạy ở trình duyệt — báo cáo mẫu có mốc thời gian tính theo lúc mở trang. */
export const litterInitial: LitterState = { reports: [] };

export function litterReducer(state: LitterState, action: LitterAction): LitterState {
  switch (action.type) {
    case "LITTER_UPSERT": {
      const r = action.report;
      return {
        reports: state.reports.some((x) => x.id === r.id)
          ? state.reports.map((x) => (x.id === r.id ? r : x))
          : [r, ...state.reports],
      };
    }
    default:
      return state;
  }
}

export function litterHydrate(raw: unknown): LitterState {
  const list = (raw as { reports?: unknown } | null)?.reports;
  if (!Array.isArray(list)) return { reports: litterSeed() };
  return {
    reports: list.filter((v) => !!v && typeof v === "object" && typeof (v as { id?: unknown }).id === "string") as LitterReport[],
  };
}

export function litterPersist(state: LitterState): unknown {
  return state;
}
