import type { Metadata } from "next";
import { Suspense } from "react";
import { SwapPostView } from "@/features/swap/SwapPostView";

export const metadata: Metadata = { title: "Đăng đồ cho tặng, đổi" };

export default function Page() {
  // Suspense: View có thể đọc tham số trên URL bằng useSearchParams
  return (
    <Suspense>
      <SwapPostView />
    </Suspense>
  );
}
