import type { Metadata } from "next";
import { Suspense } from "react";
import { MaterialsView } from "@/features/materials/MaterialsView";

export const metadata: Metadata = { title: "Lô vật liệu" };

export default function Page() {
  // Suspense: View có thể đọc tham số trên URL bằng useSearchParams
  return (
    <Suspense>
      <MaterialsView />
    </Suspense>
  );
}
