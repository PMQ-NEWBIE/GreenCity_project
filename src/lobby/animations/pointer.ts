import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LOBBY_MOTION, type LayerName } from "../config";

/**
 * Mouse parallax (chỉ desktop có chuột): mỗi lớp lệch tối đa N px theo vị trí chuột,
 * làm mượt bằng gsap.quickTo. Chuột rời cửa sổ / cửa sổ mất focus → các lớp về vị trí gốc.
 * Tự tắt khi hero đã cuộn khỏi màn hình (phần tính năng chạm đỉnh) để không tốn CPU.
 */
export function startMouseParallax(root: HTMLElement): () => void {
  const { layers, mouse } = LOBBY_MOTION;
  const movers = (Object.keys(layers) as LayerName[]).flatMap((name) => {
    const el = root.querySelector(`[data-mouse="${name}"]`);
    if (!el) return [];
    return [
      {
        max: layers[name].mouse,
        x: gsap.quickTo(el, "x", { duration: mouse.duration, ease: mouse.ease }),
        y: gsap.quickTo(el, "y", { duration: mouse.duration, ease: mouse.ease }),
      },
    ];
  });

  let active = true;
  const reset = () => movers.forEach((m) => (m.x(0), m.y(0)));

  const onMove = (e: PointerEvent) => {
    if (!active || e.pointerType !== "mouse") return;
    const nx = (e.clientX / window.innerWidth) * 2 - 1; // -1 → 1
    const ny = (e.clientY / window.innerHeight) * 2 - 1;
    movers.forEach((m) => (m.x(nx * m.max), m.y(ny * m.max)));
  };
  const onOut = (e: MouseEvent) => {
    if (!e.relatedTarget) reset(); // chuột rời khỏi cửa sổ
  };

  const features = root.querySelector("[data-features]");
  const visibility = features
    ? ScrollTrigger.create({
        trigger: features,
        start: "top top",
        onEnter: () => ((active = false), reset()),
        onLeaveBack: () => (active = true),
      })
    : null;

  window.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("mouseout", onOut);
  window.addEventListener("blur", reset);

  return () => {
    window.removeEventListener("pointermove", onMove);
    document.removeEventListener("mouseout", onOut);
    window.removeEventListener("blur", reset);
    visibility?.kill();
  };
}

/** Nút "hút" nhẹ theo chuột khi rê vào (chỉ desktop có chuột). Không ẩn con trỏ. */
export function startMagnetic(root: HTMLElement): () => void {
  const { strength, duration } = LOBBY_MOTION.magnetic;
  const cleanups = Array.from(root.querySelectorAll<HTMLElement>("[data-magnetic]")).map((el) => {
    const xTo = gsap.quickTo(el, "x", { duration, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration, ease: "power3.out" });
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const onLeave = () => (xTo(0), yTo(0));
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  });
  return () => cleanups.forEach((fn) => fn());
}
