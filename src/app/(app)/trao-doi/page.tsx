import type { Metadata } from "next";
import { Suspense } from "react";
import { SwapView } from "@/features/swap/SwapView";

export const metadata: Metadata = { title: "Cho tặng, đổi đồ cũ" };

export default function Page() {
  // Suspense: View có thể đọc tham số trên URL bằng useSearchParams
  return (
    <Suspense>
      <SwapView />
    </Suspense>
  );
}
