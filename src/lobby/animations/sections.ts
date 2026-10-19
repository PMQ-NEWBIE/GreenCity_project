import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LOBBY_MOTION } from "../config";

/**
 * Header: quá 80px → nền mờ + thu nhỏ (.is-scrolled); cuộn xuống → ẩn, cuộn lên → hiện (.is-hidden).
 * Chỉ bật/tắt class trên DOM — CSS lo phần chuyển động (transform/opacity), React không render lại.
 */
export function startHeaderBehavior(root: HTMLElement) {
  const header = root.querySelector<HTMLElement>("[data-header]");
  if (!header) return;
  const H = LOBBY_MOTION.header;

  const apply = (y: number, direction: number) => {
    header.classList.toggle("is-scrolled", y > H.scrolledAfter);
    if (y <= H.hideAfter || direction < 0) header.classList.remove("is-hidden");
    else if (direction > 0) header.classList.add("is-hidden");
  };

  const st = ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => apply(self.scroll(), self.direction),
  });
  apply(st.scroll(), 0); // mở trang khi đã ở giữa (tải lại trang)
}

/**
 * Phần tính năng: mỗi khối hiện khi cuộn tới.
 * clip = true → hình mở bằng clip-path (màn hình lớn); false → chỉ trượt + hiện (điện thoại).
 */
export function revealFeatures(root: HTMLElement, clip: boolean) {
  const F = LOBBY_MOTION.features;
  root.querySelectorAll<HTMLElement>("[data-feature]").forEach((item) => {
    const media = item.querySelector("[data-feature-media]");
    const img = item.querySelector("[data-feature-img]");
    const text = item.querySelector("[data-feature-text]");
    const tl = gsap.timeline({ defaults: { ease: F.ease }, scrollTrigger: { trigger: item, start: F.start, once: true } });

    if (clip) {
      tl.fromTo(
        media,
        { clipPath: "inset(100% 0% 0% 0% round 28px)" },
        { clipPath: "inset(0% 0% 0% 0% round 28px)", duration: F.clipDuration },
        0
      ).fromTo(img, { scale: F.imageFromScale }, { scale: 1, duration: F.clipDuration * 1.2 }, 0);
    } else {
      tl.fromTo(media, { autoAlpha: 0, y: F.textFromY }, { autoAlpha: 1, y: 0, duration: 0.7 }, 0);
    }
    if (text) {
      tl.fromTo(
        text.children,
        { autoAlpha: 0, y: F.textFromY },
        { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 },
        clip ? 0.25 : 0.1
      );
    }
  });
}
