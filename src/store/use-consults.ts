"use client";

import { useCallback, useMemo } from "react";
import type { ClassifyResult, ConsultTicket, WasteGroup } from "@/types/features";
import { newId, useApp } from "./app-store";

/** Tư vấn phân loại (A8): người dân gửi ảnh + mô tả → cộng tác viên/vận hành trả lời. */
export function useConsults() {
  const { state, getState, dispatch } = useApp();
  const uid = state.user?.email;
  const tickets = useMemo(() => [...state.consults.tickets].sort((a, b) => b.at.localeCompare(a.at)), [state.consults.tickets]);
  const mine = useMemo(() => (uid ? tickets.filter((t) => t.userId === uid) : []), [tickets, uid]);

  const ask = useCallback(
    (input: { photo: string; description: string; question: string; suggestions: ClassifyResult[] }): ConsultTicket => {
      const user = getState().user;
      const ticket: ConsultTicket = {
        ...input,
        id: newId("tv"),
        userId: user?.email,
        userName: user?.name ?? "Khách",
        at: new Date().toISOString(),
        status: "cho-tu-van",
      };
      dispatch({ type: "CONSULTS_UPSERT", ticket });
      return ticket;
    },
    [getState, dispatch]
  );

  const answer = useCallback(
    (id: string, group: WasteGroup, guidance: string) => {
      const s = getState();
      const t = s.consults.tickets.find((x) => x.id === id);
      if (!t) return;
      dispatch({
        type: "CONSULTS_UPSERT",
        ticket: { ...t, status: "da-tra-loi", answer: { group, guidance: guidance.trim(), by: s.user?.name ?? "Người tư vấn", at: new Date().toISOString() } },
      });
    },
    [getState, dispatch]
  );

  return { tickets, mine, ask, answer };
}
