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
  item(ROUTES.sellerHome, "Tổng quan bán hàng", LayoutDashboard, { short: "Tổng quan", exact: true }),
  item(ROUTES.sellerOrders, "Đơn khách đặt mua", Inbox, { short: "Đơn khách", badge: "incoming" }),
  item(ROUTES.myListings, "Món tôi đang bán", Package, { short: "Đang bán" }),
  item(ROUTES.sell, "Đăng bán ve chai, đồ cũ", PackagePlus, { short: "Đăng bán" }),
  item(ROUTES.collect, "Gọi người tới lấy", Truck, { short: "Gọi tới lấy" }),
  item(ROUTES.bins, "Điểm bỏ đồ gần nhà", Recycle, { short: "Điểm bỏ đồ" }),
];

const BUY_ITEMS: NavItem[] = [
  item(ROUTES.discover, "Mua đồ cũ quanh đây", Compass, { short: "Mua đồ cũ" }),
  item(ROUTES.buyerOrders, "Đơn tôi đặt mua", ShoppingBag, { short: "Đơn đã đặt", badge: "bought" }),
  item(ROUTES.favorites, "Món đã lưu", Heart, { short: "Đã lưu", badge: "favorites" }),
  item(ROUTES.shops, "Cửa hàng sản phẩm xanh", Store, { short: "Hàng xanh" }),
];

/** Dùng chung cho cả hai chế độ — đặt dưới, chữ nhỏ hơn việc chính. */
const SHARED_ITEMS: NavItem[] = [
  item(ROUTES.points, "Điểm thưởng & đổi quà", Coins, { short: "Điểm thưởng", also: [ROUTES.rewards] }),
  item(ROUTES.swap, "Cho tặng, đổi đồ cũ", Repeat2, { short: "Đổi đồ" }),
  item(ROUTES.map, "Bản đồ điểm thu gom", MapIcon, { short: "Bản đồ" }),
  item(ROUTES.litterReport, "Báo chỗ đổ rác bừa", Megaphone, { short: "Báo rác" }),
  item(ROUTES.learn, "Hướng dẫn phân loại rác", BookOpen, { short: "Hướng dẫn", also: [ROUTES.consult] }),
];

export function residentNav(mode: AppMode): NavGroup[] {
  return [
    mode === "sell" ? { title: "Bán đồ", items: SELL_ITEMS } : { title: "Mua đồ cũ", items: BUY_ITEMS },
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
    item(lots, "Lô hàng của tôi", Boxes, { short: "Lô hàng" }),
    item(demands, "Doanh nghiệp cần mua", Building2, { short: "DN cần mua" }),
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
      title: "Mua ve chai của người dân",
      items: [
        item(ROUTES.partner, "Ve chai đang rao bán", Scale, { short: "Rao bán", exact: true, also: ["/doi-tac/tin"] }),
        item(ROUTES.partnerPickups, "Nhà dân gọi tới lấy", Truck, { short: "Gọi tới lấy", badge: "pickups" }),
        item(ROUTES.partnerOrders, "Đơn tôi đã đặt", ShoppingBag, { short: "Đơn đã đặt", badge: "bought" }),
      ],
    },
    sellToBusiness(ROUTES.partnerLots, ROUTES.partnerDemands),
  ],
  collaborator: [
    {
      title: "Điểm thu gom",
      items: [
        item(ROUTES.ctv, "Duyệt bỏ đồ, thùng đầy", ClipboardCheck, { short: "Duyệt", exact: true }),
        item(ROUTES.ctvGifts, "Trao quà đổi điểm", Gift, { short: "Trao quà" }),
      ],
    },
    sellToBusiness(ROUTES.ctvLots, ROUTES.ctvDemands),
  ],
  business: [
    {
      title: "Thu mua",
      items: [
        item(ROUTES.materials, "Mua lô phế liệu", Boxes, { short: "Mua lô", exact: true }),
        item(ROUTES.businessDemands, "Đăng nhu cầu cần mua", Megaphone, { short: "Cần mua" }),
        item(ROUTES.stats, "Thống kê môi trường", ChartColumn, { short: "Thống kê" }),
      ],
    },
  ],
  operator: [
    {
      title: "Quản trị",
      items: [
        item(ROUTES.admin, "Bảng điều hành", ShieldCheck, { short: "Điều hành", exact: true }),
        item(ROUTES.ctv, "Theo dõi điểm thu gom", ClipboardCheck, { short: "Điểm gom", exact: true }),
      ],
    },
    {
      title: "Theo dõi",
      items: [
        item(ROUTES.opsMaterials, "Theo dõi lô bán", Boxes, { short: "Lô bán" }),
        item(ROUTES.opsStats, "Thống kê môi trường", ChartColumn, { short: "Thống kê" }),
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
  { prefix: ROUTES.sellerOrders, title: "Đơn khách đặt mua" },
  { prefix: ROUTES.myListings, title: "Món tôi đang bán" },
  { prefix: ROUTES.sellerHome, title: "Tổng quan bán hàng" },
  { prefix: ROUTES.buyerOrders, title: "Đơn tôi đặt mua" },
  { prefix: "/don", title: "Chi tiết đơn" },
  { prefix: ROUTES.discover, title: "Mua đồ cũ" },
  { prefix: "/san-pham", title: "Chi tiết tin đăng" },
  { prefix: ROUTES.sell, title: "Đăng bán" },
  { prefix: ROUTES.collect, title: "Gọi người tới lấy" },
  { prefix: ROUTES.favorites, title: "Món đã lưu" },
  { prefix: ROUTES.profile, title: "Hồ sơ của tôi" },
  { prefix: ROUTES.sortingGuide, title: "Sổ tay phân loại" },
  { prefix: ROUTES.learn, title: "Hướng dẫn phân loại" },
  { prefix: ROUTES.pointRules, title: "Quy tắc tính điểm" },
  { prefix: ROUTES.points, title: "Điểm của tôi" },
  { prefix: ROUTES.rewards, title: "Đổi quà" },
  { prefix: ROUTES.shops, title: "Cửa hàng xanh" },
  { prefix: ROUTES.swapPost, title: "Đăng đồ cho tặng, đổi" },
  { prefix: ROUTES.swap, title: "Cho tặng, đổi đồ" },
  { prefix: ROUTES.bins, title: "Điểm bỏ đồ gần nhà" },
  { prefix: ROUTES.litterReport, title: "Báo chỗ đổ rác bừa" },
  { prefix: ROUTES.map, title: "Bản đồ điểm thu gom" },
  { prefix: ROUTES.consult, title: "Hỏi cách phân loại" },
  // Khu làm việc
  { prefix: ROUTES.partnerOrders, title: "Đơn tôi đã đặt" },
  { prefix: ROUTES.partnerLots, title: "Lô hàng của tôi" },
  { prefix: ROUTES.partnerDemands, title: "Doanh nghiệp cần mua" },
  { prefix: ROUTES.ctvGifts, title: "Trao quà đổi điểm" },
  { prefix: ROUTES.ctvLots, title: "Lô hàng của tôi" },
  { prefix: ROUTES.ctvDemands, title: "Doanh nghiệp cần mua" },
  { prefix: ROUTES.businessDemands, title: "Đăng nhu cầu cần mua" },
  { prefix: ROUTES.partnerPickups, title: "Người dân gọi tới lấy" },
  { prefix: "/doi-tac/tin", title: "Chi tiết tin ve chai" },
  { prefix: ROUTES.partner, title: "Ve chai đang rao bán" },
  { prefix: "/van-hanh/thu-gom", title: "Chi tiết yêu cầu tới lấy" },
  { prefix: ROUTES.opsMaterials, title: "Theo dõi lô bán" },
  { prefix: ROUTES.opsStats, title: "Thống kê môi trường" },
  { prefix: ROUTES.admin, title: "Bảng điều hành" },
  { prefix: ROUTES.ctv, title: "Duyệt bỏ đồ, thùng đầy" },
  { prefix: ROUTES.stats, title: "Thống kê môi trường" },
  { prefix: ROUTES.materials, title: "Mua lô phế liệu" },
];

export function isActive(pathname: string, item: Pick<NavItem, "href" | "also" | "exact">) {
  const also = (item.also ?? []).some((h) => under(pathname, h));
  return also || (item.exact ? pathname === item.href : under(pathname, item.href));
}

export function titleFor(pathname: string): string {
  return PAGE_TITLES.find((p) => under(pathname, p.prefix))?.title ?? "Green City";
}
