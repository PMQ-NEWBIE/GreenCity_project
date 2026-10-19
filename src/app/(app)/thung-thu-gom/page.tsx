import type { Metadata } from "next";
import { Suspense } from "react";
import { BinsView } from "@/features/bins/BinsView";

export const metadata: Metadata = { title: "Thùng thu gom" };

export default function Page() {
  // Suspense: View có thể đọc tham số trên URL bằng useSearchParams
  return (
    <Suspense>
      <BinsView />
    </Suspense>
  );
}
