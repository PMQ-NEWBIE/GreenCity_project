import type { Metadata } from "next";
import { SellerHomeView } from "@/pages-views/SellerHomeView";

export const metadata: Metadata = { title: "Tổng quan bán" };

export default function Page() {
  return <SellerHomeView />;
}
