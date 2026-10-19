"use client";

import Link from "next/link";
import { ArrowLeft, Clock, Calendar, Video, ArrowRight } from "lucide-react";
import {
  ROUTES,
  ARTICLE_TOPIC_LABEL,
  formatDate,
  type ArticleBlock,
  type ArticleTopic,
} from "@/features/contracts";
import { ARTICLES } from "@/data/knowledge";
import { SmartImage } from "@/components/greencity/SmartImage";
import { EmptyState } from "@/components/greencity/EmptyState";
import { PageContainer, buttonClass } from "@/components/greencity/ui";
import { cn } from "@/lib/utils";

function topicAction(topic: ArticleTopic) {
  switch (topic) {
    case "phan-loai":
      return {
        title: "Tra cứu sổ tay phân loại",
        desc: "Xem hướng dẫn xử lý và phân nhóm cho hơn 60 món đồ sinh hoạt quen thuộc.",
        btn: "Mở sổ tay phân loại",
        href: ROUTES.sortingGuide,
      };
    case "u-phan":
      return {
        title: "Đổi điểm lấy phân bón hữu cơ",
        desc: "Dùng điểm Green City tích lũy được để đổi lấy phân ủ hoai và phân trùn quế sạch cho vườn nhà.",
        btn: "Xem danh mục quà tặng",
        href: ROUTES.rewards,
      };
    case "giam-rac":
      return {
        title: "Đặt lịch thu gom tận nhà",
        desc: "Bán ve chai tận nơi, gom đồ sạch sẽ và nhận điểm thưởng cho mỗi lượt hoàn tất.",
        btn: "Gọi thu gom ngay",
        href: ROUTES.collect,
      };
    case "tai-su-dung":
      return {
        title: "Khu trao đổi đồ cũ",
        desc: "Tặng miễn phí hoặc đổi lấy món đồ khác cùng những người dân lân cận tại TP.HCM.",
        btn: "Khám phá khu trao đổi",
        href: ROUTES.swap,
      };
  }
}

export function ArticleView({ slug }: { slug: string }) {
  const article = ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    return (
      <PageContainer>
        <EmptyState
          title="Không tìm thấy bài viết"
          description="Bài viết bạn tìm có thể đã đổi đường dẫn hoặc không tồn tại."
          action={
            <Link href={ROUTES.learn} className={buttonClass.primary}>
              Về trang kiến thức
            </Link>
          }
        />
      </PageContainer>
    );
  }

  const relatedArticles = ARTICLES.filter(
    (a) => a.topic === article.topic && a.slug !== article.slug
  ).slice(0, 3);

  const action = topicAction(article.topic);

  return (
    <PageContainer className="max-w-4xl">
      {/* Nút quay lại */}
      <div className="mb-4">
        <Link
          href={ROUTES.learn}
          className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Tất cả bài viết
        </Link>
      </div>

      {/* Đầu bài: Đúng duy nhất 1 thẻ h2 */}
      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-3 text-[13px] text-muted-foreground">
          <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">
            {ARTICLE_TOPIC_LABEL[article.topic]}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {article.readMinutes} phút đọc
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            Cập nhật {formatDate(article.updatedAt)}
          </span>
        </div>

        <h2 className="mt-3 text-[24px] font-extrabold tracking-tight text-foreground sm:text-[32px] sm:leading-tight">
          {article.title}
        </h2>
        <p className="mt-3 text-[16px] leading-relaxed text-muted-foreground sm:text-[18px]">
          {article.summary}
        </p>
      </header>

      {/* Ảnh bìa */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border shadow-sm">
        <SmartImage
          src={article.cover}
          alt={article.title}
          className="h-full w-full"
          eager
          sizes="(max-width: 1024px) 100vw, 896px"
        />
      </div>

      {/* Thân bài: max-w-[68ch] */}
      <main className="mx-auto mt-8 flex max-w-[68ch] flex-col gap-6 text-[16px] leading-relaxed text-foreground/90 sm:text-[17px]">
        {article.blocks.map((block: ArticleBlock, idx: number) => {
          switch (block.type) {
            case "p":
              return (
                <p key={idx} className="leading-relaxed">
                  {block.text}
                </p>
              );
            case "h2":
              return (
                <h3
                  key={idx}
                  className="mt-4 text-[19px] font-bold tracking-tight text-foreground sm:text-[21px]"
                >
                  {block.text}
                </h3>
              );
            case "steps":
              return (
                <ol key={idx} className="my-2 flex flex-col gap-4">
                  {block.items.map((item: string, stepIdx: number) => (
                    <li key={stepIdx} className="flex items-start gap-3.5">
                      <span
                        aria-hidden="true"
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[13px] font-bold text-primary-foreground"
                      >
                        {stepIdx + 1}
                      </span>
                      <p className="flex-1 pt-0.5 text-[15px] sm:text-[16px] leading-relaxed">
                        {item}
                      </p>
                    </li>
                  ))}
                </ol>
              );
            case "tip":
              return (
                <aside
                  key={idx}
                  className="my-2 rounded-2xl border border-border bg-accent p-4 sm:p-5"
                >
                  <p className="text-[13px] font-bold uppercase tracking-wider text-primary">
                    Mẹo
                  </p>
                  <p className="mt-1 text-[15px] leading-relaxed text-accent-foreground">
                    {block.text}
                  </p>
                </aside>
              );
            case "image":
              return (
                <figure key={idx} className="my-2 overflow-hidden rounded-2xl border border-border">
                  <div className="relative aspect-[16/9] w-full">
                    <SmartImage
                      src={block.src}
                      alt={block.alt}
                      className="h-full w-full"
                      sizes="(max-width: 768px) 100vw, 680px"
                    />
                  </div>
                  {block.caption && (
                    <figcaption className="bg-card p-3 text-center text-[13px] text-muted-foreground">
                      {block.caption}
                    </figcaption>
                  )}
                </figure>
              );
          }
        })}

        {/* Khung video (nếu có) */}
        {article.video && (
          <div className="my-4 flex aspect-[16/9] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-muted p-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-background shadow-sm text-primary">
              <Video className="h-7 w-7" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[16px] font-bold text-foreground">{article.video.title}</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Video đang được biên tập · Thời lượng dự kiến: {article.video.duration}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Hộp hành động liên quan theo chủ đề */}
      <section className="mt-12 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <h3 className="text-[17px] font-bold text-foreground">{action.title}</h3>
            <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">
              {action.desc}
            </p>
          </div>
          <Link
            href={action.href}
            className={cn(buttonClass.primary, "shrink-0 min-h-12 px-5")}
          >
            {action.btn}
          </Link>
        </div>
      </section>

      {/* Bài cùng chủ đề */}
      {relatedArticles.length > 0 && (
        <section className="mt-12 border-t border-border pt-8">
          <h3 className="text-[19px] font-bold text-foreground">Bài cùng chủ đề</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedArticles.map((rel: typeof article) => (
              <article
                key={rel.slug}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-[border-color,box-shadow] duration-200 hover:border-primary/40 hover:shadow-md"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <SmartImage
                    src={rel.cover}
                    alt={rel.title}
                    className="h-full w-full"
                    sizes="300px"
                    imgClassName="transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h4 className="line-clamp-2 text-[15px] font-bold leading-snug text-foreground">
                    <Link
                      href={ROUTES.article(rel.slug)}
                      className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                    >
                      {rel.title}
                    </Link>
                  </h4>
                  <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
                    {rel.summary}
                  </p>
                  <div className="mt-auto pt-3 flex items-center gap-1 text-[13px] font-semibold text-primary">
                    <span>Xem bài</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-1" aria-hidden="true" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </PageContainer>
  );
}
