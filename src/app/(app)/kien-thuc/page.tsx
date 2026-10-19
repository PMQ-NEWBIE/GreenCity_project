import type { Metadata } from "next";
import { Suspense } from "react";
import { LearnView } from "@/features/learn/LearnView";

export const metadata: Metadata = { title: "Kiến thức môi trường" };

export default function Page() {
  // Suspense: View có thể đọc tham số trên URL bằng useSearchParams
  return (
    <Suspense>
      <LearnView />
    </Suspense>
  );
}
