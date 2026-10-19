import type { Metadata } from "next";
import { Suspense } from "react";
import { SortingGuideView } from "@/features/learn/SortingGuideView";

export const metadata: Metadata = { title: "Sổ tay phân loại rác" };

export default function Page() {
  // Suspense: View có thể đọc tham số trên URL bằng useSearchParams
  return (
    <Suspense>
      <SortingGuideView />
    </Suspense>
  );
}
