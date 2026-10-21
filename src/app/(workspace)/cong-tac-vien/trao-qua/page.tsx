import type { Metadata } from "next";
import { GiftHandoverView } from "@/features/ctv/GiftHandoverView";

export const metadata: Metadata = { title: "Trao quà đổi điểm" };

export default function Page() {
  return <GiftHandoverView />;
}
