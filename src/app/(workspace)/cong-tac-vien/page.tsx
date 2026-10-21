import type { Metadata } from "next";
import { Suspense } from "react";
import { CtvView } from "@/features/ctv/CtvView";

export const metadata: Metadata = { title: "Duyệt bỏ đồ, thùng đầy" };

export default function Page() {
  // Suspense: View có thể đọc tham số trên URL bằng useSearchParams
  return (
    <Suspense>
      <CtvView />
    </Suspense>
  );
}
