import type { UserRole } from "@/types";
import { ROUTES } from "./routes";

/** Chế độ của người dân: đang mua hay đang bán (một tài khoản dùng cả hai). */
export type AppMode = "buy" | "sell";

/** Trang xem được khi chưa đăng nhập. */
const PUBLIC_PREFIXES: string[] = [ROUTES.learn, ROUTES.pointRules, ROUTES.shops, ROUTES.map];

/**
 * Khu làm việc riêng của nhân sự và đối tác — khung trang riêng (WorkspaceShell), không có menu mua bán.
 * Thứ tự: đường dẫn dài trước để khớp đúng.
 */
const WORKSPACE_PREFIXES: { prefix: string; roles: UserRole[] }[] = [
  { prefix: ROUTES.partner, roles: ["partner"] },
  { prefix: ROUTES.admin, roles: ["operator"] },
  { prefix: ROUTES.ctv, roles: ["collaborator", "operator"] },
  { prefix: ROUTES.materials, roles: ["business", "operator"] },
];

/** "/kien-thuc" khớp "/kien-thuc" và "/kien-thuc/abc", không khớp "/kien-thuc-moi". */
export function under(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((p) => under(pathname, p));
}

export function isWorkspacePath(pathname: string): boolean {
  return WORKSPACE_PREFIXES.some((w) => under(pathname, w.prefix));
}

/** null = mọi vai trò đều vào được. */
export function rolesFor(pathname: string): UserRole[] | null {
  return WORKSPACE_PREFIXES.find((r) => under(pathname, r.prefix))?.roles ?? null;
}

export function canAccess(pathname: string, role: UserRole): boolean {
  const roles = rolesFor(pathname);
  return !roles || roles.includes(role);
}

/** Người dân dùng trang mua bán; mọi vai trò khác làm việc trong khu riêng. */
export const isStaff = (role: UserRole) => role !== "resident";

/** Trang đầu tiên của từng vai trò (người dân: theo chế độ đang dùng). */
export function homeFor(role: UserRole, mode: AppMode = "sell"): string {
  if (role === "partner") return ROUTES.partner;
  if (role === "operator") return ROUTES.admin;
  if (role === "collaborator") return ROUTES.ctv;
  if (role === "business") return ROUTES.materials;
  return mode === "buy" ? ROUTES.discover : ROUTES.sellerHome;
}

/**
 * Bản demo: vai trò suy ra từ email đăng nhập.
 * doitac@… → người thu mua · ctv@… → cộng tác viên · doanhnghiep@… → doanh nghiệp · vanhanh@… → vận hành
 * · còn lại → người dân.
 */
export function roleFromEmail(email: string): UserRole {
  const local = email.trim().toLowerCase().split("@")[0];
  if (local === "doitac") return "partner";
  if (local === "ctv") return "collaborator";
  if (local === "doanhnghiep") return "business";
  if (local === "vanhanh") return "operator";
  return "resident";
}
