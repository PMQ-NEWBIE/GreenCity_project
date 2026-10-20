import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LOBBY_MOTION } from "../config";
import { INK_TRIGGER } from "../ink/config";
import { setInkInitial, buildInkTimeline, inkWrittenAt } from "./ink";

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
 * Trình tự: ảnh mở → số viết + mọc lá → h3 viết → cây mọc → mô tả và các bước trượt lên.
 */
export function revealFeatures(root: HTMLElement, clip: boolean) {
  const F = LOBBY_MOTION.features;
  const lite = !clip;

  root.querySelectorAll<HTMLElement>("[data-feature]").forEach((item) => {
    const media = item.querySelector("[data-feature-media]");
    const img = item.querySelector("[data-feature-img]");
    const text = item.querySelector("[data-feature-text]");
    const num = item.querySelector<HTMLElement>("[data-ink-number]");
    const heading = item.querySelector<HTMLElement>("[data-ink]:not([data-ink-number])");

    if (num) setInkInitial(num);
    if (heading) setInkInitial(heading);

    const tl = gsap.timeline({
      defaults: { ease: F.ease },
      scrollTrigger: { trigger: item, start: F.start, once: true },
    });

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

    const numStart = clip ? 0.2 : 0.1;
    let headingStart = numStart;
    // Timeline chữ lá chỉ dựng lúc khối được cuộn tới (dựng sẵn cả trang lúc tải = đơ intro hero);
    // lịch canh trước bằng inkWrittenAt(), rẻ, không đụng DOM.
    if (num) {
      tl.call(() => void buildInkTimeline(num, { lite }), undefined, numStart);
      headingStart = numStart + inkWrittenAt(num, { lite }) * 0.7;
    }

    let afterHeadingTime = headingStart + 0.5;
    if (heading) {
      tl.call(() => void buildInkTimeline(heading, { lite }), undefined, headingStart);
      // Mô tả hiện khi chữ viết xong, không chờ cây mọc
      afterHeadingTime = headingStart + inkWrittenAt(heading, { lite });
    }

    if (text) {
      const remainingChildren = Array.from(text.children).filter(
        (child) => !child.hasAttribute("data-ink-number") && !child.hasAttribute("data-ink")
      );
      if (remainingChildren.length) {
        tl.fromTo(
          remainingChildren,
          { autoAlpha: 0, y: F.textFromY },
          { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 },
          afterHeadingTime
        );
      }
    }
  });
}

/**
 * Viết tay khi cuộn tới cho các tiêu đề đứng riêng (đầu phần tính năng, CTA).
 * Tiêu đề hero chạy trong intro, tiêu đề + số của từng tính năng chạy trong revealFeatures().
 */
export function revealInkHeadings(root: HTMLElement, lite: boolean) {
  root.querySelectorAll<HTMLElement>("[data-ink]").forEach((el) => {
    if (el.closest("[data-hero], [data-feature]")) return;
    setInkInitial(el);
    // Dựng timeline khi cuộn tới, không dựng sẵn lúc tải trang
    ScrollTrigger.create({ trigger: el, start: INK_TRIGGER, once: true, onEnter: () => void buildInkTimeline(el, { lite }) });
  });
}
