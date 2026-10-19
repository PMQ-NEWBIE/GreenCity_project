/** Mọi đường dẫn trong web — đổi ở đây là đổi toàn bộ. */
export const ROUTES = {
  home: "/",
  login: "/dang-nhap",
  register: "/dang-ky",
  forgot: "/quen-mat-khau",
  dashboard: "/tong-quan",
  discover: "/kham-pha",
  product: (id: string) => `/san-pham/${encodeURIComponent(id)}`,
  sell: "/dang-tin",
  collect: "/thu-gom",
  favorites: "/yeu-thich",
  profile: "/ho-so",

  // Tính năng cơ bản (giao diện do Gemini làm)
  learn: "/kien-thuc",
  article: (slug: string) => `/kien-thuc/${encodeURIComponent(slug)}`,
  sortingGuide: "/kien-thuc/so-tay",
  points: "/diem-thuong",
  pointRules: "/diem-thuong/quy-tac",
  rewards: "/doi-qua",
  shops: "/gian-hang",
  shop: (slug: string) => `/gian-hang/${encodeURIComponent(slug)}`,
  swap: "/trao-doi",
  swapPost: "/trao-doi/dang",
  swapItem: (id: string) => `/trao-doi/${encodeURIComponent(id)}`,

  // Tính năng nâng cao
  collectRequest: (id: string) => `/thu-gom/${encodeURIComponent(id)}`,
  bins: "/thung-thu-gom",
  litterReport: "/bao-diem-rac",
  map: "/ban-do",
  consult: "/tu-van-phan-loai",
  materials: "/cho-vat-lieu",
  stats: "/thong-ke",
  ctv: "/cong-tac-vien",
  admin: "/quan-tri",
} as const;

/** Tham số trên URL dùng để quay lại đúng trang sau khi đăng nhập. */
export const NEXT_PARAM = "tiep";

/**
 * Chỉ chấp nhận đường dẫn nội bộ ("/kham-pha"), chặn "//evil.com" hay "https://..."
 * để không bị lợi dụng chuyển hướng ra ngoài.
 */
export function safeNextPath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return null;
  return value;
}

export function loginHref(next?: string) {
  return next ? `${ROUTES.login}?${NEXT_PARAM}=${encodeURIComponent(next)}` : ROUTES.login;
}
