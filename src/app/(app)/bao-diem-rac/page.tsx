import type { Metadata } from "next";
import { Suspense } from "react";
import { LitterReportView } from "@/features/litter/LitterReportView";

export const metadata: Metadata = { title: "Báo chỗ đổ rác bừa" };

export default function Page() {
  // Suspense: View có thể đọc tham số trên URL bằng useSearchParams
  return (
    <Suspense>
      <LitterReportView />
    </Suspense>
  );
}
