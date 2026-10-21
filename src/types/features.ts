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

/* ------------------- Thùng thu gom cố định, báo thùng đầy (A3, A5) ------------------- */

export type BinType = "tai-che" | "quan-ao" | "huu-co";

/** binh-thuong → sap-day / day (khi có người báo) → dang-xu-ly (đội đi đổ) → binh-thuong */
export type BinLevel = "binh-thuong" | "sap-day" | "day" | "dang-xu-ly";

export interface Bin {
  id: string;
  /** Mã in trên thùng, ví dụ "TC-014" */
  code: string;
  type: BinType;
  /** Chỗ đặt thùng, ví dụ "Sân chung cư, cạnh nhà xe" */
  name: string;
  area: Area;
  address: string;
  lat: number;
  lng: number;
  level: BinLevel;
  lastEmptiedAt: string;
  /** Cộng tác viên phụ trách kiểm tra */
  collaborator: string;
}

export type DropoffStatus = "cho-kiem-tra" | "dat" | "khong-dat";

export interface Dropoff {
  id: string;
  binId: string;
  binCode: string;
  binType: BinType;
  userId?: string;
  userName: string;
  material: string;
  /** Khối lượng người bỏ ước tính (kg) */
  estKg: number;
  photos: string[];
  at: string;
  status: DropoffStatus;
  /** Điểm dự kiến lúc ghi nhận (0 nếu đã chạm giới hạn trong ngày) */
  points: number;
  /** true = đã chạm giới hạn ngày nên không cộng điểm */
  capped: boolean;
  pointsEntryId?: string;
  reviewedAt?: string;
  reviewer?: string;
  /** Khối lượng cộng tác viên kiểm lại */
  actualKg?: number;
  rejectReason?: string;
}

export type BinReportStatus = "moi" | "da-xac-nhan" | "khong-dung" | "da-xu-ly";

export interface BinReport {
  id: string;
  binId: string;
  level: "sap-day" | "day";
  userId?: string;
  userName: string;
  at: string;
  status: BinReportStatus;
  /** Số lượt báo trùng (cùng thùng trong 6 giờ) đã gộp vào báo cáo này */
  merged: number;
  points: number;
  pointsEntryId?: string;
}

/* ------------------------- Báo điểm rác tự phát (A4) ------------------------- */

export type LitterSize = "nho" | "vua" | "lon";

/** cho-xac-minh → da-xac-minh (cộng điểm) hoặc khong-hop-le → da-don (đội vận hành đã dọn) */
export type LitterStatus = "cho-xac-minh" | "da-xac-minh" | "khong-hop-le" | "da-don";

export interface LitterReport {
  id: string;
  userId?: string;
  userName: string;
  photos: string[];
  /** Có khi người báo cho lấy vị trí */
  lat?: number;
  lng?: number;
  locationSource: "gps" | "tay";
  area: Area;
  address: string;
  size: LitterSize;
  description: string;
  at: string;
  status: LitterStatus;
  /** Điểm dự kiến; 0 nếu trùng báo cáo khác */
  points: number;
  duplicateOf?: string;
  pointsEntryId?: string;
  verifiedAt?: string;
  verifier?: string;
  rejectReason?: string;
  cleanedAt?: string;
}

/* ------------------------- Chợ vật liệu doanh nghiệp (A7) ------------------------- */

export type LotGrade = "A" | "B" | "C";

/** san-sang → dang-giu (doanh nghiệp đặt giữ 48 giờ) → da-ban; hết 48 giờ chưa chốt thì về san-sang */
export type LotStatus = "san-sang" | "dang-giu" | "da-ban";

export interface LotReservation {
  businessId: string;
  businessName: string;
  at: string;
  expiresAt: string;
  /** Giờ hẹn tới lấy hàng */
  pickupAt: string;
  note: string;
}

export interface MaterialLot {
  id: string;
  /** Mã lô in trên phiếu kiểm định, ví dụ "LO-1019-03" */
  code: string;
  material: string;
  weightKg: number;
  pricePerKg: number;
  grade: LotGrade;
  /** Độ sạch, % */
  purity: number;
  /** Độ ẩm, % */
  moisture: number;
  inspector: string;
  inspectedAt: string;
  warehouse: string;
  area: Area;
  image: string;
  note: string;
  status: LotStatus;
  reservation?: LotReservation;
  soldAt?: string;
  soldTo?: string;
  /** Ai bán lô: vựa (tài khoản người thu mua) hoặc điểm thu gom (cộng tác viên). Lô mẫu cũ không có. */
  sellerId?: string;
  sellerName?: string;
  sellerKind?: LotSellerKind;
}

/** vua: vựa / người thu mua gom từ người dân · diem-thu-gom: thùng và điểm thu gom do cộng tác viên trực */
export type LotSellerKind = "vua" | "diem-thu-gom";

/* --------------------------- Tư vấn phân loại (A8) --------------------------- */

export type ConsultStatus = "cho-tu-van" | "da-tra-loi";

/** Một gợi ý phân loại — từ so khớp từ khóa, từ AI (khi bật), hoặc từ người tư vấn. */
export interface ClassifyResult {
  group: WasteGroup;
  itemName: string;
  guidance: string;
  /** 0–1 */
  confidence: number;
  source: "keyword" | "ai" | "human";
}

export interface ConsultTicket {
  id: string;
  userId?: string;
  userName: string;
  photo: string;
  /** Người hỏi tả món đồ, ví dụ "hộp sữa giấy" */
  description: string;
  question: string;
  at: string;
  status: ConsultStatus;
  /** Gợi ý tự động lúc gửi */
  suggestions: ClassifyResult[];
  answer?: { group: WasteGroup; guidance: string; by: string; at: string };
}

/* --------------------------- Đơn mua bán giữa người dân --------------------------- */

/**
 * pending: chờ người bán xác nhận · accepted: người bán đã nhận, chờ gặp giao hàng ·
 * done: đã giao xong · declined: người bán từ chối · cancelled: một bên hủy
 */
export type OrderStatus = "pending" | "accepted" | "done" | "declined" | "cancelled";

export interface OrderEvent {
  at: string;
  status: OrderStatus;
  by: "buyer" | "seller";
  /** Lý do từ chối / hủy */
  note?: string;
}

export interface Order {
  id: string;
  productId: string;
  /** Chụp lại tin lúc đặt — tin bị xóa hay đổi giá thì đơn vẫn đúng như lúc đặt */
  product: { name: string; image: string; price: number; unit: string; area: string };
  /** Email người mua; người mua mô phỏng (bản demo) có dạng "demo:<tên>" */
  buyerId: string;
  buyerName: string;
  /** Email người bán nếu là tin của người dùng; người bán trong dữ liệu mẫu có dạng "demo:<tên>" */
  sellerId: string;
  sellerName: string;
  /** Người mua ghi, ví dụ "khoảng 15 kg", "cả lô" */
  quantity: string;
  /** Khung giờ hẹn tới lấy hàng (TIME_OPTIONS) */
  meetTime: string;
  note: string;
  createdAt: string;
  status: OrderStatus;
  events: OrderEvent[];
}

/* ------------------- Nhu cầu thu mua của doanh nghiệp ------------------- */

/** dang-mua: còn nhận chào hàng · da-du: doanh nghiệp đã gom đủ, đóng lại */
export type DemandStatus = "dang-mua" | "da-du";
export type DemandOfferStatus = "cho" | "nhan" | "tu-choi";

/** Vựa hoặc điểm thu gom chào hàng vào một nhu cầu */
export interface DemandOffer {
  id: string;
  fromId: string;
  fromName: string;
  fromKind: LotSellerKind;
  kg: number;
  pricePerKg: number;
  note: string;
  at: string;
  status: DemandOfferStatus;
}

/** Doanh nghiệp đăng "cần mua X kg loại Y, giá Z" — ví dụ cơ sở phân hữu cơ cần rác rau củ ở chợ */
export interface PurchaseDemand {
  id: string;
  businessId: string;
  businessName: string;
  /** Một trong LOT_MATERIALS */
  material: string;
  kg: number;
  pricePerKg: number;
  /** Khu vực ưu tiên nhận hàng; null = cả thành phố */
  area: Area | null;
  note: string;
  createdAt: string;
  status: DemandStatus;
  offers: DemandOffer[];
}
