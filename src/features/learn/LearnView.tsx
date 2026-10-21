"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BookOpen, Clock, Search, ArrowRight } from "lucide-react";
import {
  ROUTES,
  ARTICLE_TOPIC_LABEL,
  type ArticleTopic,
  type Article,
} from "@/features/contracts";
import { ARTICLES } from "@/data/knowledge";
import { SmartImage } from "@/components/greencity/SmartImage";
import { EmptyState } from "@/components/greencity/EmptyState";
import {
  PageContainer,
  PageIntro,
  buttonClass,
  inputClass,
} from "@/components/greencity/ui";
import { cn } from "@/lib/utils";

const TOPIC_PARAM = "chu-de";
const TOPICS: { id: ArticleTopic | "all"; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "phan-loai", label: ARTICLE_TOPIC_LABEL["phan-loai"] },
  { id: "u-phan", label: ARTICLE_TOPIC_LABEL["u-phan"] },
  { id: "giam-rac", label: ARTICLE_TOPIC_LABEL["giam-rac"] },
  { id: "tai-su-dung", label: ARTICLE_TOPIC_LABEL["tai-su-dung"] },
];

function isTopic(val: string | null): val is ArticleTopic {
  return val === "phan-loai" || val === "u-phan" || val === "giam-rac" || val === "tai-su-dung";
}

export function LearnView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTopic = searchParams.get(TOPIC_PARAM);
  const currentTopic: ArticleTopic | "all" = isTopic(rawTopic) ? rawTopic : "all";

  const [searchQuery, setSearchQuery] = useState("");

  const setTopic = (topic: ArticleTopic | "all") => {
    const params = new URLSearchParams(searchParams.toString());
    if (topic === "all") {
      params.delete(TOPIC_PARAM);
    } else {
      params.set(TOPIC_PARAM, topic);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      router.push(`${ROUTES.sortingGuide}?q=${encodeURIComponent(q)}`);
    } else {
      router.push(ROUTES.sortingGuide);
    }
  };

  const filteredArticles = useMemo(() => {
    return ARTICLES.filter((a) => {
      if (currentTopic === "all") return true;
      return a.topic === currentTopic;
    });
  }, [currentTopic]);

  const featured = filteredArticles[0];
  const remaining = filteredArticles.slice(1);

  return (
    <PageContainer>
      <PageIntro title="Hướng dẫn phân loại rác">
        Những hướng dẫn thực tế, dễ áp dụng giúp bạn và gia đình phân loại rác đúng cách, ủ phân tại nhà và giảm bớt đồ nhựa dùng một lần.
      </PageIntro>

      {/* Khối tìm nhanh sổ tay phân loại */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[13px] font-semibold text-primary">
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              Sổ tay phân loại
            </span>
            <h3 className="mt-2 text-[17px] font-bold text-foreground">
              Chưa rõ một món đồ bỏ vào thùng nào?
            </h3>
            <p className="mt-1 text-[14px] text-muted-foreground">
              Tra cứu nhanh hơn 60 món đồ sinh hoạt thường gặp: chai nhựa, vỏ hộp sữa, pin, bóng đèn...
            </p>
          </div>

          <form onSubmit={onSearchSubmit} className="flex w-full items-center gap-2 md:w-80">
            <label htmlFor="quick-guide-search" className="sr-only">
              Tra cứu nhanh món đồ trong sổ tay
            </label>
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                id="quick-guide-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Gõ: chai nhựa, pin, vỏ lon..."
                className={cn(inputClass(), "h-11 pl-10 pr-3 text-[14px]")}
              />
            </div>
            <button type="submit" className={cn(buttonClass.primary, "min-h-11 px-4 text-[14px]")}>
              Tra cứu
            </button>
          </form>
        </div>
      </div>

      {/* Chip lọc chủ đề */}
      <div
        className="hide-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
        role="group"
        aria-label="Lọc theo chủ đề bài viết"
      >
        {TOPICS.map((t) => {
          const selected = currentTopic === t.id;
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setTopic(t.id)}
              className={cn(
                "min-h-11 shrink-0 rounded-full border px-4 text-[14px] font-semibold transition-colors duration-150",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground/80 hover:border-primary/50 hover:text-primary"
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Danh sách bài viết */}
      {filteredArticles.length === 0 ? (
        <EmptyState
          title="Chưa có bài viết trong chủ đề này"
          description="Bạn hãy chọn chủ đề khác hoặc quay về xem tất cả các bài viết."
          action={
            <button
              type="button"
              onClick={() => setTopic("all")}
              className={buttonClass.primary}
            >
              Xem tất cả bài viết
            </button>
          }
        />
      ) : (
        <div className="mt-6 flex flex-col gap-6">
          {/* Thẻ bài viết nổi bật mới nhất nằm ngang trên desktop */}
          {featured && (
            <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-[border-color,box-shadow] duration-200 hover:border-primary/40 hover:shadow-md md:flex-row">
              <div className="relative aspect-[4/3] w-full md:w-2/5 shrink-0 overflow-hidden">
                <SmartImage
                  src={featured.cover}
                  alt={featured.title}
                  className="h-full w-full"
                  sizes="(max-width: 768px) 100vw, 480px"
                  imgClassName="transition-transform duration-300 group-hover:scale-[1.03]"
                />
                <span className="absolute left-3 top-3 rounded-full bg-card/90 px-3 py-1 text-[12px] font-semibold text-primary backdrop-blur-sm">
                  {ARTICLE_TOPIC_LABEL[featured.topic]}
                </span>
              </div>
              <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                <div>
                  <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{featured.readMinutes} phút đọc</span>
                  </div>
                  <h3 className="mt-2 text-[18px] font-bold leading-snug text-foreground sm:text-[21px]">
                    <Link
                      href={ROUTES.article(featured.slug)}
                      className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                    >
                      {featured.title}
                    </Link>
                  </h3>
                  <p className="mt-2.5 line-clamp-2 text-[15px] leading-relaxed text-muted-foreground">
                    {featured.summary}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-[14px] font-semibold text-primary">
                  <span>Đọc tiếp</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" aria-hidden="true" />
                </div>
              </div>
            </article>
          )}

          {/* Lưới các bài viết còn lại */}
          {remaining.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
              {remaining.map((article: Article) => (
                <article
                  key={article.slug}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-[border-color,box-shadow] duration-200 hover:border-primary/40 hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <SmartImage
                      src={article.cover}
                      alt={article.title}
                      className="h-full w-full"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
                      imgClassName="transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-card/90 px-2.5 py-0.5 text-[12px] font-semibold text-primary backdrop-blur-sm">
                      {ARTICLE_TOPIC_LABEL[article.topic]}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      <span>{article.readMinutes} phút đọc</span>
                    </div>
                    <h3 className="mt-1.5 line-clamp-2 text-[16px] font-bold leading-snug text-foreground">
                      <Link
                        href={ROUTES.article(article.slug)}
                        className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                      >
                        {article.title}
                      </Link>
                    </h3>
                    <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-muted-foreground">
                      {article.summary}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
}
