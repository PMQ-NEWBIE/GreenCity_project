import type { UserRole } from "@/types";
import { ROUTES } from "./routes";

/** Trang xem được khi chưa đăng nhập. */
const PUBLIC_PREFIXES: string[] = [ROUTES.learn, ROUTES.pointRules, ROUTES.shops, ROUTES.map];

/** Trang chỉ một số vai trò được vào. */
const ROLE_PREFIXES: { prefix: string; roles: UserRole[] }[] = [
  { prefix: ROUTES.materials, roles: ["business", "operator"] },
  { prefix: ROUTES.stats, roles: ["business", "operator"] },
  { prefix: ROUTES.ctv, roles: ["collaborator", "operator"] },
  { prefix: ROUTES.admin, roles: ["operator"] },
];

/** "/kien-thuc" khớp "/kien-thuc" và "/kien-thuc/abc", không khớp "/kien-thuc-moi". */
function under(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((p) => under(pathname, p));
}

/** null = mọi vai trò đều vào được. */
export function rolesFor(pathname: string): UserRole[] | null {
  return ROLE_PREFIXES.find((r) => under(pathname, r.prefix))?.roles ?? null;
}

export function canAccess(pathname: string, role: UserRole): boolean {
  const roles = rolesFor(pathname);
  return !roles || roles.includes(role);
}

/**
 * Bản demo: vai trò suy ra từ email đăng nhập.
 * ctv@… → cộng tác viên · doanhnghiep@… → doanh nghiệp · vanhanh@… → vận hành · còn lại → người dân.
 */
export function roleFromEmail(email: string): UserRole {
  const local = email.trim().toLowerCase().split("@")[0];
  if (local === "ctv") return "collaborator";
  if (local === "doanhnghiep") return "business";
  if (local === "vanhanh") return "operator";
  return "resident";
}
