import type { Metadata } from "next";
import { Suspense } from "react";
import { PointRulesView } from "@/features/points/PointRulesView";

export const metadata: Metadata = { title: "Quy tắc tính điểm" };

export default function Page() {
  // Suspense: View có thể đọc tham số trên URL bằng useSearchParams
  return (
    <Suspense>
      <PointRulesView />
    </Suspense>
  );
}
