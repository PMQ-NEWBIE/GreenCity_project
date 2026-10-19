import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LOBBY_MOTION } from "../config";

/**
 * Lenis đồng bộ với ScrollTrigger:
 * - ScrollTrigger.update chạy trong sự kiện scroll của Lenis
 * - Lenis chạy trên gsap.ticker (một vòng lặp duy nhất, không thêm requestAnimationFrame riêng)
 * - Tắt lagSmoothing để cuộn không bị "giật bù" sau khung hình chậm
 */
export function startSmoothScroll(): () => void {
  const lenis = new Lenis({ lerp: LOBBY_MOTION.smoothScroll.lerp, anchors: true });
  lenis.on("scroll", ScrollTrigger.update);

  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(tick);
    gsap.ticker.lagSmoothing(500, 33); // trả lại mặc định của GSAP cho các trang khác
    lenis.destroy();
  };
}
