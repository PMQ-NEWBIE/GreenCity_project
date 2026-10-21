import type { Metadata } from "next";
import { SellView } from "@/pages-views/SellView";

export const metadata: Metadata = { title: "Đăng bán ve chai, đồ cũ" };

export default function Page() {
  return <SellView />;
}
