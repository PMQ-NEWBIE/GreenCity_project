import type { Metadata } from "next";
import { MyListingsView } from "@/pages-views/MyListingsView";

export const metadata: Metadata = { title: "Tin đăng của tôi" };

export default function Page() {
  return <MyListingsView />;
}
