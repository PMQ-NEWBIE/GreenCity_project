/**
 * TIÊU ĐỀ CHỮ LÁ — một kiểu cho cả trang:
 *  1. Ngòi bút chạy dọc đường tâm từng nét, đúng thứ tự tay viết (chữ trước, dấu thanh sau cả từ).
 *  2. Ngay sau đầu bút, lá mọc ra dọc theo nét (mỗi chồi là một mảnh hình lá lớn dần từ cuống).
 *  3. Viết xong một từ: cây của từ đó mọc — lá vắt rơi xuống đỉnh chữ rồi rũ xuống, hoa nở.
 *
 * hero: tiêu đề đầu trang (chạy trong intro) · leaf: tiêu đề các phần (chạy khi cuộn tới)
 * chalk: như leaf nhưng lá sáng, cho nền tối (CTA)
 */
export type InkVariant = "hero" | "leaf" | "chalk";

/** Độ rộng ngòi bút (đơn vị font). Thân chữ đậm nhất 171; `npm run ink:check` xác nhận phủ kín cả góc vuông. */
export const INK_PEN = 230;

/** Nhịp viết. Thời lượng mỗi nét theo độ dài (speed đơn vị/giây), kẹp trong [minStroke, maxStroke]. */
export const INK_WRITE = {
  speed: 9000,
  minStroke: 0.07,
  maxStroke: 0.34,
  /** nhấc bút giữa hai nét của một chữ / giữa hai chữ / giữa hai từ (giây, trước khi co giãn) */
  lift: 0.03,
  glyphGap: 0.05,
  wordGap: 0.12,
  ease: "sine.inOut",
  /** hero co giãn đúng bằng thời lượng này; tiêu đề khác chỉ co lại nếu dài hơn */
  duration: {
    hero: { full: 3.2, lite: 2.2 },
    section: { full: 2.0, lite: 1.4 },
  },
} as const;

/**
 * Lá mọc theo nét: chồi hình lá đặt dọc đường tâm, cách nhau `step` đơn vị (điện thoại thưa hơn),
 * dài `length`, chĩa lệch khỏi chiều nét `angle` độ, xen kẽ hai bên. Chồi lớn dần ngay sau đầu bút (`lag`).
 * Viết xong từ: phần lá còn hở (giữa các chồi) lấp kín trong `fill`.
 */
export const INK_GROW = {
  step: 70,
  liteStep: 105,
  length: [210, 300] as const,
  angle: [25, 60] as const,
  lag: 0.04,
  duration: 0.6,
  ease: "back.out(1.6)",
  fill: { delay: 0.3, duration: 0.6 },
} as const;

/** Lá vắt: rơi từ `fallFrom` đơn vị phía trên xuống đỉnh chữ, phần phiến lá rủ xuống rồi nhún vài nhịp */
export const INK_DRAPE = {
  fallFrom: 420,
  fall: 0.55,
  drop: 0.3,
  settle: 1.5,
} as const;

/** Lá vắt / lá rủ đung đưa nhẹ quanh điểm tựa sau intro (hero, máy tính) */
export const INK_SWAY = { deg: 2.5, duration: [2.6, 3.4] as const };

/** Tiêu đề ngoài hero bắt đầu viết khi mép trên chạm mốc này */
export const INK_TRIGGER = "top 80%";

/** Ảnh lá phủ lòng chữ + độ đậm bóng đổ ra ngoài chữ */
export const INK_LEAFY: Record<InkVariant, { foliage: "dark" | "light"; dropShadow: number }> = {
  hero: { foliage: "dark", dropShadow: 0.38 },
  leaf: { foliage: "dark", dropShadow: 0.3 },
  chalk: { foliage: "light", dropShadow: 0.55 },
};
