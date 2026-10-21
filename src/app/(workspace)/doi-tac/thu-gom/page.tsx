import type { Metadata } from "next";
import { PickupBoardView } from "@/features/collect/PickupBoardView";

export const metadata: Metadata = { title: "Người dân gọi tới lấy" };

export default function Page() {
  return <PickupBoardView />;
}
