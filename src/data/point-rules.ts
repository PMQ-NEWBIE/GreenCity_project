import type { PointRule } from "@/types/features";

/**
 * Quy tắc tính điểm — nguồn duy nhất. Mọi chỗ cộng điểm và mọi trang hiển thị
 * đều đọc từ đây; đổi số ở đây là đổi toàn bộ web.
 */
export const POINT_RULES: PointRule[] = [
  {
    id: "welcome",
    reason: "welcome",
    activity: "Tạo tài khoản Green City",
    points: 50,
    unit: "lần",
    condition: "Cộng một lần, ngay khi bạn đăng nhập lần đầu.",
  },
  {
    id: "pickup-kg",
    reason: "home_pickup",
    activity: "Bán ve chai qua thu gom tận nhà",
    points: 2,
    unit: "kg",
    condition: "Tính trên khối lượng thực tế khi đội thu gom cân tại nhà bạn.",
  },
  {
    id: "pickup-sorted",
    reason: "home_pickup",
    activity: "Thu gom tận nhà, đồ đã phân loại sẵn",
    points: 10,
    unit: "lần",
    condition: "Cộng thêm khi đội thu gom xác nhận đồ đã được tách riêng theo loại.",
  },
  {
    id: "pickup-cash-to-points",
    reason: "home_pickup",
    activity: "Nhận điểm thay cho tiền ve chai",
    points: 1,
    unit: "1.000đ",
    condition: "Khi thanh toán, bạn chọn quy đổi số tiền ve chai thành điểm thay vì nhận tiền mặt.",
  },
  {
    id: "bin-recycle",
    reason: "bin_dropoff",
    activity: "Bỏ vật liệu tái chế vào thùng thu gom",
    points: 5,
    unit: "lần",
    condition: "Cộng tác viên kiểm tra đúng loại, không lẫn rác. Tối đa 3 lần mỗi ngày.",
    dailyCap: 3,
  },
  {
    id: "bin-clothes",
    reason: "bin_dropoff",
    activity: "Bỏ quần áo cũ vào thùng quần áo",
    points: 3,
    unit: "kg",
    condition: "Quần áo khô, sạch, cho vào túi buộc kín.",
  },
  {
    id: "bin-organic",
    reason: "bin_dropoff",
    activity: "Bỏ rác hữu cơ vào thùng hữu cơ",
    points: 1,
    unit: "kg",
    condition: "Chỉ rác thực phẩm, không lẫn túi nilon hay hộp xốp.",
  },
  {
    id: "litter-report",
    reason: "litter_report",
    activity: "Báo điểm rác tự phát được xác minh",
    points: 20,
    unit: "lần",
    condition: "Ảnh rõ, đúng vị trí, không trùng báo cáo đã có trong 24 giờ.",
  },
  {
    id: "bin-full",
    reason: "bin_full_report",
    activity: "Báo thùng đầy được xác nhận",
    points: 5,
    unit: "lần",
    condition: "Tối đa một lần cho mỗi thùng mỗi ngày.",
    dailyCap: 1,
  },
];

export function ruleById(id: string): PointRule {
  const rule = POINT_RULES.find((r) => r.id === id);
  if (!rule) throw new Error(`Không có quy tắc điểm "${id}"`);
  return rule;
}
