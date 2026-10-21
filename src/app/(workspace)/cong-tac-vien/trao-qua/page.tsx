import type { Metadata } from "next";
import { GiftHandoverView } from "@/features/ctv/GiftHandoverView";

export const metadata: Metadata = { title: "Trao quà" };

export default function Page() {
  return <GiftHandoverView />;
}
