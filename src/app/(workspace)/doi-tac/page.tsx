import type { Metadata } from "next";
import { Suspense } from "react";
import { DiscoverView } from "@/pages-views/DiscoverView";

export const metadata: Metadata = { title: "Tin bán phế liệu" };

/** Đối tác thu mua chỉ thấy tin phế liệu (giấy, nhựa, kim loại, thủy tinh, điện tử hỏng). */
export default function Page() {
  // Suspense: DiscoverView đọc ?danh-muc= bằng useSearchParams
  return (
    <Suspense>
      <DiscoverView market="scrap" />
    </Suspense>
  );
}
