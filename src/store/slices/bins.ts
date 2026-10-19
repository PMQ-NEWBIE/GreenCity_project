import type { Bin, BinReport, Dropoff } from "@/types/features";
import { binReportsSeed, binsSeed, dropoffsSeed } from "@/data/bins";

/** Thùng thu gom cố định, lượt bỏ đồ, báo thùng đầy — lưu toàn bộ vì vận hành sửa được cả dữ liệu mẫu. */
export interface BinsState {
  bins: Bin[];
  dropoffs: Dropoff[];
  reports: BinReport[];
}

export type BinsAction =
  | { type: "BINS_UPSERT"; bin: Bin }
  | { type: "BINS_DROPOFF_ADD"; dropoff: Dropoff }
  | { type: "BINS_DROPOFF_UPDATE"; dropoff: Dropoff }
  | { type: "BINS_REPORT_ADD"; report: BinReport }
  | { type: "BINS_REPORT_UPDATE"; report: BinReport };

/** Rỗng cho tới khi HYDRATE chạy ở trình duyệt — dữ liệu mẫu có mốc thời gian tính theo lúc mở trang. */
export const binsInitial: BinsState = { bins: [], dropoffs: [], reports: [] };

const upsert = <T extends { id: string }>(list: T[], item: T): T[] =>
  list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [item, ...list];

export function binsReducer(state: BinsState, action: BinsAction): BinsState {
  switch (action.type) {
    case "BINS_UPSERT":
      return { ...state, bins: upsert(state.bins, action.bin) };
    case "BINS_DROPOFF_ADD":
    case "BINS_DROPOFF_UPDATE":
      return { ...state, dropoffs: upsert(state.dropoffs, action.dropoff) };
    case "BINS_REPORT_ADD":
    case "BINS_REPORT_UPDATE":
      return { ...state, reports: upsert(state.reports, action.report) };
    default:
      return state;
  }
}

const hasId = (v: unknown): boolean => !!v && typeof v === "object" && typeof (v as { id?: unknown }).id === "string";

export function binsHydrate(raw: unknown): BinsState {
  const r = raw as Partial<Record<keyof BinsState, unknown>> | null;
  if (!r || !Array.isArray(r.bins)) return { bins: binsSeed(), dropoffs: dropoffsSeed(), reports: binReportsSeed() };
  return {
    bins: r.bins.filter(hasId) as Bin[],
    dropoffs: Array.isArray(r.dropoffs) ? (r.dropoffs.filter(hasId) as Dropoff[]) : [],
    reports: Array.isArray(r.reports) ? (r.reports.filter(hasId) as BinReport[]) : [],
  };
}

export function binsPersist(state: BinsState): unknown {
  return state;
}
