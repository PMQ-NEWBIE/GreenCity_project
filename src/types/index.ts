export type CategoryId =
  | "paper"
  | "plastic"
  | "metal"
  | "glass"
  | "ewaste"
  | "electronic"
  | "furniture";

/**
 * Mỗi danh mục thuộc một "chợ", quyết định ai thấy tin:
 * - scrap: phế liệu, ve chai → chỉ người thu mua (người ve chai, vựa) thấy và đặt
 * - secondhand: đồ thanh lý còn dùng được → người dân thấy và đặt
 */
export type Market = "scrap" | "secondhand";

export type Unit = "kg" | "món" | "lô" | "chai";

export type ProductStatus = "available" | "sold" | "draft";

export type SellerType = "individual" | "collector" | "scrapyard";

export interface Category {
  id: CategoryId;
  market: Market;
  name: string;
  shortName: string;
  description: string;
  priceHint: string;
  image: string;
  icon: "newspaper" | "bottle" | "anvil" | "wine" | "laptop" | "armchair";
}

export interface Seller {
  name: string;
  type: SellerType;
  rating: number;
  deals: number;
  joined: string;
  initials: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: CategoryId;
  price: number;
  unit: Unit;
  area: string;
  description: string;
  image: string;
  postedHoursAgo: number;
  status: ProductStatus;
  seller: Seller;
  isMine?: boolean;
}

/** Yêu cầu thu gom bản v1 — chỉ còn dùng để chuyển dữ liệu cũ sang PickupRequest. */
export type RequestStatus = "pending" | "matched" | "done";

export interface CollectionRequest {
  id: string;
  materials: string[];
  quantity: string;
  area: string;
  time: string;
  note: string;
  hoursAgo: number;
  status: RequestStatus;
  isMine?: boolean;
}

/**
 * Vai trò trong bản demo: người dân, người thu mua phế liệu (người ve chai, vựa),
 * cộng tác viên kiểm tra, doanh nghiệp tái chế, nhóm vận hành.
 */
export type UserRole = "resident" | "partner" | "collaborator" | "business" | "operator";

export interface DemoUser {
  name: string;
  email: string;
  memberSince: string;
  role: UserRole;
}

export interface ToastItem {
  id: string;
  kind: "success" | "error" | "info";
  title: string;
  description?: string;
}

export const AREAS = [
  "Quận 1",
  "Quận 3",
  "Quận 5",
  "Quận 7",
  "Quận 10",
  "Bình Thạnh",
  "Phú Nhuận",
  "Gò Vấp",
  "Tân Bình",
  "Thủ Đức",
] as const;

export type Area = (typeof AREAS)[number];

export const MATERIAL_OPTIONS = [
  "Giấy & bìa carton",
  "Chai nhựa PET",
  "Nhựa các loại",
  "Lon nhôm",
  "Sắt & kim loại",
  "Chai lọ thủy tinh",
  "Đồ điện tử cũ",
  "Đồ gia dụng cũ",
  "Rác tái chế hỗn hợp",
] as const;

export const TIME_OPTIONS = [
  "Sáng (8h–11h)",
  "Chiều (13h–17h)",
  "Tối (18h–20h)",
  "Cuối tuần",
  "Linh hoạt",
] as const;
