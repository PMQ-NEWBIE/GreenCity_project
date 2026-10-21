import type { Metadata } from "next";
import { CollectView } from "@/pages-views/CollectView";

export const metadata: Metadata = { title: "Gọi người tới lấy" };

export default function Page() {
  return <CollectView />;
}
