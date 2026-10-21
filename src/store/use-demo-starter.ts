"use client";

import { useEffect } from "react";
import { demoStarterActions } from "@/data/demo-starter";
import { useApp } from "./app-store";

/** Bộ kiểm tra tự động đặt cờ này để bắt đầu từ trạng thái trống (đếm điểm, đếm đơn chính xác) */
const OPT_OUT_KEY = "greencity-no-starter";

/**
 * Bản demo: tài khoản vào lần đầu được gắn sẵn hoạt động hợp vai trò (data/demo-starter.ts), để web trông như
 * đang có người dùng thật. Mỗi email một lần. Gắn trong cả khung trang người dân lẫn khu làm việc.
 */
export function useDemoStarter() {
  const { state, getState, dispatch } = useApp();
  const email = state.user?.email;
  const seeded = !!email && state.demoSeeded.includes(email);

  useEffect(() => {
    if (!state.ready || !email || seeded) return;
    try {
      if (window.localStorage.getItem(OPT_OUT_KEY) === "1") return;
    } catch {
      /* không đọc được thì vẫn gắn */
    }
    const s = getState();
    if (!s.user || s.demoSeeded.includes(s.user.email)) return;
    for (const action of demoStarterActions(s.user, s)) dispatch(action);
  }, [state.ready, email, seeded, getState, dispatch]);
}
