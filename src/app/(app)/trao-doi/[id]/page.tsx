import type { Metadata } from "next";
import { SwapDetailView } from "@/features/swap/SwapDetailView";

export const metadata: Metadata = { title: "Đồ trao đổi" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SwapDetailView id={decodeURIComponent(id)} />;
}
