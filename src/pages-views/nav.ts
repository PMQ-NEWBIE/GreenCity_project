import {
  BookOpen,
  Boxes,
  Building2,
  ChartColumn,
  ClipboardCheck,
  Coins,
  Compass,
  Gift,
  Heart,
  Inbox,
  LayoutDashboard,
  Map as MapIcon,
  Megaphone,
  Package,
  PackagePlus,
  Recycle,
  Scale,
  Repeat2,
  ScanSearch,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/types";
import { ROUTES } from "@/lib/routes";
import { under, type AppMode } from "@/lib/access";

export interface NavItem {
  href: string;
  label: string;
  /** Nhãn ngắn cho thanh điều hướng đáy trên điện thoại */
  short: string;
  icon: LucideIcon;
  /** Đường dẫn khác cũng tính là đang ở mục này (ví dụ Đổi quà nằm trong mục Điểm) */
  also?: string[];
  /** Chỉ sáng khi đúng đường dẫn này (trang gốc của một khu có trang con là mục khác) */
  exact?: boolean;
  /** Số hiện cạnh mục (đơn chờ xử lý, món đã lưu) — AppShell điền */
  badge?: "incoming" | "bought" | "favorites" | "pickups";
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

const item = (href: string, label: string, icon: LucideIcon, extra: Partial<NavItem> = {}): NavItem => ({
  href,
  label,
  short: label,
  icon,
  ...extra,
});

/* ------------------------------ Người dân ------------------------------ */

const SELL_ITEMS: NavItem[] = [
  item(ROUTES.sellerHome, "Tổng quan bán", LayoutDashboard, { short: "Tổng quan", exact: true }),
  item(ROUTES.sellerOrders, "Đơn đến", Inbox, { badge: "incoming" }),
  item(ROUTES.myListings, "Tin đăng của tôi", Package, { short: "Tin của tôi" }),
  item(ROUTES.sell, "Đăng tin bán", PackagePlus, { short: "Đăng tin" }),
  item(ROUTES.collect, "Gọi thu gom", Truck, { short: "Thu gom" }),
  item(ROUTES.bins, "Thùng thu gom", Recycle),
];

const BUY_ITEMS: NavItem[] = [
  item(ROUTES.discover, "Đồ thanh lý quanh đây", Compass, { short: "Khám phá" }),
  item(ROUTES.buyerOrders, "Đơn mua của tôi", ShoppingBag, { short: "Đơn mua", badge: "bought" }),
  item(ROUTES.favorites, "Đã lưu", Heart, { badge: "favorites" }),
  item(ROUTES.shops, "Gian hàng xanh", Store, { short: "Gian hàng" }),
];

/** Dùng chung cho cả hai chế độ — đặt dưới, chữ nhỏ hơn việc chính. */
const SHARED_ITEMS: NavItem[] = [
  item(ROUTES.points, "Điểm & đổi quà", Coins, { also: [ROUTES.rewards] }),
  item(ROUTES.swap, "Trao đổi đồ", Repeat2),
  item(ROUTES.map, "Bản đồ xanh", MapIcon),
  item(ROUTES.litterReport, "Báo điểm rác", Megaphone),
  item(ROUTES.learn, "Kiến thức", BookOpen, { also: [ROUTES.consult] }),
];

export function residentNav(mode: AppMode): NavGroup[] {
  return [
    mode === "sell" ? { title: "Kênh bán", items: SELL_ITEMS } : { title: "Mua hàng", items: BUY_ITEMS },
    { title: "Sống xanh", items: SHARED_ITEMS },
  ];
}

/** Thanh đáy điện thoại: 4 việc chính của chế độ đang dùng, ô thứ 5 là "Thêm". */
export function mobileNav(mode: AppMode): NavItem[] {
  return mode === "sell" ? [SELL_ITEMS[0], SELL_ITEMS[1], SELL_ITEMS[3], SELL_ITEMS[2]] : BUY_ITEMS;
}

/**
 * Trang thuộc riêng một chế độ → mở trang đó thì chuyển luôn sang chế độ ấy
 * (bấm link "Đăng tin" khi đang ở chế độ mua không để menu lệch với trang).
 * null = trang dùng chung, giữ chế độ đang dùng.
 */
export function modeForPath(pathname: string): AppMode | null {
  if (SELL_ITEMS.some((i) => under(pathname, i.href))) return "sell";
  if (BUY_ITEMS.some((i) => under(pathname, i.href))) return "buy";
  return null;
}

/* ------------------------------ Khu làm việc ------------------------------ */

export const WORKSPACE_LABEL: Record<Exclude<UserRole, "resident">, string> = {
  partner: "Khu người thu mua",
  operator: "Khu ban điều hành",
  collaborator: "Khu điểm thu gom",
  business: "Khu doanh nghiệp",
};

/** Nhãn khu rút gọn cho thanh trên điện thoại (nhãn đầy đủ chiếm chỗ, tiêu đề trang bị cắt) */
export const WORKSPACE_SHORT: Record<Exclude<UserRole, "resident">, string> = {
  partner: "Thu mua",
  operator: "Điều hành",
  collaborator: "Điểm gom",
  business: "Doanh nghiệp",
};

/** Bán cho doanh nghiệp: vựa và điểm thu gom dùng chung hai mục này */
const sellToBusiness = (lots: string, demands: string): NavGroup => ({
  title: "Bán cho doanh nghiệp",
  items: [
    item(lots, "Lô của tôi", Boxes, { short: "Lô hàng" }),
    item(demands, "Doanh nghiệp cần mua", Building2, { short: "Cần mua" }),
  ],
});

/**
 * Mỗi vai trò chỉ thấy việc của mình (chuỗi: người dân → người thu mua / điểm thu gom → doanh nghiệp):
 * - người thu mua (vựa, ve chai dạo): mua phế liệu của người dân, gom thành lô bán cho doanh nghiệp
 * - cộng tác viên: trực điểm thu gom — duyệt lượt bỏ đồ, trao quà, gom lô bán cho doanh nghiệp
 * - doanh nghiệp: mua lô, đăng nhu cầu thu mua
 * - ban điều hành: chỉ quản trị và theo dõi, không mua bán
 */
const WORKSPACE_NAV: Record<Exclude<UserRole, "resident">, NavGroup[]> = {
  partner: [
    {
      title: "Mua của người dân",
      items: [
        item(ROUTES.partner, "Tin bán phế liệu", Scale, { short: "Tin bán", exact: true, also: ["/doi-tac/tin"] }),
        item(ROUTES.partnerPickups, "Yêu cầu tới lấy", Truck, { short: "Tới lấy", badge: "pickups" }),
        item(ROUTES.partnerOrders, "Đơn thu mua", ShoppingBag, { short: "Đơn thu mua", badge: "bought" }),
      ],
    },
    sellToBusiness(ROUTES.partnerLots, ROUTES.partnerDemands),
  ],
  collaborator: [
    {
      title: "Điểm thu gom",
      items: [
        item(ROUTES.ctv, "Việc ở điểm", ClipboardCheck, { short: "Việc", exact: true }),
        item(ROUTES.ctvGifts, "Trao quà", Gift),
      ],
    },
    sellToBusiness(ROUTES.ctvLots, ROUTES.ctvDemands),
  ],
  business: [
    {
      title: "Thu mua",
      items: [
        item(ROUTES.materials, "Chợ lô vật liệu", Boxes, { short: "Chợ lô", exact: true }),
        item(ROUTES.businessDemands, "Nhu cầu thu mua", Megaphone, { short: "Nhu cầu" }),
        item(ROUTES.stats, "Thống kê", ChartColumn),
      ],
    },
  ],
  operator: [
    {
      title: "Quản trị",
      items: [
        item(ROUTES.admin, "Bảng điều hành", ShieldCheck, { short: "Điều hành", exact: true }),
        item(ROUTES.ctv, "Điểm thu gom", ClipboardCheck, { short: "Điểm gom", exact: true }),
      ],
    },
    {
      title: "Theo dõi",
      items: [
        item(ROUTES.opsMaterials, "Lô vật liệu", Boxes, { short: "Lô" }),
        item(ROUTES.opsStats, "Thống kê", ChartColumn),
      ],
    },
  ],
};

export function workspaceNav(role: UserRole): NavGroup[] {
  return role === "resident" ? [] : WORKSPACE_NAV[role];
}

/* ------------------------------ Dùng chung ------------------------------ */

/** Tiêu đề trên thanh trên cùng. Đường dẫn dài đứng trước để khớp đúng trang con. */
export const PAGE_TITLES: { prefix: string; title: string }[] = [
  { prefix: ROUTES.sellerOrders, title: "Đơn đến" },
  { prefix: ROUTES.myListings, title: "Tin đăng của tôi" },
  { prefix: ROUTES.sellerHome, title: "Tổng quan bán" },
  { prefix: ROUTES.buyerOrders, title: "Đơn mua của tôi" },
  { prefix: "/don", title: "Chi tiết đơn" },
  { prefix: ROUTES.discover, title: "Đồ thanh lý" },
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
  // Khu làm việc
  { prefix: ROUTES.partnerOrders, title: "Đơn thu mua" },
  { prefix: ROUTES.partnerLots, title: "Lô bán cho doanh nghiệp" },
  { prefix: ROUTES.partnerDemands, title: "Doanh nghiệp cần mua" },
  { prefix: ROUTES.ctvGifts, title: "Trao quà" },
  { prefix: ROUTES.ctvLots, title: "Lô bán cho doanh nghiệp" },
  { prefix: ROUTES.ctvDemands, title: "Doanh nghiệp cần mua" },
  { prefix: ROUTES.businessDemands, title: "Nhu cầu thu mua" },
  { prefix: ROUTES.partnerPickups, title: "Yêu cầu tới lấy" },
  { prefix: "/doi-tac/tin", title: "Chi tiết tin phế liệu" },
  { prefix: ROUTES.partner, title: "Tin bán phế liệu" },
  { prefix: "/van-hanh/thu-gom", title: "Chi tiết đơn thu gom" },
  { prefix: ROUTES.opsMaterials, title: "Lô vật liệu" },
  { prefix: ROUTES.opsStats, title: "Thống kê" },
  { prefix: ROUTES.admin, title: "Bảng điều hành" },
  { prefix: ROUTES.ctv, title: "Điểm thu gom" },
  { prefix: ROUTES.stats, title: "Thống kê" },
  { prefix: ROUTES.materials, title: "Chợ lô vật liệu" },
];

export function isActive(pathname: string, item: Pick<NavItem, "href" | "also" | "exact">) {
  const also = (item.also ?? []).some((h) => under(pathname, h));
  return also || (item.exact ? pathname === item.href : under(pathname, item.href));
}

export function titleFor(pathname: string): string {
  return PAGE_TITLES.find((p) => under(pathname, p.prefix))?.title ?? "Green City";
}
