import type { Article, SortingGuideItem } from "@/types/features";

/**
 * Bài viết kiến thức môi trường và sổ tay phân loại.
 * FILE CỦA GEMINI — bản khung có 1 mục mẫu, Gemini thay bằng dữ liệu đầy đủ (giữ tên export).
 * Đường dẫn ảnh viết đầy đủ để `npm run content:missing` quét được.
 */
export const ARTICLES: Article[] = [
  {
    slug: "phan-loai-rac-tai-nha",
    title: "Phân loại rác tại nhà thành 3 nhóm chính",
    summary: "Ba thùng nhỏ trong bếp là đủ để tách rác tái chế, rác thực phẩm và rác còn lại.",
    topic: "phan-loai",
    readMinutes: 4,
    cover: "/content/learn/phan-loai-rac-tai-nha.webp",
    updatedAt: "2026-10-19T00:00:00.000Z",
    blocks: [
      { type: "p", text: "Bản khung — Gemini sẽ viết nội dung đầy đủ cho bài này." },
    ],
  },
];

export const SORTING_GUIDE: SortingGuideItem[] = [
  {
    id: "chai-nhua",
    name: "Chai nhựa",
    aliases: ["chai nước suối", "chai PET"],
    group: "tai-che",
    prep: "Đổ hết nước, bỏ nắp riêng, bóp dẹt.",
  },
];
