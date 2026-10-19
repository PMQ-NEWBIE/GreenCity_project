import type { PointEntry } from "@/types/features";
import { applyDecision } from "@/lib/points";

/** Sổ điểm của mọi người dùng trong trình duyệt này (lọc theo userId khi đọc). */
export interface PointsState {
  entries: PointEntry[];
}

export type PointsAction =
  | { type: "POINTS_ADD"; entry: PointEntry }
  | { type: "POINTS_DECIDE"; id: string; decision: "confirmed" | "rejected"; delta?: number; note?: string };

export const pointsInitial: PointsState = { entries: [] };

export function pointsReducer(state: PointsState, action: PointsAction): PointsState {
  switch (action.type) {
    case "POINTS_ADD":
      return state.entries.some((e) => e.id === action.entry.id) ? state : { entries: [action.entry, ...state.entries] };
    case "POINTS_DECIDE":
      return {
        entries: state.entries.map((e) =>
          e.id === action.id ? applyDecision(e, action.decision, { delta: action.delta, note: action.note }) : e
        ),
      };
    default:
      return state;
  }
}

function isEntry(v: unknown): v is PointEntry {
  if (!v || typeof v !== "object") return false;
  const e = v as Record<string, unknown>;
  return typeof e.id === "string" && typeof e.at === "string" && typeof e.delta === "number" && typeof e.reason === "string";
}

export function pointsHydrate(raw: unknown): PointsState {
  const list = (raw as { entries?: unknown } | null)?.entries;
  return { entries: Array.isArray(list) ? list.filter(isEntry) : [] };
}

export function pointsPersist(state: PointsState): unknown {
  return { entries: state.entries };
}
