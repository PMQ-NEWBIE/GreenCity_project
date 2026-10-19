"use client";

import { useCallback, useMemo } from "react";
import { POINT_RULES } from "@/data/point-rules";
import { distanceMeters } from "@/data/geo";
import { findDuplicate } from "@/lib/litter";
import type { Area } from "@/types";
import type { LitterReport, LitterSize } from "@/types/features";
import { newId, useApp } from "./app-store";

export interface NewLitterReport {
  photos: string[];
  lat?: number;
  lng?: number;
  area: Area;
  address: string;
  size: LitterSize;
  description: string;
}

/**
 * Báo điểm rác tự phát (A4): người dân gửi → cộng tác viên xác minh (cộng điểm) hoặc bác
 * → nhóm vận hành đánh dấu đã dọn. Báo trùng trong 100m/24 giờ vẫn gửi được nhưng không tính điểm.
 */
export function useLitter() {
  const { state, getState, dispatch } = useApp();
  const uid = state.user?.email;
  const reports = useMemo(() => [...state.litter.reports].sort((a, b) => b.at.localeCompare(a.at)), [state.litter.reports]);
  const mine = useMemo(() => (uid ? reports.filter((r) => r.userId === uid) : []), [reports, uid]);

  const duplicateOf = useCallback(
    (c: { lat?: number; lng?: number; area: string; address: string }) =>
      findDuplicate(getState().litter.reports, c, new Date(), distanceMeters),
    [getState]
  );

  const submit = useCallback(
    (input: NewLitterReport): LitterReport => {
      const s = getState();
      const now = new Date().toISOString();
      const dup = findDuplicate(s.litter.reports, input, new Date(), distanceMeters);
      const rule = POINT_RULES.find((r) => r.id === "litter-report");
      const points = dup || !rule ? 0 : rule.points;
      const report: LitterReport = {
        ...input,
        id: newId("dr"),
        userId: s.user?.email,
        userName: s.user?.name ?? "Khách",
        locationSource: input.lat != null ? "gps" : "tay",
        at: now,
        status: "cho-xac-minh",
        points,
        duplicateOf: dup?.report.id,
      };
      if (points > 0 && report.userId) {
        report.pointsEntryId = newId("pt");
        dispatch({
          type: "POINTS_ADD",
          entry: {
            id: report.pointsEntryId,
            at: now,
            delta: points,
            reason: "litter_report",
            title: `Báo điểm rác · ${input.address || input.area}`,
            status: "pending",
            refId: report.id,
            userId: report.userId,
          },
        });
      }
      dispatch({ type: "LITTER_UPSERT", report });
      return report;
    },
    [getState, dispatch]
  );

  const update = useCallback(
    (id: string, patch: (r: LitterReport) => LitterReport | null) => {
      const s = getState();
      const r = s.litter.reports.find((x) => x.id === id);
      const next = r && patch(r);
      if (next) dispatch({ type: "LITTER_UPSERT", report: next });
      return { before: r, after: next };
    },
    [getState, dispatch]
  );

  const verify = useCallback(
    (id: string) => {
      const { before } = update(id, (r) =>
        r.status === "cho-xac-minh"
          ? { ...r, status: "da-xac-minh", verifiedAt: new Date().toISOString(), verifier: getState().user?.name ?? "Cộng tác viên" }
          : null
      );
      if (before?.pointsEntryId && before.status === "cho-xac-minh")
        dispatch({ type: "POINTS_DECIDE", id: before.pointsEntryId, decision: "confirmed" });
    },
    [update, getState, dispatch]
  );

  const reject = useCallback(
    (id: string, reason: string) => {
      const { before } = update(id, (r) =>
        r.status === "cho-xac-minh"
          ? { ...r, status: "khong-hop-le", points: 0, rejectReason: reason, verifiedAt: new Date().toISOString(), verifier: getState().user?.name ?? "Cộng tác viên" }
          : null
      );
      if (before?.pointsEntryId && before.status === "cho-xac-minh")
        dispatch({ type: "POINTS_DECIDE", id: before.pointsEntryId, decision: "rejected", note: reason });
    },
    [update, getState, dispatch]
  );

  const markCleaned = useCallback(
    (id: string) => {
      update(id, (r) => (r.status === "da-xac-minh" ? { ...r, status: "da-don", cleanedAt: new Date().toISOString() } : null));
    },
    [update]
  );

  return { reports, mine, duplicateOf, submit, verify, reject, markCleaned };
}
