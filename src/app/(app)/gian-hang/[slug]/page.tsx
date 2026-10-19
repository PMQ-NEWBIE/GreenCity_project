import type { Metadata } from "next";
import { ShopDetailView } from "@/features/green-shops/ShopDetailView";
import { GREEN_SHOPS } from "@/data/green-shops";

type Props = { params: Promise<{ slug: string }> };

// Dựng sẵn mọi gian hàng có trong dữ liệu lúc build
export function generateStaticParams() {
  return GREEN_SHOPS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decodeURIComponent((await params).slug);
  const shop = GREEN_SHOPS.find((s) => s.slug === slug);
  return { title: shop?.name ?? "Gian hàng", description: shop?.description };
}

export default async function Page({ params }: Props) {
  const slug = decodeURIComponent((await params).slug);
  return <ShopDetailView slug={slug} />;
}
