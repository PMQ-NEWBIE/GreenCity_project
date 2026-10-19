import type { Metadata } from "next";
import { SellView } from "@/pages-views/SellView";

export const metadata: Metadata = { title: "Đăng tin bán" };

export default function Page() {
  return <SellView />;
}
