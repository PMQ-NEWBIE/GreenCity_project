import gsap from "gsap";
import { LOBBY_MOTION, type LayerName } from "../config";

const layer = (root: HTMLElement, name: LayerName) => root.querySelector(`[data-layer="${name}"]`);

/**
 * Desktop / tablet: ghim hero rồi "bay xuyên" qua các lớp.
 * Mỗi lớp trôi lên (hệ số lớp × quãng ghim × parallaxTravel) px — lớp gần chạy nhiều hơn lớp xa.
 * Đồng thời: sương phóng to và tan, tiêu đề mờ dần, vật thể tiến lại gần, cuối cùng lớp màu
 * phủ lên đúng màu nền phần tính năng để chuyển cảnh liền mạch. scrub → cuộn ngược tua ngược chính xác.
 */
export function createHeroPin(root: HTMLElement, distanceFactor: number) {
  const P = LOBBY_MOTION.pin;
  const L = LOBBY_MOTION.layers;
  const hero = root.querySelector<HTMLElement>("[data-hero]");
  if (!hero) return;

  const distance = () => window.innerHeight * distanceFactor;
  const rise = (name: LayerName) => () => -L[name].scroll * distance() * LOBBY_MOTION.parallaxTravel;

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: () => `+=${distance()}`,
      pin: true,
      scrub: P.scrub,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  // Toàn bộ timeline dài 1 đơn vị → các mốc trong config là tỉ lệ quãng ghim
  tl.to(root.querySelector("[data-scroll-hint]"), { autoAlpha: 0, duration: 0.08 }, 0)
    .to(layer(root, "sky"), { y: rise("sky"), scale: 1.06, duration: 1 }, 0)
    .to(layer(root, "outline"), { y: rise("outline"), autoAlpha: 0, duration: 1 }, 0)
    .to(layer(root, "title"), { y: rise("title"), duration: 1 }, 0)
    .to(layer(root, "title"), { autoAlpha: 0, duration: P.titleFadeEnd }, 0)
    .to(layer(root, "subject"), { y: rise("subject"), scale: P.subjectScale, transformOrigin: "50% 100%", duration: 1 }, 0)
    .to(layer(root, "subject"), { autoAlpha: 0, duration: 1 - P.subjectFadeStart }, P.subjectFadeStart)
    .to(layer(root, "fog"), { y: rise("fog"), scale: P.fogScale, transformOrigin: "50% 100%", duration: P.fogFadeEnd }, 0)
    .to(layer(root, "fog"), { autoAlpha: 0, duration: P.fogFadeEnd / 2 }, P.fogFadeEnd / 2)
    .to(root.querySelector("[data-veil]"), { autoAlpha: 1, duration: 1 - P.veilStart }, P.veilStart);
}

/**
 * Điện thoại: không ghim (nhẹ hơn, không giật thanh địa chỉ). Parallax đơn giản khi hero cuộn qua:
 * lớp có hệ số nhỏ trôi chậm hơn trang → cảm giác ở xa.
 */
export function createHeroMobileParallax(root: HTMLElement) {
  const L = LOBBY_MOTION.layers;
  const hero = root.querySelector<HTMLElement>("[data-hero]");
  if (!hero) return;
  const lag = (name: LayerName) => () => (1 - L[name].scroll) * hero.offsetHeight * LOBBY_MOTION.mobileTravel;

  gsap
    .timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true },
    })
    .to(layer(root, "sky"), { y: lag("sky") }, 0)
    .to(layer(root, "title"), { y: lag("title"), autoAlpha: 0.2 }, 0)
    .to(layer(root, "subject"), { y: lag("subject") }, 0)
    .to(root.querySelector("[data-scroll-hint]"), { autoAlpha: 0, duration: 0.15 }, 0);
}
