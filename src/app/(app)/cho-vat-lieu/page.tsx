import type { Metadata } from "next";
import { Suspense } from "react";
import { MaterialsView } from "@/features/materials/MaterialsView";

export const metadata: Metadata = { title: "Chợ vật liệu tái chế" };

export default function Page() {
  // Suspense: View có thể đọc tham số trên URL bằng useSearchParams
  return (
    <Suspense>
      <MaterialsView />
    </Suspense>
  );
}
