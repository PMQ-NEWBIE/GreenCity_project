import type { Metadata } from "next";
import { PickupBoardView } from "@/features/collect/PickupBoardView";

export const metadata: Metadata = { title: "Yêu cầu tới lấy" };

export default function Page() {
  return <PickupBoardView />;
}
