import gsap from "gsap";

/** Thời gian xe chạy hết khung (giây) — khớp với lúc trời ngày mờ dần sang đêm trong lobby.css */
const RIDE_DURATION = 1.5;
/** Hai nửa nền ngày trên điện thoại trượt ra / khép lại (giây) */
const DOOR_DURATION = 0.9;
/** Sang tối: cửa bắt đầu mở khi xe đã chạy gần hết khung (giây kể từ lúc bấm) */
const DOOR_OPEN_AT = 1.2;
/** Xe nảy nhẹ khi lăn bánh: biên độ (px) và nhịp (giây mỗi lần lên hoặc xuống) */
const BUMP = { y: -3, beat: 0.12 };

/**
 * Vị trí đường chân trời (px tính từ mép trên khung ảnh) theo cách ảnh thật sự được vẽ:
 * object-fit contain / cover, bám đáy (object-bottom).
 */
function horizonY(img: HTMLImageElement, ratio: number): number {
  const box = img.getBoundingClientRect();
  const nw = img.naturalWidth || 1080;
  const nh = img.naturalHeight || 1920;
  const fit = getComputedStyle(img).objectFit === "contain" ? Math.min : Math.max;
  const drawnH = nh * fit(box.width / nw, box.height / nh);
  return box.height - drawnH + ratio * drawnH;
}

/**
 * YÊU CẦU CỦA NGƯỜI DÙNG (2026-10-21): đổi sáng ↔ tối trên lobby thì ban đêm xe ve chai đã đi về.
 * - Sáng → tối: xe chạy về phía trước (đầu xe quay sang trái) ra khỏi khung rồi ẩn — KHÔNG giữ xe làm tối đi.
 *   Điện thoại: tiếp đó nền ngày tách đôi ở đường chân trời, nửa trên trượt lên, nửa dưới trượt xuống → lộ phố đêm.
 * - Tối → sáng: làm ngược lại — (điện thoại) 2 nửa nền khép lại, rồi xe chạy vào từ mép phải, dừng đúng chỗ cũ.
 * Desktop: xe ở lớp 4, trời đổi bằng opacity trong lobby.css. Điện thoại: lớp xe + 2 nửa nền tách từ ảnh hero dọc
 * (npm run assets:split-mobile-hero). Theo dõi lớp .dark trên <html> (ThemeToggle gắn ngay khi bấm).
 * Chạy trên tầng [data-ride] / [data-door] riêng nên không đè transform của cuộn (data-layer) và chuột (data-mouse).
 * MutationObserver chạy trước khung hình kế tiếp → kịp hiện lại xe / cửa trước khi CSS `.dark [data-ride]` ẩn chúng.
 */
export function startThemeRide(root: HTMLElement, reduced: boolean): () => void {
  // Desktop: xe ở lớp 4. Điện thoại: lớp xe tách từ ảnh hero dọc + 2 nửa nền ngày (cửa).
  const rides = Array.from(root.querySelectorAll<HTMLElement>("[data-ride]"));
  const doorsBox = root.querySelector<HTMLElement>("[data-doors]");
  const doors = {
    top: root.querySelector<HTMLElement>('[data-door="top"]'),
    bottom: root.querySelector<HTMLElement>('[data-door="bottom"]'),
  };
  const all = [...rides, doors.top, doors.bottom].filter((e): e is HTMLElement => !!e);
  if (all.length === 0) return () => {};
  const isDark = () => document.documentElement.classList.contains("dark");
  let dark = isDark();
  let tl: gsap.core.Timeline | null = null;
  gsap.set(all, { autoAlpha: dark ? 0 : 1, x: 0, y: 0 });

  /** Cắt 2 nửa đúng đường chân trời; trả về quãng mỗi nửa phải trượt để ra hẳn khỏi khung */
  const cutDoors = () => {
    const img = doors.top?.querySelector("img");
    if (!doorsBox || !doors.top || !doors.bottom || !img || !doors.top.offsetWidth) return null;
    const h = doors.top.getBoundingClientRect().height;
    const y = horizonY(img, Number(doorsBox.dataset.doors));
    doors.top.style.clipPath = `inset(0 0 ${h - y}px 0)`;
    doors.bottom.style.clipPath = `inset(${y}px 0 0 0)`;
    return { up: -(y + 20), down: h - y + 20 };
  };

  const observer = new MutationObserver(() => {
    const next = isDark();
    if (next === dark) return;
    dark = next;
    tl?.kill();
    const visibleRides = rides.filter((r) => r.offsetWidth > 0);
    gsap.set(all, { autoAlpha: dark ? 0 : 1, x: 0, y: 0 });
    // Người dùng tắt chuyển động: đổi ngay
    if (reduced) return;
    const cut = cutDoors();
    const bump = { y: BUMP.y, duration: BUMP.beat, repeat: Math.round(RIDE_DURATION / BUMP.beat) - 1, yoyo: true, ease: "sine.inOut" };
    tl = gsap.timeline();

    if (dark) {
      // 1. Xe chạy về phía trước (sang trái) ra khỏi khung
      for (const ride of visibleRides) {
        const box = ride.getBoundingClientRect();
        tl.set(ride, { autoAlpha: 1 }, 0)
          .to(ride, { x: -(box.right + 40), duration: RIDE_DURATION, ease: "power2.in" }, 0)
          .to(ride, bump, 0)
          .set(ride, { autoAlpha: 0, x: 0, y: 0 }, RIDE_DURATION);
      }
      // 2. Điện thoại: nền ngày tách đôi ở chân trời — nửa trên lên, nửa dưới xuống — lộ phố đêm
      if (cut && doors.top && doors.bottom) {
        tl.set([doors.top, doors.bottom], { autoAlpha: 1 }, 0)
          .to(doors.top, { y: cut.up, duration: DOOR_DURATION, ease: "power3.inOut" }, DOOR_OPEN_AT)
          .to(doors.bottom, { y: cut.down, duration: DOOR_DURATION, ease: "power3.inOut" }, DOOR_OPEN_AT)
          .set([doors.top, doors.bottom], { autoAlpha: 0, y: 0 });
      }
    } else {
      // 1. Điện thoại: 2 nửa nền ngày khép lại (trên hạ xuống, dưới nâng lên)
      let rideAt = 0;
      if (cut && doors.top && doors.bottom) {
        tl.set(doors.top, { autoAlpha: 1, y: cut.up }, 0)
          .set(doors.bottom, { autoAlpha: 1, y: cut.down }, 0)
          .to([doors.top, doors.bottom], { y: 0, duration: DOOR_DURATION, ease: "power3.inOut" }, 0);
        rideAt = DOOR_DURATION - 0.1;
      }
      // 2. Xe chạy vào từ mép phải, dừng đúng chỗ cũ (trên điện thoại: sau khi cửa đã khép)
      for (const ride of visibleRides) {
        const box = ride.getBoundingClientRect();
        tl.set(ride, { autoAlpha: rideAt ? 0 : 1, x: window.innerWidth - box.left + 40 }, 0)
          .set(ride, { autoAlpha: 1 }, rideAt)
          .to(ride, { x: 0, duration: RIDE_DURATION, ease: "power2.out" }, rideAt)
          .to(ride, bump, rideAt)
          .set(ride, { y: 0 }, rideAt + RIDE_DURATION);
      }
    }
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => {
    observer.disconnect();
    tl?.kill();
  };
}
