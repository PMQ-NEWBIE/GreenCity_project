import type { PointEntry } from "@/types/features";

/** Người dân mẫu (tên hư cấu) để khu quản trị có sổ điểm để xem và chỉnh. */
export const DEMO_RESIDENTS: { email: string; name: string; area: string }[] = [
  { email: "lan@vidu.vn", name: "Chị Lan", area: "Quận 3" },
  { email: "khoa@vidu.vn", name: "Anh Khoa", area: "Bình Thạnh" },
  { email: "thao@vidu.vn", name: "Chị Thảo", area: "Gò Vấp" },
];

const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

/** Sổ điểm mẫu của người dân mẫu — luôn được gộp vào khi mở trang (id cố định, không trùng). */
export function pointsSeed(): PointEntry[] {
  const e = (id: string, userId: string, d: number, delta: number, reason: PointEntry["reason"], title: string, status: PointEntry["status"] = "confirmed"): PointEntry => ({
    id,
    userId,
    at: daysAgo(d),
    delta,
    reason,
    title,
    status,
  });
  return [
    e("pt-mau-1", "lan@vidu.vn", 40, 50, "welcome", "Điểm chào mừng thành viên mới"),
    e("pt-mau-2", "lan@vidu.vn", 21, 62, "home_pickup", "Thu gom tận nhà · 26kg, đã phân loại"),
    e("pt-mau-3", "lan@vidu.vn", 9, -80, "redeem", "Đổi quà · Phân trùn quế 1kg"),
    e("pt-mau-4", "lan@vidu.vn", 2, 5, "bin_dropoff", "Bỏ đồ vào thùng TC-003 · Chai nhựa PET"),
    e("pt-mau-5", "khoa@vidu.vn", 30, 50, "welcome", "Điểm chào mừng thành viên mới"),
    e("pt-mau-6", "khoa@vidu.vn", 12, 20, "litter_report", "Báo điểm rác · Chân cầu, bờ kênh"),
    e("pt-mau-7", "khoa@vidu.vn", 1, 12, "bin_dropoff", "Bỏ đồ vào thùng QA-013 · Quần áo", "pending"),
    e("pt-mau-8", "thao@vidu.vn", 15, 50, "welcome", "Điểm chào mừng thành viên mới"),
    e("pt-mau-9", "thao@vidu.vn", 2, 27, "home_pickup", "Thu gom tận nhà · 8,9kg, đã phân loại"),
  ];
}
