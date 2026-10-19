import type { Metadata } from "next";
import { Suspense } from "react";
import { MapView } from "@/features/map/MapView";

export const metadata: Metadata = { title: "Bản đồ xanh" };

export default function Page() {
  // Suspense: View có thể đọc tham số trên URL bằng useSearchParams
  return (
    <Suspense>
      <MapView />
    </Suspense>
  );
}
