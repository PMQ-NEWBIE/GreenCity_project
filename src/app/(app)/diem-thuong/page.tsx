import type { Metadata } from "next";
import { Suspense } from "react";
import { PointsView } from "@/features/points/PointsView";

export const metadata: Metadata = { title: "Điểm của tôi" };

export default function Page() {
  // Suspense: View có thể đọc tham số trên URL bằng useSearchParams
  return (
    <Suspense>
      <PointsView />
    </Suspense>
  );
}
