import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { LOBBY_ASSETS, MOBILE_HERO_LAYERS, MOBILE_HERO_READY } from "../assets";
import { LOBBY_MEDIA } from "../config";
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
      // data-theme-scene: ThemeToggle không chụp cả trang khi đổi sáng / tối ở đây — hero tự chuyển
      // (bầu trời mờ dần sang đêm, xe đạp chạy ra khỏi khung — animations/themeRide.ts, chữ và nút giữ nguyên chỗ)
      data-theme-scene
      className="relative h-[100svh] min-h-[600px] w-full overflow-hidden bg-gc-100 dark:bg-background"
    >
      {/* Lớp 1 — bầu trời */}
      <div data-layer="sky" className="absolute inset-0 z-0">
        <div
          data-mouse="sky"
          data-intro="desktop"
          className="lobby-hero-sky absolute -inset-[4%]"
        >
          {/* Ban ngày: ảnh bầu trời sáng sớm (kèm ảnh dọc trên điện thoại) */}
          <div className="lobby-sky-day absolute inset-0">
            <HeroBackdrop />
          </div>

          {/* Ban đêm: thành phố Sài Gòn lên đèn — cả điện thoại (ban đêm xe đã đi, chỉ còn phố) */}
          <div aria-hidden="true" className="lobby-sky-night absolute inset-0">
            <Image
              src={LOBBY_ASSETS.skyNight.src}
              alt={LOBBY_ASSETS.skyNight.alt}
              fill
              sizes="100vw"
              quality={80}
              loading="eager"
              className="object-cover object-center"
            />
          </div>

          {/* Màn tối: phủ nhẹ ở nửa trái để chữ sáng luôn đạt tương phản hoàn hảo */}
          <div
            aria-hidden="true"
            className="lobby-hero-night pointer-events-none absolute inset-0"
          />
        </div>
      </div>

      {/* Lớp 2 — chữ viền cực lớn (ẩn trên điện thoại) */}
      <div
        data-layer="outline"
        aria-hidden="true"
        className="absolute inset-0 z-10 hidden items-center justify-center md:flex"
      >
        <div data-mouse="outline" data-intro>
          <span className="lobby-outline-text block whitespace-nowrap font-brand text-[12.5vw] leading-none tracking-[-0.02em]">
            GREEN CITY
          </span>
        </div>
      </div>

      {/* Lớp 3 — tiêu đề, slogan, nút chính */}
      <div data-layer="title" className="absolute inset-0 z-20">
        <div
          data-mouse="title"
          className="mx-auto h-full max-w-7xl px-5 pt-28 sm:px-6 md:pt-[17svh] lg:px-10"
        >
          <InkHeading
            as="h1"
            inkId="hero"
            variant="hero"
            id="hero-title"
            data-intro
            className="lobby-theme-fade max-w-[13ch] text-[clamp(2.25rem,min(6.4vw,11svh),6.6rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-gc-900 dark:text-foreground"
          />

          <p className="lobby-theme-fade mt-5 max-w-[30rem] text-[clamp(1rem,1.35vw,1.2rem)] leading-relaxed text-gc-800 dark:text-text-secondary md:mt-7">
            <span data-slogan-line data-intro className="block">
              Bán ve chai, thanh lý đồ cũ, hoặc gọi người tới tận nhà thu gom.
            </span>
            <span data-slogan-line data-intro className="block">
              Tất cả ở một chỗ — ngay trong khu phố của bạn.
            </span>
          </p>

          <div
            data-hero-cta
            data-intro
            className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3"
          >
            <div data-magnetic className="inline-block">
              <Link
                href={ROUTES.register}
                className="lobby-theme-fade group inline-flex min-h-[54px] items-center gap-2.5 rounded-2xl bg-gc-700 dark:bg-primary px-7 text-[16px] font-bold text-white dark:text-primary-foreground shadow-[0_10px_24px_-12px_rgb(12_53_23/0.7)] dark:shadow-[0_10px_24px_-12px_rgba(0,0,0,0.8)] transition-colors hover:bg-gc-800 dark:hover:bg-primary-hover"
              >
                Bắt đầu ngay
                <ArrowRight
                  className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>
            <Link
              href={ROUTES.login}
              className="lobby-theme-fade hidden rounded-lg py-2 text-[15px] sm:inline font-semibold text-gc-800 dark:text-foreground underline decoration-gc-700/40 dark:decoration-primary/50 underline-offset-4 hover:decoration-gc-700 dark:hover:decoration-primary"
            >
              Đã có tài khoản? Đăng nhập
            </Link>
          </div>
        </div>
      </div>

      {/* Lớp 4 — vật thể chính (che một phần tiêu đề) */}
      <div
        data-layer="subject"
        className={`pointer-events-none absolute inset-x-0 bottom-[6svh] z-30 mx-auto h-[34svh] w-[90vw] max-w-[440px] md:inset-x-auto md:bottom-0 md:right-[-1vw] md:h-[84svh] md:w-[min(60vw,84svh)] md:max-w-none lg:right-0 ${MOBILE_HERO_READY ? "max-md:hidden" : ""}`}
      >
        <div
          data-mouse="subject"
          data-intro="desktop"
          className="relative h-full w-full [container-type:size]"
        >
          {!MOBILE_HERO_READY && <MobileGround />}
          {/* data-ride: tầng riêng cho hiệu ứng xe chạy đi (sang tối) / chạy về (sang sáng) — animations/themeRide.ts.
              Người dùng yêu cầu ban đêm KHÔNG còn xe, nên không làm tối xe mà cho xe chạy khỏi khung. */}
          <div data-ride className="absolute inset-0">
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
      </div>

      {/* Lớp 5 — tán lá / sương phía trước (ẩn trên điện thoại). Cao 108vw / 3.2 = đúng tỉ lệ ảnh để lá không bị cắt ngang
          (không dùng aspect-ratio: con h-full của nó sẽ cao 0);
          độ hạ xuống dưới mép màn hình do heroFit.ts tính để lá không bao giờ che slogan và nút */}
      <div
        data-layer="fog"
        className="lobby-hero-fog pointer-events-none absolute -inset-x-[4%] z-40 hidden h-[33.75vw] md:block"
      >
        <div data-mouse="fog" data-intro className="relative h-full w-full">
          <Image
            src={LOBBY_ASSETS.foreground.src}
            alt={LOBBY_ASSETS.foreground.alt}
            fill
            sizes="108vw"
            quality={70}
            loading="lazy"
            className="lobby-theme-fade object-cover object-bottom dark:brightness-[0.6]"
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
        className="absolute inset-x-0 bottom-5 z-50 mx-auto hidden w-fit rounded-xl px-3 py-1 text-[13px] font-semibold text-gc-900 dark:text-foreground md:block"
      >
        <span
          data-hint-inner
          data-intro
          className="flex flex-col items-center gap-1"
        >
          Cuộn xuống
          <ArrowDown className="lobby-hint-arrow h-5 w-5" aria-hidden="true" />
        </span>
      </a>

      {/* Lớp màu phủ dần ở cuối đoạn ghim → nối liền sang phần tính năng */}
      <div
        data-veil
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[60] bg-gc-100 dark:bg-background opacity-0"
      />
    </section>
  );
}

/**
 * Lớp 1. Có ảnh dọc riêng cho điện thoại thì dùng <picture> để mỗi máy chỉ tải đúng một ảnh.
 * Ảnh dọc đã có sẵn xe đạp đứng trên vỉa hè → lớp 4 ẩn trên điện thoại.
 */
function HeroBackdrop() {
  const common = {
    fill: true,
    sizes: "100vw",
    quality: 80,
    loading: "eager",
  } as const;
  if (!MOBILE_HERO_READY) {
    return (
      <Image
        src={LOBBY_ASSETS.sky.src}
        alt={LOBBY_ASSETS.sky.alt}
        {...common}
        className="object-cover object-center"
      />
    );
  }
  // Điện thoại: nền không có xe + lớp xe riêng (cùng khung) → khi đổi sang tối, lớp xe chạy đi được
  const {
    props: { srcSet: mobile },
  } = getImageProps({
    ...common,
    src: MOBILE_HERO_LAYERS.empty,
    alt: LOBBY_ASSETS.mobileHero.alt,
  });
  const { props: bike } = getImageProps({
    ...common,
    src: MOBILE_HERO_LAYERS.bike,
    alt: "",
  });
  const { props } = getImageProps({
    ...common,
    src: LOBBY_ASSETS.sky.src,
    alt: LOBBY_ASSETS.sky.alt,
  });
  return (
    <>
      <picture>
        <source media={LOBBY_MEDIA.mobile} srcSet={mobile} />
        {/* eslint-disable-next-line jsx-a11y/alt-text -- props (gồm alt) do getImageProps tạo */}
        <img
          {...props}
          fetchPriority="high"
          className="lobby-hero-portrait object-cover object-center max-md:object-bottom"
        />
      </picture>
      {/* Lớp xe của ảnh dọc — chỉ điện thoại; data-ride: animations/themeRide.ts cho xe chạy đi / chạy về */}
      <div data-ride className="absolute inset-0 md:hidden">
        {/* eslint-disable-next-line jsx-a11y/alt-text -- alt rỗng do getImageProps tạo (ảnh trang trí, đã mô tả ở ảnh nền) */}
        <img {...bike} fetchPriority="high" className="lobby-hero-bike object-cover object-center max-md:object-bottom" />
      </div>
    </>
  );
}


/**
 * Điện thoại, khi chưa có ảnh dọc: ảnh nền chụp từ trên mái nhà, xe đạp đặt thẳng lên đó trông như đang bay.
 * Cho mái nhà tan vào một dải sương làm "mặt đất", thêm bóng đổ dưới hai bánh xe.
 * Đặt trong khung vuông đúng bằng chỗ ảnh xe được vẽ (ảnh vuông, object-contain, bám đáy) nên bóng luôn khớp bánh xe
 * dù heroFit.ts có thu nhỏ xe. Số đo bánh xe lấy từ ảnh hero-layer-4-subject.webp: bánh trước chạm đất ở (19%, 99%),
 * bánh sau và chân chống ở (66–82%, 95%) — mặt đất hơi nghiêng vì xe chụp chéo 3/4.
 */
function MobileGround() {
  return (
    <div
      aria-hidden="true"
      className="lobby-ground absolute bottom-0 left-1/2 aspect-square w-[min(100cqw,100cqh)] -translate-x-1/2 md:hidden"
    >
      <div className="lobby-ground__mist" />
      <div className="lobby-ground__shadow" />
      <div className="lobby-ground__contact left-[9%] w-[22%] [bottom:-1.5%]" />
      <div className="lobby-ground__contact left-[63%] w-[24%] [bottom:3%]" />
    </div>
  );
}
