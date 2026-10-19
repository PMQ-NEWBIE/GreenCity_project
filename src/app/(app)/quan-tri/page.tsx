import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminView } from "@/features/admin/AdminView";

export const metadata: Metadata = { title: "Quản trị vận hành" };

export default function Page() {
  // Suspense: View có thể đọc tham số trên URL bằng useSearchParams
  return (
    <Suspense>
      <AdminView />
    </Suspense>
  );
}
