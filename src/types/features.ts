import type { Area } from "./index";

/* ------------------------------- Điểm thưởng ------------------------------- */

export type PointReason =
  | "welcome"
  | "home_pickup"
  | "bin_dropoff"
  | "litter_report"
  | "bin_full_report"
  | "redeem"
  | "admin_adjust";

/** pending: chờ xác minh · confirmed: đã ghi nhận · rejected: không được duyệt */
export type PointStatus = "pending" | "confirmed" | "rejected";

export interface PointEntry {
  id: string;
  /** Thời điểm ghi nhận (ISO 8601) */
  at: string;
  /** Số dương là cộng, số âm là trừ */
  delta: number;
  reason: PointReason;
  title: string;
  status: PointStatus;
  /** Id của đơn/lượt bỏ thùng/báo cáo/lần đổi quà sinh ra mục này */
  refId?: string;
  /** Email người sở hữu điểm */
  userId?: string;
  /** Lý do từ chối hoặc lý do chỉnh tay */
  note?: string;
}

export interface PointRule {
  id: string;
  reason: PointReason;
  activity: string;
  points: number;
  /** Đơn vị tính: "lần", "kg"… */
  unit: string;
  condition: string;
  /** Số lần tối đa được cộng mỗi ngày (theo người, hoặc theo thùng với báo thùng đầy) */
  dailyCap?: number;
}

/* --------------------------------- Đổi quà --------------------------------- */

export type RewardCategory = "phan-bon" | "tui-vai" | "do-dung" | "cay-giong";

export interface Reward {
  id: string;
  name: string;
  category: RewardCategory;
  partnerName: string;
  pointsCost: number;
  /** Số phần còn lại */
  stock: number;
  image: string;
  description: string;
  pickupNote: string;
}

export type RedemptionStatus = "ready" | "collected" | "expired";

export interface Redemption {
  id: string;
  rewardId: string;
  rewardName: string;
  pointsSpent: number;
  code: string;
  at: string;
  expiresAt: string;
  status: RedemptionStatus;
  userId?: string;
}

export type RedeemResult =
  | { ok: true; redemption: Redemption }
  | { ok: false; reason: "not_logged_in" | "not_enough_points" | "out_of_stock" };

/* ------------------------------- Trao đổi đồ ------------------------------- */

export type SwapCategory = "quan-ao" | "sach" | "gia-dung" | "do-tre-em" | "khac";
export type SwapCondition = "nhu-moi" | "tot" | "da-dung";
export type SwapStatus = "open" | "reserved" | "done";

export interface SwapItem {
  id: string;
  title: string;
  category: SwapCategory;
  condition: SwapCondition;
  description: string;
  image: string;
  area: Area;
  /** true = tặng miễn phí */
  giveaway: boolean;
  /** Muốn đổi lấy gì; rỗng nếu tặng */
  wants: string;
  postedAt: string;
  status: SwapStatus;
  owner: { name: string; initials: string };
  isMine?: boolean;
  /** Email người đăng */
  ownerId?: string;
}

export type NewSwapItem = Pick<
  SwapItem,
  "title" | "category" | "condition" | "description" | "image" | "area" | "giveaway" | "wants"
>;

/* -------------------------------- Kiến thức -------------------------------- */

export type WasteGroup = "tai-che" | "thuc-pham" | "khac" | "nguy-hai" | "cong-kenh";

export type ArticleTopic = "phan-loai" | "u-phan" | "giam-rac" | "tai-su-dung";

export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "steps"; items: string[] }
  | { type: "tip"; text: string }
  | { type: "image"; src: string; alt: string; caption?: string };

export interface Article {
  slug: string;
  title: string;
  summary: string;
  topic: ArticleTopic;
  readMinutes: number;
  cover: string;
  updatedAt: string;
  blocks: ArticleBlock[];
  video?: { title: string; youtubeId: string | null; duration: string };
}

export interface SortingGuideItem {
  id: string;
  name: string;
  aliases: string[];
  group: WasteGroup;
  prep: string;
  note?: string;
}

/* ------------------------------- Gian hàng xanh ------------------------------- */

export type GreenShopKind = "phan-bon" | "lam-vuon" | "san-pham-xanh";

export interface GreenShopProduct {
  id: string;
  name: string;
  price: number;
  unit: string;
  description: string;
  image?: string;
}

export interface GreenShop {
  slug: string;
  name: string;
  kind: GreenShopKind;
  area: Area;
  address: string;
  lat: number;
  lng: number;
  openHours: string;
  phoneMasked: string;
  description: string;
  cover: string;
  isPartnerReward: boolean;
  products: GreenShopProduct[];
}

/* --------------------------- Thu gom tận nhà (A2) --------------------------- */

/** cho-nhan → da-nhan → dang-den → da-can → hoan-tat; hủy được ở cho-nhan, da-nhan */
export type PickupStatus = "cho-nhan" | "da-nhan" | "dang-den" | "da-can" | "hoan-tat" | "da-huy";

export type PayoutMethod = "tien-mat" | "chuyen-khoan" | "quy-diem";

export interface WeighLine {
  material: string;
  kg: number;
  /** Đơn giá đồng/kg tại thời điểm cân */
  pricePerKg: number;
}

export interface PickupEvent {
  status: PickupStatus;
  at: string;
  note?: string;
}

export interface PickupRequest {
  id: string;
  /** Email người gửi; đơn mẫu của người khác thì không có */
  ownerId?: string;
  ownerName: string;
  materials: string[];
  /** Ước tính của người gửi, ví dụ "2 bao, khoảng 15kg" */
  quantity: string;
  area: Area;
  /** Tên đường và phường (bản demo không ghi số nhà) */
  address: string;
  time: string;
  note: string;
  /** Ảnh dạng data URL hoặc đường dẫn, tối đa 3 */
  photos: string[];
  /** Người gửi khai đã phân loại sẵn */
  presorted: boolean;
  createdAt: string;
  status: PickupStatus;
  history: PickupEvent[];
  team?: { id: string; name: string; phoneMasked: string };
  /** Giờ hẹn (ISO) */
  appointment?: string;
  weighLines?: WeighLine[];
  /** Đội thu gom xác nhận đồ đã được phân loại đúng */
  sortedConfirmed?: boolean;
  payout?: { method: PayoutMethod; amount: number; points: number };
  cancelReason?: string;
}

/* ------------------------------ Đối tác (A10) ------------------------------ */

export type PartnerKind = "thu-gom" | "che-bien-phan";

export interface Partner {
  id: string;
  kind: PartnerKind;
  name: string;
  /** Khu vực phụ trách */
  areas: Area[];
  phoneMasked: string;
  contactName: string;
  note: string;
  active: boolean;
}
