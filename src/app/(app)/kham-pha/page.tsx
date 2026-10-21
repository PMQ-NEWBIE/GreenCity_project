import type { Metadata } from "next";
import { Suspense } from "react";
import { DiscoverView } from "@/pages-views/DiscoverView";

export const metadata: Metadata = { title: "Mua đồ cũ quanh đây" };

export default function Page() {
  // Suspense: DiscoverView đọc ?danh-muc= bằng useSearchParams
  return (
    <Suspense>
      <DiscoverView />
    </Suspense>
  );
}
