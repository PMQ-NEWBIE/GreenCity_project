import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { LOBBY_MOTION } from "../config";

/**
 * Intro khi tải trang (~1.9s): nền zoom + hiện → chữ viền → tiêu đề từng ký tự →
 * vật thể + sương → slogan từng dòng → nút CTA, header, gợi ý cuộn.
 *
 * Trạng thái đầu được gsap.set() TRƯỚC khi thêm .is-ready (CSS đang ẩn [data-intro]),
 * nên không có khung hình nào lộ nội dung trước khi animation chạy.
 *
 * lite (điện thoại): nền + vật thể đã hiện sẵn từ khung hình đầu (xem lobby.css) để ảnh lớn
 * nhất hiện sớm trên máy yếu; chỉ chữ, nút và header chạy intro.
 */
export function playIntro(root: HTMLElement, { lite = false }: { lite?: boolean } = {}): gsap.core.Timeline {
  const I = LOBBY_MOTION.intro;
  const q = gsap.utils.selector(root);
  const title = root.querySelector<HTMLElement>("[data-split-title]");

  // aria: "auto" → giữ nguyên câu cho trình đọc màn hình (aria-label), ẩn các ký tự đã tách
  const split = title ? SplitText.create(title, { type: "words,chars", aria: "auto" }) : null;

  const sky = q("[data-mouse=sky]");
  const outline = q("[data-mouse=outline]");
  const subject = q("[data-mouse=subject]");
  const fog = q("[data-mouse=fog]");
  const slogan = q("[data-slogan-line]");
  const finale = q("[data-hero-cta], [data-hint-inner]");
  // Header chỉ đổi độ mờ — transform của header dành cho hiệu ứng ẩn/hiện khi cuộn (CSS)
  const header = q("[data-header]");

  if (!lite) {
    gsap.set(sky, { autoAlpha: 0, scale: I.sky.fromScale });
    gsap.set(subject, { autoAlpha: 0, y: I.subject.fromY });
  }
  gsap.set([outline, fog, header], { autoAlpha: 0 });
  if (split) gsap.set(split.chars, { autoAlpha: 0, yPercent: I.title.fromYPercent });
  gsap.set(slogan, { autoAlpha: 0, y: 18 });
  gsap.set(finale, { autoAlpha: 0, y: 16 });
  root.classList.add("is-ready");

  const titleEnd = I.title.at + I.title.duration + (split ? (split.chars.length - 1) * I.title.stagger : 0);

  const tl = gsap.timeline({
    defaults: { ease: "power3.out" },
    // Gộp lại DOM gốc sau intro: tiêu đề trở về một khối chữ bình thường
    onComplete: () => split?.revert(),
  });

  if (!lite) {
    tl.to(sky, { autoAlpha: 1, scale: 1, duration: I.sky.duration, ease: "power2.out" }, I.sky.at).to(
      subject,
      { autoAlpha: 1, y: 0, duration: I.subject.duration },
      I.subject.at
    );
  }
  tl.to(outline, { autoAlpha: 1, duration: I.outline.duration }, I.outline.at)
    .to(fog, { autoAlpha: 1, duration: I.fog.duration }, I.fog.at)
    .to(slogan, { autoAlpha: 1, y: 0, duration: I.slogan.duration, stagger: I.slogan.stagger }, titleEnd - I.slogan.overlap);

  if (split) {
    tl.to(
      split.chars,
      { autoAlpha: 1, yPercent: 0, duration: I.title.duration, stagger: I.title.stagger, ease: I.title.ease },
      I.title.at
    );
  }

  tl.to(finale, { autoAlpha: 1, y: 0, duration: I.finale.duration, stagger: 0.08 }, `>-${I.finale.overlap}`).to(
    header,
    { autoAlpha: 1, duration: I.finale.duration },
    "<"
  );
  return tl;
}

/** Người dùng bật "giảm chuyển động": không zoom, không tách chữ — chỉ hiện dần ngắn. */
export function playReducedIntro(root: HTMLElement) {
  // Nền + vật thể hiện thẳng (không cần hiệu ứng), chỉ chữ/nút hiện dần
  const items = root.querySelectorAll('[data-intro]:not([data-intro="desktop"])');
  gsap.set(items, { autoAlpha: 0 });
  root.classList.add("is-ready");
  gsap.to(items, { autoAlpha: 1, duration: 0.4, ease: "power1.out" });
}
