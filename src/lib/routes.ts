/** Mọi đường dẫn trong web — đổi ở đây là đổi toàn bộ. */
export const ROUTES = {
  home: "/",
  login: "/dang-nhap",
  register: "/dang-ky",
  forgot: "/quen-mat-khau",
  /** Điểm vào sau đăng nhập: tự chuyển tới trang chủ đúng vai trò / chế độ (xem homeFor) */
  dashboard: "/tong-quan",
  product: (id: string) => `/san-pham/${encodeURIComponent(id)}`,
  order: (id: string) => `/don/${encodeURIComponent(id)}`,
  profile: "/ho-so",

  // Người dân — chế độ bán
  sellerHome: "/ban-hang",
  sellerOrders: "/ban-hang/don",
  myListings: "/ban-hang/tin",
  sell: "/dang-tin",
  collect: "/thu-gom",

  // Người dân — chế độ mua
  discover: "/kham-pha",
  buyerOrders: "/don-mua",
  favorites: "/yeu-thich",

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

  // Khu làm việc riêng (khung trang riêng, không có menu mua bán của người dân)
  /** Đối tác thu mua phế liệu (người ve chai, vựa) */
  partner: "/doi-tac",
  partnerListing: (id: string) => `/doi-tac/tin/${encodeURIComponent(id)}`,
  partnerOrders: "/doi-tac/don",
  partnerOrder: (id: string) => `/doi-tac/don/${encodeURIComponent(id)}`,
  /** Yêu cầu "gọi người tới lấy" của người dân — người mua tự nhận */
  partnerPickups: "/doi-tac/thu-gom",
  partnerPickup: (id: string) => `/doi-tac/thu-gom/${encodeURIComponent(id)}`,
  partnerLots: "/doi-tac/lo",
  partnerDemands: "/doi-tac/nhu-cau",
  /** Nhóm vận hành */
  admin: "/van-hanh",
  opsPickup: (id: string) => `/van-hanh/thu-gom/${encodeURIComponent(id)}`,
  opsMaterials: "/van-hanh/vat-lieu",
  opsStats: "/van-hanh/thong-ke",
  /** Cộng tác viên — người trực điểm thu gom */
  ctv: "/cong-tac-vien",
  ctvGifts: "/cong-tac-vien/trao-qua",
  ctvLots: "/cong-tac-vien/lo",
  ctvDemands: "/cong-tac-vien/nhu-cau",
  /** Doanh nghiệp tái chế */
  materials: "/doanh-nghiep",
  stats: "/doanh-nghiep/thong-ke",
  businessDemands: "/doanh-nghiep/nhu-cau",
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
