import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { LOBBY_ASSETS } from "../assets";
import { ROUTES } from "@/lib/routes";
import { InkHeading } from "../ink/InkHeading";

/**
 * Hero gồm 5 lớp (xa → gần). Mỗi lớp có 2 tầng:
 *  - [data-layer]  : GSAP cuộn (parallax + ghim) điều khiển transform ở tầng này
 *  - [data-mouse]  : mouse parallax điều khiển transform ở tầng trong
 * Tách 2 tầng để hai chuyển động không ghi đè transform của nhau.
 * Lớp 4 & 5 không nhận click (pointer-events-none) để không che nút.
 */
export function LobbyHero() {
  return (
    <section
      data-hero
      aria-labelledby="hero-title"
      className="relative h-[100svh] min-h-[600px] w-full overflow-hidden bg-gc-100"
    >
      {/* Lớp 1 — bầu trời */}
      <div data-layer="sky" className="absolute inset-0 z-0">
        <div data-mouse="sky" data-intro="desktop" className="absolute -inset-[4%]">
          <Image
            src={LOBBY_ASSETS.sky.src}
            alt={LOBBY_ASSETS.sky.alt}
            fill
            sizes="100vw"
            quality={80}
            loading="eager"
            className="object-cover object-center"
          />
        </div>
      </div>

      {/* Lớp 2 — chữ viền cực lớn (ẩn trên điện thoại) */}
      <div data-layer="outline" aria-hidden="true" className="absolute inset-0 z-10 hidden items-center justify-center md:flex">
        <div data-mouse="outline" data-intro>
          <span className="lobby-outline-text block whitespace-nowrap font-brand text-[17vw] leading-none tracking-[-0.02em]">
            VE CHAI
          </span>
        </div>
      </div>

      {/* Lớp 3 — tiêu đề, slogan, nút chính */}
      <div data-layer="title" className="absolute inset-0 z-20">
        <div data-mouse="title" className="mx-auto h-full max-w-7xl px-5 pt-28 sm:px-6 md:pt-[17svh] lg:px-10">
          <InkHeading
            as="h1"
            inkId="hero"
            variant="hero"
            id="hero-title"
            data-intro
            className="max-w-[13ch] text-[clamp(2.25rem,min(6.4vw,11svh),6.6rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-gc-900"
          />

          <p className="mt-5 max-w-[30rem] text-[clamp(1rem,1.35vw,1.2rem)] leading-relaxed text-gc-800 md:mt-7">
            <span data-slogan-line data-intro className="block">
              Bán ve chai, thanh lý đồ cũ, hoặc gọi người tới tận nhà thu gom.
            </span>
            <span data-slogan-line data-intro className="block">
              Tất cả ở một chỗ — ngay trong khu phố của bạn.
            </span>
          </p>

          <div data-hero-cta data-intro className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
            <div data-magnetic className="inline-block">
              <Link
                href={ROUTES.register}
                className="group inline-flex min-h-[54px] items-center gap-2.5 rounded-2xl bg-gc-700 px-7 text-[16px] font-bold text-white shadow-[0_10px_24px_-12px_rgb(12_53_23/0.7)] transition-colors hover:bg-gc-800"
              >
                Bắt đầu ngay
                <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </div>
            <Link href={ROUTES.login} className="hidden rounded-lg py-2 text-[15px] sm:inline font-semibold text-gc-800 underline decoration-gc-700/40 underline-offset-4 hover:decoration-gc-700">
              Đã có tài khoản? Đăng nhập
            </Link>
          </div>
        </div>
      </div>

      {/* Lớp 4 — vật thể chính (che một phần tiêu đề) */}
      <div
        data-layer="subject"
        className="pointer-events-none absolute inset-x-0 bottom-16 z-30 mx-auto h-[31svh] w-[90vw] max-w-[440px] md:inset-x-auto md:bottom-0 md:right-[-1vw] md:h-[84svh] md:w-[min(60vw,84svh)] md:max-w-none lg:right-0"
      >
        <div data-mouse="subject" data-intro="desktop" className="relative h-full w-full">
          <Image
            src={LOBBY_ASSETS.subject.src}
            alt={LOBBY_ASSETS.subject.alt}
            fill
            sizes="(max-width: 767px) 90vw, 60vw"
            quality={80}
            loading="eager"
            fetchPriority="high" // ảnh lớn nhất màn hình đầu (LCP) trên điện thoại
            className="object-contain object-bottom"
          />
        </div>
      </div>

      {/* Lớp 5 — tán lá / sương phía trước (ẩn trên điện thoại). Cao 108vw / 3.2 = đúng tỉ lệ ảnh để lá không bị cắt ngang
          (không dùng aspect-ratio: con h-full của nó sẽ cao 0);
          độ hạ xuống dưới mép màn hình do heroFit.ts tính để lá không bao giờ che slogan và nút */}
      <div data-layer="fog" className="lobby-hero-fog pointer-events-none absolute -inset-x-[4%] z-40 hidden h-[33.75vw] md:block">
        <div data-mouse="fog" data-intro className="relative h-full w-full">
          <Image
            src={LOBBY_ASSETS.foreground.src}
            alt={LOBBY_ASSETS.foreground.alt}
            fill
            sizes="108vw"
            quality={70}
            loading="lazy"
            className="object-cover object-bottom"
          />
        </div>
      </div>

      {/* Viền tối nhẹ quanh khung (vignette) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[45] bg-[radial-gradient(ellipse_at_center,transparent_55%,rgb(12_53_23/0.22)_100%)]"
      />

      {/* Gợi ý cuộn */}
      <a
        href="#tinh-nang"
        data-scroll-hint
        className="absolute inset-x-0 bottom-5 z-50 mx-auto w-fit rounded-xl px-3 py-1 text-[13px] font-semibold text-gc-900"
      >
        <span data-hint-inner data-intro className="flex flex-col items-center gap-1">
          Cuộn xuống
          <ArrowDown className="lobby-hint-arrow h-5 w-5" aria-hidden="true" />
        </span>
      </a>

      {/* Lớp màu phủ dần ở cuối đoạn ghim → nối liền sang phần tính năng */}
      <div data-veil aria-hidden="true" className="pointer-events-none absolute inset-0 z-[60] bg-gc-100 opacity-0" />
    </section>
  );
}
