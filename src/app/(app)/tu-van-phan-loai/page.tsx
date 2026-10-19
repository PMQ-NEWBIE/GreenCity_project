import type { Metadata } from "next";
import { Suspense } from "react";
import { ConsultView } from "@/features/consult/ConsultView";

export const metadata: Metadata = { title: "Tư vấn phân loại" };

export default function Page() {
  // Suspense: View có thể đọc tham số trên URL bằng useSearchParams
  return (
    <Suspense>
      <ConsultView />
    </Suspense>
  );
}
