import type { Metadata } from "next";
import { Suspense } from "react";
import { StatsView } from "@/features/stats/StatsView";

export const metadata: Metadata = { title: "Thống kê môi trường" };

export default function Page() {
  // Suspense: View có thể đọc tham số trên URL bằng useSearchParams
  return (
    <Suspense>
      <StatsView />
    </Suspense>
  );
}
