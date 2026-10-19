/**
 * THÔNG SỐ ANIMATION CỦA LOBBY — chỉnh ở đây, không cần sửa component.
 * Đơn vị thời gian: giây. Khoảng cách: px trừ khi ghi khác.
 */

/** Điều kiện màn hình dùng cho gsap.matchMedia(). */
export const LOBBY_MEDIA = {
  /** ≥1024px: đủ 5 lớp, mouse parallax, ghim hero */
  desktop: "(min-width: 1024px)",
  /** 768–1023px: đủ 5 lớp, không mouse parallax, ghim ngắn hơn */
  tablet: "(min-width: 768px) and (max-width: 1023.98px)",
  /** <768px: 3 lớp (nền, tiêu đề, vật thể), không ghim */
  mobile: "(max-width: 767.98px)",
  motionOK: "(prefers-reduced-motion: no-preference)",
  reduceMotion: "(prefers-reduced-motion: reduce)",
  /** Chuột thật (không phải màn hình cảm ứng) — điều kiện cho mouse parallax & magnetic button */
  finePointer: "(hover: hover) and (pointer: fine)",
} as const;

export const LOBBY_MOTION = {
  /**
   * 5 lớp hero, xa → gần.
   * - scroll: hệ số parallax khi cuộn. Lớp đi được (scroll × quãng ghim × parallaxTravel) px.
   *   Số càng lớn lớp càng "gần" người xem; >1 nghĩa là chạy nhanh hơn tốc độ cuộn.
   * - mouse: độ lệch tối đa (px) theo vị trí chuột.
   */
  layers: {
    sky: { scroll: 0.1, mouse: 5 },
    outline: { scroll: 0.3, mouse: 10 },
    title: { scroll: 0.5, mouse: 15 },
    subject: { scroll: 0.6, mouse: 20 },
    fog: { scroll: 1.2, mouse: 30 },
  },
  /** Hệ số quy đổi quãng cuộn → quãng lớp di chuyển (0.4 = 40% quãng ghim × hệ số lớp). */
  parallaxTravel: 0.4,
  /** Điện thoại (không ghim): lớp tụt lại (1 − hệ số) × chiều cao hero × mobileTravel khi cuộn qua. */
  mobileTravel: 0.5,

  /** Mouse parallax: thời gian bám theo chuột (càng lớn càng "lì", mượt). */
  mouse: { duration: 0.9, ease: "power3.out" },

  /** Intro khi tải trang — tổng khoảng 1.8–2s. Mốc `at` tính từ lúc bắt đầu. */
  intro: {
    sky: { at: 0, duration: 1.4, fromScale: 1.1 },
    outline: { at: 0.2, duration: 1.0 },
    title: { at: 0.25, duration: 0.9, stagger: 0.03, ease: "expo.out", fromYPercent: 100 },
    subject: { at: 0.35, duration: 1.1, fromY: 60 },
    fog: { at: 0.4, duration: 1.2 },
    /** Slogan: bắt đầu trước khi tiêu đề chạy xong bấy nhiêu giây */
    slogan: { overlap: 0.45, duration: 0.6, stagger: 0.12 },
    /** Nút CTA + header + gợi ý cuộn hiện cuối cùng */
    finale: { overlap: 0.25, duration: 0.5 },
  },

  /** Đoạn ghim hero và "bay xuyên" qua các lớp. */
  pin: {
    /** Quãng ghim = hệ số × chiều cao màn hình (1.5 = 150%) */
    desktopDistance: 1.5,
    tabletDistance: 0.9,
    /** Độ "trễ" bám theo thanh cuộn (giây). 1 = mượt, 0 = bám chặt */
    scrub: 1,
    /** Các mốc dưới đây là tỉ lệ 0 → 1 trên quãng ghim */
    fogScale: 1.8, // mây/sương phía trước phóng to rồi tan
    fogFadeEnd: 0.6,
    titleFadeEnd: 0.45, // tiêu đề mờ hẳn ở 45% quãng ghim
    subjectScale: 1.35, // vật thể chính tiến lại gần
    subjectFadeStart: 0.72, // camera "đi xuyên" qua vật thể
    veilStart: 0.7, // lớp màu chuyển sang phần tính năng bắt đầu phủ
  },

  /** Header: đổi nền sau X px; cuộn xuống quá Y px thì ẩn, cuộn lên hiện lại. */
  header: { scrolledAfter: 80, hideAfter: 200 },

  /** Phần tính năng: hình mở bằng clip-path, chữ trượt lên. */
  features: { start: "top 78%", clipDuration: 1.1, ease: "power3.out", imageFromScale: 1.15, textFromY: 28 },

  /** Nút hút theo chuột (chỉ desktop có chuột). strength = tỉ lệ lệch theo khoảng cách chuột. */
  magnetic: { strength: 0.28, duration: 0.5 },

  /** Lenis smooth scroll: lerp nhỏ = trôi lâu hơn. */
  smoothScroll: { lerp: 0.1 },
} as const;

export type LayerName = keyof typeof LOBBY_MOTION.layers;
