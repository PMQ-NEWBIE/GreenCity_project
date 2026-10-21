import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopsView } from "@/features/green-shops/ShopsView";

export const metadata: Metadata = { title: "Cửa hàng sản phẩm xanh" };

export default function Page() {
  // Suspense: View có thể đọc tham số trên URL bằng useSearchParams
  return (
    <Suspense>
      <ShopsView />
    </Suspense>
  );
}
