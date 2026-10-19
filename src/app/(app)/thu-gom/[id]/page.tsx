import type { Metadata } from "next";
import { CollectRequestView } from "@/features/collect/CollectRequestView";

export const metadata: Metadata = { title: "Chi tiết yêu cầu thu gom" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CollectRequestView id={decodeURIComponent(id)} />;
}
