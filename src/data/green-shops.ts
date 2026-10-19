import type { GreenShop } from "@/types/features";

/**
 * Gian hàng doanh nghiệp xanh (tên hư cấu). Bản đồ xanh đọc lat/lng từ đây.
 * FILE CỦA GEMINI — bản khung có 1 mục mẫu, Gemini thay bằng dữ liệu đầy đủ (giữ tên export).
 * Mỗi partnerName trong src/data/rewards.ts phải có đúng một gian hàng cùng tên, isPartnerReward: true.
 */
export const GREEN_SHOPS: GreenShop[] = [
  {
    slug: "phan-huu-co-ba-la",
    name: "Phân hữu cơ Ba Lá",
    kind: "phan-bon",
    area: "Gò Vấp",
    address: "Đường Quang Trung, Phường 10",
    lat: 10.8385,
    lng: 106.6655,
    openHours: "7:00 – 18:00, thứ Hai tới thứ Bảy",
    phoneMasked: "09xx xxx 214",
    description: "Bản khung — Gemini sẽ viết mô tả đầy đủ.",
    cover: "/content/shops/phan-huu-co-ba-la.webp",
    isPartnerReward: true,
    products: [
      {
        id: "phan-u-5kg",
        name: "Phân ủ hoai 5kg",
        price: 65000,
        unit: "bao",
        description: "Bản khung.",
      },
    ],
  },
];
