import type { Metadata } from "next";
import { MyLotsView } from "@/features/materials/MyLotsView";

export const metadata: Metadata = { title: "Lô hàng của tôi" };

export default function Page() {
  return <MyLotsView />;
}
