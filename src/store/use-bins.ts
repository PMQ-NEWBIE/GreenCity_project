"use client";

import { useCallback, useMemo } from "react";
import { POINT_RULES } from "@/data/point-rules";
import { dropoffPoints, fullReportCapped, openReportFor, pendingEntryIds, raiseLevel } from "@/lib/bins";
import type { Bin, BinReport, Dropoff } from "@/types/features";
import { newId, useApp } from "./app-store";

export interface NewDropoff {
  binId: string;
  material: string;
  estKg: number;
  photos: string[];
}

/**
 * Thùng thu gom cố định (A3) và báo thùng đầy (A5).
 * Người dân: ghi nhận bỏ đồ, báo thùng đầy → điểm "chờ xác minh".
 * Cộng tác viên/vận hành: duyệt lượt bỏ đồ, xác nhận báo đầy, đổ thùng → điểm được ghi nhận hoặc bị bác.
 */
export function useBins() {
  const { state, getState, dispatch } = useApp();
  const uid = state.user?.email;
  const { bins, dropoffs, reports } = state.bins;

  const sortedDropoffs = useMemo(() => [...dropoffs].sort((a, b) => b.at.localeCompare(a.at)), [dropoffs]);
  const sortedReports = useMemo(() => [...reports].sort((a, b) => b.at.localeCompare(a.at)), [reports]);
  const myDropoffs = useMemo(() => (uid ? sortedDropoffs.filter((d) => d.userId === uid) : []), [sortedDropoffs, uid]);
  const myReports = useMemo(() => (uid ? sortedReports.filter((r) => r.userId === uid) : []), [sortedReports, uid]);

  const findBin = useCallback((id: string) => getState().bins.bins.find((b) => b.id === id), [getState]);
  const findByCode = useCallback(
    (code: string) => getState().bins.bins.find((b) => b.code.toLowerCase() === code.trim().toLowerCase()),
    [getState]
  );

  /** Mục điểm chờ/được duyệt — gắn refId để duyệt hoặc bác sau này. */
  const addPending = useCallback(
    (refId: string, delta: number, reason: "bin_dropoff" | "bin_full_report", title: string, userId: string | undefined, now: string) => {
      if (!userId || delta <= 0) return undefined;
      const id = newId("pt");
      dispatch({ type: "POINTS_ADD", entry: { id, at: now, delta, reason, title, status: "pending", refId, userId } });
      return id;
    },
    [dispatch]
  );

  const recordDropoff = useCallback(
    (input: NewDropoff): Dropoff | null => {
      const s = getState();
      const bin = s.bins.bins.find((b) => b.id === input.binId);
      if (!bin) return null;
      const now = new Date();
      const { points, capped } = dropoffPoints(bin.type, input.estKg, POINT_RULES, {
        dropoffs: s.bins.dropoffs,
        userId: s.user?.email,
        now,
      });
      const dropoff: Dropoff = {
        id: newId("do"),
        binId: bin.id,
        binCode: bin.code,
        binType: bin.type,
        userId: s.user?.email,
        userName: s.user?.name ?? "Khách",
        material: input.material,
        estKg: input.estKg,
        photos: input.photos,
        at: now.toISOString(),
        status: "cho-kiem-tra",
        points,
        capped,
      };
      dropoff.pointsEntryId = addPending(dropoff.id, points, "bin_dropoff", `Bỏ đồ vào thùng ${bin.code} · ${input.material}`, dropoff.userId, dropoff.at);
      dispatch({ type: "BINS_DROPOFF_ADD", dropoff });
      return dropoff;
    },
    [getState, dispatch, addPending]
  );

  const reviewDropoff = useCallback(
    (id: string, decision: "dat" | "khong-dat", opts: { actualKg?: number; reason?: string } = {}) => {
      const s = getState();
      const d = s.bins.dropoffs.find((x) => x.id === id);
      if (!d || d.status !== "cho-kiem-tra") return;
      const now = new Date();
      let points = d.points;
      if (decision === "dat" && !d.capped && opts.actualKg != null) {
        // Khối lượng kiểm lại → tính lại điểm (quy tắc theo kg)
        points = dropoffPoints(d.binType, opts.actualKg, POINT_RULES, { dropoffs: [], userId: d.userId, now }).points;
      }
      const updated: Dropoff = {
        ...d,
        status: decision,
        points: decision === "dat" ? points : 0,
        reviewedAt: now.toISOString(),
        reviewer: s.user?.name ?? "Cộng tác viên",
        actualKg: decision === "dat" ? (opts.actualKg ?? d.estKg) : undefined,
        rejectReason: decision === "khong-dat" ? opts.reason : undefined,
      };
      dispatch({ type: "BINS_DROPOFF_UPDATE", dropoff: updated });
      if (d.pointsEntryId)
        dispatch({
          type: "POINTS_DECIDE",
          id: d.pointsEntryId,
          decision: decision === "dat" ? "confirmed" : "rejected",
          delta: decision === "dat" ? points : undefined,
          note: decision === "khong-dat" ? opts.reason : undefined,
        });
    },
    [getState, dispatch]
  );

  /** Báo thùng đầy. Trùng với báo cáo còn mở trong 6 giờ thì gộp vào, không tính điểm thêm. */
  const reportFull = useCallback(
    (binId: string, level: "sap-day" | "day"): { merged: boolean; points: number } => {
      const s = getState();
      const bin = s.bins.bins.find((b) => b.id === binId);
      if (!bin) return { merged: false, points: 0 };
      const now = new Date();
      dispatch({ type: "BINS_UPSERT", bin: { ...bin, level: raiseLevel(bin.level, level) } });

      const open = openReportFor(s.bins.reports, binId, now);
      if (open) {
        const lvl = open.level === "day" || level === "day" ? "day" : "sap-day";
        dispatch({ type: "BINS_REPORT_UPDATE", report: { ...open, merged: open.merged + 1, level: lvl } });
        return { merged: true, points: 0 };
      }

      const rule = POINT_RULES.find((r) => r.id === "bin-full");
      const userId = s.user?.email;
      const capped = fullReportCapped(s.bins.reports, binId, userId, rule, now);
      const points = capped || !rule ? 0 : rule.points;
      const report: BinReport = {
        id: newId("bc"),
        binId,
        level,
        userId,
        userName: s.user?.name ?? "Khách",
        at: now.toISOString(),
        status: "moi",
        merged: 0,
        points,
      };
      report.pointsEntryId = addPending(report.id, points, "bin_full_report", `Báo thùng ${bin.code} ${level === "day" ? "đã đầy" : "sắp đầy"}`, userId, report.at);
      dispatch({ type: "BINS_REPORT_ADD", report });
      return { merged: false, points };
    },
    [getState, dispatch, addPending]
  );

  /** Đổi trạng thái các báo cáo đang mở của một thùng và quyết định điểm của chúng. */
  const settleReports = useCallback(
    (binId: string, status: "da-xac-nhan" | "khong-dung" | "da-xu-ly", from: BinReport["status"][]) => {
      const s = getState();
      const targets = s.bins.reports.filter((r) => r.binId === binId && from.includes(r.status));
      for (const r of targets) dispatch({ type: "BINS_REPORT_UPDATE", report: { ...r, status } });
      const ids = pendingEntryIds(s.points.entries, targets.map((r) => r.id));
      for (const id of ids)
        dispatch({
          type: "POINTS_DECIDE",
          id,
          decision: status === "khong-dung" ? "rejected" : "confirmed",
          note: status === "khong-dung" ? "Thùng chưa đầy khi kiểm tra" : undefined,
        });
    },
    [getState, dispatch]
  );

  const setLevel = useCallback(
    (binId: string, patch: Partial<Bin>) => {
      const bin = findBin(binId);
      if (bin) dispatch({ type: "BINS_UPSERT", bin: { ...bin, ...patch } });
    },
    [findBin, dispatch]
  );

  /** Xác nhận thùng đầy thật (điểm báo cáo được ghi nhận). */
  const confirmFull = useCallback((binId: string) => settleReports(binId, "da-xac-nhan", ["moi"]), [settleReports]);
  /** Báo sai: thùng còn chỗ — bác điểm, trả mức về "còn chỗ". */
  const rejectFull = useCallback(
    (binId: string) => {
      settleReports(binId, "khong-dung", ["moi", "da-xac-nhan"]);
      setLevel(binId, { level: "binh-thuong" });
    },
    [settleReports, setLevel]
  );
  const startEmptying = useCallback((binId: string) => setLevel(binId, { level: "dang-xu-ly" }), [setLevel]);
  /** Đổ xong: thùng về "còn chỗ", báo cáo đang mở thành "đã đổ thùng", điểm còn chờ được ghi nhận. */
  const markEmptied = useCallback(
    (binId: string) => {
      settleReports(binId, "da-xu-ly", ["moi", "da-xac-nhan"]);
      setLevel(binId, { level: "binh-thuong", lastEmptiedAt: new Date().toISOString() });
    },
    [settleReports, setLevel]
  );

  const upsertBin = useCallback((bin: Bin) => dispatch({ type: "BINS_UPSERT", bin }), [dispatch]);

  return {
    bins,
    dropoffs: sortedDropoffs,
    reports: sortedReports,
    myDropoffs,
    myReports,
    findByCode,
    recordDropoff,
    reviewDropoff,
    reportFull,
    confirmFull,
    rejectFull,
    startEmptying,
    markEmptied,
    upsertBin,
  };
}
