import gsap from "gsap";

/** Thời gian xe chạy hết khung (giây) — khớp với lúc trời ngày mờ dần sang đêm trong lobby.css */
const RIDE_DURATION = 1.5;
/** Xe nảy nhẹ khi lăn bánh: biên độ (px) và nhịp (giây mỗi lần lên hoặc xuống) */
const BUMP = { y: -3, beat: 0.12 };

/**
 * YÊU CẦU CỦA NGƯỜI DÙNG (2026-10-21): đổi sáng ↔ tối trên lobby thì ban đêm xe ve chai đã đi về.
 * - Sáng → tối: xe chạy về phía trước (đầu xe quay sang trái) ra khỏi khung rồi ẩn — KHÔNG giữ xe làm tối đi.
 * - Tối → sáng: xe chạy vào từ mép phải, dừng đúng chỗ cũ.
 * Desktop: xe ở lớp 4. Điện thoại: lớp xe tách từ ảnh hero dọc (npm run assets:split-mobile-hero).
 * Theo dõi lớp .dark trên <html> (ThemeToggle gắn ngay khi bấm). Chạy trên tầng [data-ride] riêng
 * nên không đè transform của cuộn (data-layer) và chuột (data-mouse).
 * MutationObserver chạy trước khung hình kế tiếp → kịp hiện lại xe trước khi CSS `.dark [data-ride]` ẩn nó.
 */
export function startThemeRide(root: HTMLElement, reduced: boolean): () => void {
  const rides = Array.from(root.querySelectorAll<HTMLElement>("[data-ride]"));
  if (rides.length === 0) return () => {};
  const isDark = () => document.documentElement.classList.contains("dark");
  let dark = isDark();
  let tl: gsap.core.Timeline | null = null;
  gsap.set(rides, { autoAlpha: dark ? 0 : 1, x: 0, y: 0 });

  const observer = new MutationObserver(() => {
    const next = isDark();
    if (next === dark) return;
    dark = next;
    tl?.kill();
    const visible = rides.filter((r) => r.offsetWidth > 0);
    gsap.set(rides, { autoAlpha: dark ? 0 : 1, x: 0, y: 0 });
    // Người dùng tắt chuyển động: đổi ngay
    if (reduced || visible.length === 0) return;
    const bump = { y: BUMP.y, duration: BUMP.beat, repeat: Math.round(RIDE_DURATION / BUMP.beat) - 1, yoyo: true, ease: "sine.inOut" };
    tl = gsap.timeline();
    for (const ride of visible) {
      const box = ride.getBoundingClientRect();
      if (dark) {
        tl.set(ride, { autoAlpha: 1 }, 0)
          .to(ride, { x: -(box.right + 40), duration: RIDE_DURATION, ease: "power2.in" }, 0)
          .to(ride, bump, 0)
          .set(ride, { autoAlpha: 0, x: 0, y: 0 }, RIDE_DURATION);
      } else {
        tl.set(ride, { autoAlpha: 1, x: window.innerWidth - box.left + 40 }, 0)
          .to(ride, { x: 0, duration: RIDE_DURATION, ease: "power2.out" }, 0)
          .to(ride, bump, 0)
          .set(ride, { y: 0 }, RIDE_DURATION);
      }
    }
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => {
    observer.disconnect();
    tl?.kill();
  };
}
