import {
  BookOpen,
  Boxes,
  ChartColumn,
  ClipboardCheck,
  Coins,
  Compass,
  Gift,
  Heart,
  House,
  Map as MapIcon,
  Megaphone,
  PackagePlus,
  Recycle,
  Repeat2,
  ScanSearch,
  ShieldCheck,
  Store,
  Truck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/types";
import { ROUTES } from "@/lib/routes";

export interface NavItem {
  href: string;
  label: string;
  /** Nhãn ngắn cho thanh điều hướng đáy trên điện thoại */
  short: string;
  icon: LucideIcon;
  /** Bỏ trống = mọi vai trò thấy */
  roles?: UserRole[];
}

export interface NavGroup {
  title: string;
  items: NavItem[];
  /** Bỏ trống = mọi vai trò */
  roles?: UserRole[];
}

const item = (href: string, label: string, icon: LucideIcon, short = label, roles?: UserRole[]): NavItem => ({ href, label, short, icon, roles });

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Việc chính",
    items: [
      item(ROUTES.dashboard, "Tổng quan", House),
      item(ROUTES.discover, "Khám phá & mua", Compass, "Khám phá"),
      item(ROUTES.sell, "Đăng tin bán", PackagePlus, "Đăng tin"),
      item(ROUTES.collect, "Gọi thu gom", Truck, "Thu gom"),
      item(ROUTES.bins, "Thùng thu gom", Recycle),
      item(ROUTES.litterReport, "Báo điểm rác", Megaphone),
    ],
  },
  {
    title: "Điểm thưởng",
    items: [item(ROUTES.points, "Điểm của tôi", Coins), item(ROUTES.rewards, "Đổi quà", Gift)],
  },
  {
    title: "Cộng đồng",
    items: [
      item(ROUTES.swap, "Trao đổi đồ", Repeat2),
      item(ROUTES.map, "Bản đồ xanh", MapIcon),
      item(ROUTES.shops, "Gian hàng xanh", Store),
      item(ROUTES.learn, "Kiến thức", BookOpen),
      item(ROUTES.consult, "Hỏi cách phân loại", ScanSearch),
    ],
  },
  {
    title: "Doanh nghiệp",
    roles: ["business", "operator"],
    items: [item(ROUTES.materials, "Chợ vật liệu", Boxes), item(ROUTES.stats, "Thống kê", ChartColumn)],
  },
  {
    title: "Vận hành",
    roles: ["collaborator", "operator"],
    items: [
      item(ROUTES.admin, "Quản trị", ShieldCheck, "Quản trị", ["operator"]),
      item(ROUTES.ctv, "Khu cộng tác viên", ClipboardCheck),
    ],
  },
  {
    title: "Của tôi",
    items: [item(ROUTES.favorites, "Đã lưu", Heart), item(ROUTES.profile, "Hồ sơ của tôi", UserRound, "Hồ sơ")],
  },
];

/** Nhóm menu mà vai trò này được thấy. Khách (chưa đăng nhập) thấy như người dân. */
export function navFor(role: UserRole | null): NavGroup[] {
  const r = role ?? "resident";
  return NAV_GROUPS.filter((g) => !g.roles || g.roles.includes(r)).map((g) => ({
    ...g,
    items: g.items.filter((i) => !i.roles || i.roles.includes(r)),
  }));
}

/** Thanh đáy trên điện thoại: 4 việc chính, ô thứ 5 là "Thêm" (mở toàn bộ menu). */
export const MOBILE_NAV: NavItem[] = [
  NAV_GROUPS[0].items[0],
  NAV_GROUPS[0].items[1],
  NAV_GROUPS[0].items[2],
  NAV_GROUPS[0].items[3],
];

/** Tiêu đề trên thanh trên cùng. Đường dẫn dài đứng trước để khớp đúng trang con. */
export const PAGE_TITLES: { prefix: string; title: string }[] = [
  { prefix: ROUTES.dashboard, title: "Tổng quan" },
  { prefix: ROUTES.discover, title: "Khám phá & mua" },
  { prefix: "/san-pham", title: "Chi tiết tin đăng" },
  { prefix: ROUTES.sell, title: "Đăng tin bán" },
  { prefix: ROUTES.collect, title: "Gọi thu gom" },
  { prefix: ROUTES.favorites, title: "Đã lưu" },
  { prefix: ROUTES.profile, title: "Hồ sơ của tôi" },
  { prefix: ROUTES.sortingGuide, title: "Sổ tay phân loại" },
  { prefix: ROUTES.learn, title: "Kiến thức" },
  { prefix: ROUTES.pointRules, title: "Quy tắc tính điểm" },
  { prefix: ROUTES.points, title: "Điểm của tôi" },
  { prefix: ROUTES.rewards, title: "Đổi quà" },
  { prefix: ROUTES.shops, title: "Gian hàng xanh" },
  { prefix: ROUTES.swapPost, title: "Đăng đồ trao đổi" },
  { prefix: ROUTES.swap, title: "Trao đổi đồ" },
  { prefix: ROUTES.bins, title: "Thùng thu gom" },
  { prefix: ROUTES.litterReport, title: "Báo điểm rác" },
  { prefix: ROUTES.map, title: "Bản đồ xanh" },
  { prefix: ROUTES.consult, title: "Hỏi cách phân loại" },
  { prefix: ROUTES.materials, title: "Chợ vật liệu" },
  { prefix: ROUTES.stats, title: "Thống kê" },
  { prefix: ROUTES.ctv, title: "Khu cộng tác viên" },
  { prefix: ROUTES.admin, title: "Quản trị" },
];

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function titleFor(pathname: string): string {
  return PAGE_TITLES.find((p) => isActive(pathname, p.prefix))?.title ?? "Green City";
}
