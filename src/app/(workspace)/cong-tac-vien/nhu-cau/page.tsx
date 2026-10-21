import type { Metadata } from "next";
import { DemandsBoardView } from "@/features/demands/DemandsBoardView";

export const metadata: Metadata = { title: "Doanh nghiệp cần mua" };

export default function Page() {
  return <DemandsBoardView />;
}
