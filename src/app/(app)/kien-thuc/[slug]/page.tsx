import type { Metadata } from "next";
import { ArticleView } from "@/features/learn/ArticleView";
import { ARTICLES } from "@/data/knowledge";

type Props = { params: Promise<{ slug: string }> };

// Dựng sẵn mọi bài có trong dữ liệu lúc build
export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decodeURIComponent((await params).slug);
  const article = ARTICLES.find((a) => a.slug === slug);
  return { title: article?.title ?? "Bài viết", description: article?.summary };
}

export default async function Page({ params }: Props) {
  const slug = decodeURIComponent((await params).slug);
  return <ArticleView slug={slug} />;
}
