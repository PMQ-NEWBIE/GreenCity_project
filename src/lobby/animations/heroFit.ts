import { LOBBY_MEDIA } from "../config";

/**
 * GIỮ CHỖ CHO SLOGAN + NÚT Ở HERO, MỌI TỈ LỆ MÀN HÌNH.
 *
 * Chữ và nút xếp theo CHIỀU RỘNG màn hình (cỡ chữ theo vw), còn lớp lá (lớp 5) và xe đạp (lớp 4)
 * bám theo CHIỀU CAO / mép dưới → màn hình thấp (laptop 1366×650, trình duyệt nhiều thanh công cụ)
 * thì lá trồi lên che nút, xe đạp che slogan. CSS không biết nút đang nằm ở đâu, nên đo bằng JS:
 *  - Lớp lá: giữ nguyên tỉ lệ ảnh (không bị cắt ngang), chỉ hạ xuống dưới mép màn hình cho tới khi
 *    ngọn lá cao nhất thấp hơn nút ít nhất GAP.
 *  - Xe đạp: nếu đè lên vùng slogan + nút thì thu nhỏ (giữ góc dưới-phải) tới khi hết đè.
 * Đo bằng offsetTop/offsetLeft (bố cục gốc) nên không lệch vì transform của intro, parallax, ghim.
 */

/** Ảnh lớp 5: phần trên trong suốt tới 43% chiều cao, lá bắt đầu từ đó */
const FOG_LEAF_START = 0.43;
/** Lá chiếm tối đa chừng này chiều cao khung, kể cả khi còn dư chỗ */
const FOG_MAX_SHARE = 0.32;
/** Khoảng trống tối thiểu giữa nút và lá / xe đạp (px) */
const GAP = 24;
/** Điện thoại: xe đạp nhỏ hơn mức này thì ẩn luôn còn hơn đè lên nút */
const SUBJECT_MIN = 96;

interface Box {
  right: number;
  bottom: number;
}

/** Vùng cần giữ trống: từ slogan tới hết hàng nút, tính theo khung hero */
function protectedBox(cta: HTMLElement, slogan: HTMLElement | null): Box {
  let right = 0;
  for (const el of Array.from(cta.children) as HTMLElement[]) {
    if (el.offsetWidth) right = Math.max(right, el.offsetLeft + el.offsetWidth);
  }
  if (slogan) right = Math.max(right, slogan.offsetLeft + slogan.offsetWidth);
  return { right, bottom: cta.offsetTop + cta.offsetHeight };
}

function fitFog(fog: HTMLElement, heroH: number, box: Box) {
  fog.style.bottom = "";
  if (!fog.offsetWidth) return; // ẩn trên điện thoại
  const leaf = fog.offsetHeight * (1 - FOG_LEAF_START);
  const drop = Math.max(0, leaf - heroH * FOG_MAX_SHARE, box.bottom + GAP - (heroH - leaf));
  fog.style.bottom = `${-Math.round(drop)}px`;
}

function fitSubject(subject: HTMLElement, box: Box, mobile: boolean) {
  subject.style.width = "";
  subject.style.height = "";
  subject.style.display = "";
  if (!subject.offsetWidth) return; // điện thoại đã có ảnh hero dọc → lớp xe đạp ẩn
  const left = subject.offsetLeft;
  const top = subject.offsetTop;
  const w = subject.offsetWidth;
  const h = subject.offsetHeight;
  const drawn = Math.min(w, h); // ảnh vuông, object-contain + object-bottom
  const drawnTop = top + h - drawn;

  if (mobile) {
    // Xe đạp nằm giữa, dưới nút → chỉ có thể né theo chiều dọc
    const room = top + h - (box.bottom + GAP);
    if (drawnTop >= box.bottom + GAP) return;
    if (room < SUBJECT_MIN) subject.style.display = "none";
    else subject.style.height = `${Math.floor(room)}px`;
    return;
  }

  const drawnLeft = left + (w - drawn) / 2;
  if (drawnLeft >= box.right + GAP || drawnTop >= box.bottom + GAP) return;
  // Thu nhỏ quanh góc dưới-phải: hoặc lùi sang phải cho hết đè, hoặc hạ thấp xuống dưới nút — lấy cách giữ xe to hơn
  const byWidth = left + w - (box.right + GAP);
  const byHeight = top + h - (box.bottom + GAP);
  const size = Math.max(0, Math.min(drawn, Math.max(byWidth, byHeight)));
  subject.style.width = `${Math.floor(size)}px`;
}

/** Bắt đầu canh lại khi đổi kích thước / font tải xong. Trả về hàm dọn. */
export function startHeroFit(root: HTMLElement): () => void {
  const hero = root.querySelector<HTMLElement>("[data-hero]");
  const cta = hero?.querySelector<HTMLElement>("[data-hero-cta]");
  if (!hero || !cta) return () => {};
  const slogan = hero.querySelector<HTMLElement>("[data-slogan-line]")?.parentElement ?? null;
  const title = hero.querySelector<HTMLElement>("[data-ink]");
  const fog = hero.querySelector<HTMLElement>('[data-layer="fog"]');
  const subject = hero.querySelector<HTMLElement>('[data-layer="subject"]');
  const mobileMq = window.matchMedia(LOBBY_MEDIA.mobile);

  const fit = () => {
    const box = protectedBox(cta, slogan);
    if (fog) fitFog(fog, hero.clientHeight, box);
    if (subject) fitSubject(subject, box, mobileMq.matches);
  };

  fit();
  // Quan sát hero và mọi khối nằm TRÊN nút: tiêu đề / slogan cao lên thì nút bị đẩy xuống mà kích thước
  // của chính nút không đổi → phải theo dõi cả chúng. fit() chỉ sửa lá / xe đạp nên không tự kích hoạt lại.
  const ro = new ResizeObserver(fit);
  ro.observe(hero);
  ro.observe(cta);
  if (slogan) ro.observe(slogan);
  if (title) ro.observe(title);
  // Font tải xong có thể đổi chỗ xuống dòng của slogan trước khi ResizeObserver kịp báo
  let alive = true;
  document.fonts?.ready.then(() => alive && fit());
  window.addEventListener("load", fit, { once: true });
  return () => {
    alive = false;
    window.removeEventListener("load", fit);
    ro.disconnect();
    if (fog) fog.style.bottom = "";
    if (subject) {
      subject.style.width = "";
      subject.style.height = "";
      subject.style.display = "";
    }
  };
}
