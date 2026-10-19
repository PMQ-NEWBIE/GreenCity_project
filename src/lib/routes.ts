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
