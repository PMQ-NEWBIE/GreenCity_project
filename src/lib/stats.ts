/**
 * Thống kê môi trường (A9): gộp lịch sử minh họa với số liệu thật trong trình duyệt.
 * Hàm thuần, chỉ import kiểu — test được bằng node --test.
 */
import type { Dropoff, LitterReport, PickupRequest } from "@/types/features";

export type MaterialGroup = "Giấy" | "Nhựa" | "Kim loại" | "Thủy tinh" | "Khác";
export const MATERIAL_GROUPS: MaterialGroup[] = ["Giấy", "Nhựa", "Kim loại", "Thủy tinh", "Khác"];

/** Một dòng số liệu theo tháng × quận × nhóm vật liệu. */
export interface StatRow {
  month: string; // "2026-10"
  area: string;
  group: MaterialGroup;
  kg: number;
  /** Lượt bỏ thùng đạt / không đạt (chỉ ghi ở nhóm "Khác" để không đếm trùng) */
  dropOk: number;
  dropBad: number;
  /** Điểm rác đã dọn và tổng số giờ từ lúc báo tới lúc dọn */
  litterDone: number;
  litterHours: number;
}

export function materialGroup(material: string): MaterialGroup {
  const m = material.toLowerCase();
  if (m.includes("giấy") || m.includes("carton") || m.includes("báo")) return "Giấy";
  if (m.includes("nhựa") || m.includes("pet")) return "Nhựa";
  if (m.includes("lon") || m.includes("sắt") || m.includes("kim loại") || m.includes("nhôm")) return "Kim loại";
  if (m.includes("thủy tinh")) return "Thủy tinh";
  return "Khác";
}

export function monthKey(iso: string | Date): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** n tháng gần nhất tính tới tháng của `now`, cũ trước. */
export function lastMonths(now: Date, n: number): string[] {
  return Array.from({ length: n }, (_, i) => monthKey(new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1)));
}

const empty = (month: string, area: string, group: MaterialGroup): StatRow => ({ month, area, group, kg: 0, dropOk: 0, dropBad: 0, litterDone: 0, litterHours: 0 });

/** Số liệu thật trong trình duyệt → dòng thống kê (đơn đã hoàn tất, lượt bỏ thùng đã kiểm, điểm rác đã dọn). */
export function liveRows(
  pickups: readonly PickupRequest[],
  dropoffs: readonly Dropoff[],
  litter: readonly LitterReport[],
  areaOfBin: (binId: string) => string
): StatRow[] {
  const rows: StatRow[] = [];
  for (const p of pickups) {
    if (p.status !== "hoan-tat" || !p.weighLines) continue;
    const at = p.history.find((h) => h.status === "hoan-tat")?.at ?? p.createdAt;
    for (const l of p.weighLines) rows.push({ ...empty(monthKey(at), p.area, materialGroup(l.material)), kg: l.kg });
  }
  for (const d of dropoffs) {
    if (d.status === "cho-kiem-tra") continue;
    const r = empty(monthKey(d.reviewedAt ?? d.at), areaOfBin(d.binId), "Khác");
    if (d.status === "dat") {
      r.dropOk = 1;
      rows.push({ ...empty(r.month, r.area, materialGroup(d.material)), kg: d.actualKg ?? d.estKg });
    } else r.dropBad = 1;
    rows.push(r);
  }
  for (const l of litter) {
    if (l.status !== "da-don" || !l.cleanedAt) continue;
    const hours = (new Date(l.cleanedAt).getTime() - new Date(l.at).getTime()) / 3_600_000;
    rows.push({ ...empty(monthKey(l.cleanedAt), l.area, "Khác"), litterDone: 1, litterHours: Math.max(0, hours) });
  }
  return rows;
}

export interface StatSummary {
  totalKg: number;
  byMonth: { month: string; kg: number }[];
  byGroup: { group: MaterialGroup; kg: number }[];
  byArea: { area: string; kg: number }[];
  /** null khi chưa có lượt kiểm nào */
  dropOkRate: number | null;
  dropChecked: number;
  litterDone: number;
  /** Giờ trung bình từ lúc báo tới lúc dọn; null khi chưa dọn điểm nào */
  litterAvgHours: number | null;
}

export function summarize(rows: readonly StatRow[], months: readonly string[], area: string | "all"): StatSummary {
  const inScope = rows.filter((r) => months.includes(r.month) && (area === "all" || r.area === area));
  const sum = <K extends string>(keyOf: (r: StatRow) => K, keys: readonly K[]) => {
    const m = new Map<K, number>(keys.map((k) => [k, 0]));
    for (const r of inScope) m.set(keyOf(r), (m.get(keyOf(r)) ?? 0) + r.kg);
    return m;
  };
  const byMonth = sum((r) => r.month, months);
  const byGroup = sum((r) => r.group, MATERIAL_GROUPS);
  const areaMap = new Map<string, number>();
  for (const r of rows.filter((r) => months.includes(r.month))) areaMap.set(r.area, (areaMap.get(r.area) ?? 0) + r.kg);
  const ok = inScope.reduce((n, r) => n + r.dropOk, 0);
  const bad = inScope.reduce((n, r) => n + r.dropBad, 0);
  const done = inScope.reduce((n, r) => n + r.litterDone, 0);
  const hours = inScope.reduce((n, r) => n + r.litterHours, 0);
  const round = (n: number) => Math.round(n * 10) / 10;
  return {
    totalKg: round([...byMonth.values()].reduce((a, b) => a + b, 0)),
    byMonth: months.map((m) => ({ month: m, kg: round(byMonth.get(m) ?? 0) })),
    byGroup: MATERIAL_GROUPS.map((g) => ({ group: g, kg: round(byGroup.get(g) ?? 0) })).sort((a, b) => b.kg - a.kg),
    byArea: [...areaMap.entries()].map(([a, kg]) => ({ area: a, kg: round(kg) })).sort((a, b) => b.kg - a.kg),
    dropOkRate: ok + bad > 0 ? ok / (ok + bad) : null,
    dropChecked: ok + bad,
    litterDone: done,
    litterAvgHours: done > 0 ? round(hours / done) : null,
  };
}

/** Bảng → CSV (dấu phẩy, có BOM để Excel đọc đúng tiếng Việt). */
export function toCsv(header: readonly string[], rows: readonly (readonly (string | number)[])[]): string {
  const cell = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "﻿" + [header, ...rows].map((r) => r.map(cell).join(",")).join("\n");
}
