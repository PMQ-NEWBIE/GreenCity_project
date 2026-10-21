"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/store/app-store";
import { homeFor } from "@/lib/access";

/** Người dân về trang đầu của chế độ đang dùng, nhân sự / đối tác về khu làm việc của họ. */
export function HomeRedirect() {
  const { state } = useApp();
  const router = useRouter();
  useEffect(() => {
    if (state.ready && state.user) router.replace(homeFor(state.user.role, state.mode));
  }, [state.ready, state.user, state.mode, router]);
  return null;
}
