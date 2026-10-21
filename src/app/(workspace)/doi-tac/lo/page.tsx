import type { Metadata } from "next";
import { MyLotsView } from "@/features/materials/MyLotsView";

export const metadata: Metadata = { title: "Lô bán cho doanh nghiệp" };

export default function Page() {
  return <MyLotsView />;
}
