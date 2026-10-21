import type { Metadata } from "next";
import { MyListingsView } from "@/pages-views/MyListingsView";

export const metadata: Metadata = { title: "Món tôi đang bán" };

export default function Page() {
  return <MyListingsView />;
}
