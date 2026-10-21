import type { Metadata } from "next";
import { Suspense } from "react";
import { RewardsView } from "@/features/rewards/RewardsView";

export const metadata: Metadata = { title: "Đổi điểm lấy quà" };

export default function Page() {
  // Suspense: View có thể đọc tham số trên URL bằng useSearchParams
  return (
    <Suspense>
      <RewardsView />
    </Suspense>
  );
}
