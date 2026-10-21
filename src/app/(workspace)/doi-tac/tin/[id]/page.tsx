import type { Metadata } from "next";
import { ProductDetailView } from "@/pages-views/ProductDetailView";

export const metadata: Metadata = { title: "Chi tiết tin ve chai" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductDetailView productId={decodeURIComponent(id)} />;
}
