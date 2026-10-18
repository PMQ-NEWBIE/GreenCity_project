export type CategoryId =
  | "paper"
  | "plastic"
  | "metal"
  | "glass"
  | "electronic"
  | "furniture";

export type Unit = "kg" | "món" | "lô" | "chai";

export type ProductStatus = "available" | "sold";

export type SellerType = "individual" | "collector" | "scrapyard";

export interface Category {
  id: CategoryId;
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

export interface DemoUser {
  name: string;
  email: string;
  memberSince: string;
}

export type AppPage =
  | "dashboard"
  | "discover"
  | "product"
  | "sell"
  | "collect"
  | "favorites"
  | "profile";

export type Route =
  | { screen: "landing" }
  | { screen: "auth"; mode: "login" | "register" | "forgot" }
  | { screen: "app"; page: AppPage; productId?: string };

export interface ToastItem {
  id: string;
  kind: "success" | "error" | "info";
  title: string;
  description?: string;
}

export interface ActivityItem {
  id: string;
  type: "listing" | "match" | "collection" | "recycle";
  title: string;
  description: string;
  time: string;
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
