import type { PayoutMethod, PickupRequest, PickupStatus } from "@/types/features";

export const PICKUP_STATUS_LABEL: Record<PickupStatus, string> = {
  "cho-nhan": "Đang chờ người mua nhận",
  "da-nhan": "Đã có người nhận",
  "dang-den": "Người mua đang tới",
  "da-can": "Đã cân xong",
  "hoan-tat": "Hoàn tất",
  "da-huy": "Đã hủy",
};

/** Tên bước trên dòng thời gian (ngắn hơn nhãn trạng thái). */
export const PICKUP_STEP_LABEL: Record<PickupStatus, string> = {
  "cho-nhan": "Gửi yêu cầu",
  "da-nhan": "Người mua nhận đơn, hẹn giờ",
  "dang-den": "Người mua lên đường",
  "da-can": "Cân tại nhà",
  "hoan-tat": "Thanh toán, cộng điểm",
  "da-huy": "Đã hủy",
};

export const PAYOUT_LABEL: Record<PayoutMethod, string> = {
  "tien-mat": "Tiền mặt",
  "chuyen-khoan": "Chuyển khoản",
  "quy-diem": "Quy ra điểm thưởng",
};

export const CANCEL_REASONS = [
  "Đã bán cho người khác",
  "Bận giờ hẹn, sẽ gửi lại sau",
  "Gửi nhầm yêu cầu",
] as const;

/**
 * Giá thu mua tham khảo (đồng/kg) — người mua sửa được khi cân.
 * Khóa trùng với MATERIAL_OPTIONS trong src/types/index.ts.
 */
export const MATERIAL_PRICE_PER_KG: Record<string, number> = {
  "Giấy & bìa carton": 4000,
  "Chai nhựa PET": 5000,
  "Nhựa các loại": 3500,
  "Lon nhôm": 25000,
  "Sắt & kim loại": 7000,
  "Chai lọ thủy tinh": 1000,
  "Đồ điện tử cũ": 10000,
  "Đồ gia dụng cũ": 3000,
  "Rác tái chế hỗn hợp": 2000,
};

const ago = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();
const ahead = (h: number) => new Date(Date.now() + h * 3_600_000).toISOString();

/**
 * Đơn mẫu của người dân khác (dữ liệu minh họa) — cho hàng chờ của nhóm vận hành.
 * Tạo ở trình duyệt lúc mở trang lần đầu, sau đó được lưu cùng các thay đổi.
 */
export function pickupSeed(): PickupRequest[] {
  return [
    {
      id: "r-mau-1",
      ownerName: "Chị Lan",
      materials: ["Giấy & bìa carton", "Chai nhựa PET"],
      quantity: "Khoảng 25kg",
      area: "Quận 3",
      address: "Đường Trần Quốc Thảo, Phường Võ Thị Sáu",
      time: "Sáng (8h–11h)",
      note: "Dọn văn phòng, có thang máy.",
      photos: [],
      presorted: true,
      createdAt: ago(3),
      status: "cho-nhan",
      history: [{ status: "cho-nhan", at: ago(3) }],
    },
    {
      id: "r-mau-2",
      ownerName: "Anh Khoa",
      materials: ["Đồ điện tử cũ", "Sắt & kim loại"],
      quantity: "4 món đồ điện và 10kg sắt",
      area: "Bình Thạnh",
      address: "Đường Nơ Trang Long, Phường 13",
      time: "Cuối tuần",
      note: "Đồ nặng ở tầng 3, cần hai người khiêng.",
      photos: [],
      presorted: false,
      createdAt: ago(9),
      status: "cho-nhan",
      history: [{ status: "cho-nhan", at: ago(9) }],
    },
    {
      id: "r-mau-3",
      ownerName: "Cô Hạnh",
      materials: ["Lon nhôm", "Chai lọ thủy tinh"],
      quantity: "2 bao lớn",
      area: "Tân Bình",
      address: "Đường Bàu Cát, Phường 14",
      time: "Chiều (13h–17h)",
      note: "",
      photos: [],
      presorted: true,
      createdAt: ago(20),
      status: "da-nhan",
      team: { id: "dt-minh-duc", name: "Vựa Minh Đức", phoneMasked: "09xx xxx 905" },
      appointment: ahead(18),
      history: [
        { status: "cho-nhan", at: ago(20) },
        { status: "da-nhan", at: ago(16), note: "Vựa Minh Đức nhận đơn" },
      ],
    },
    {
      id: "r-mau-4",
      ownerName: "Anh Phúc",
      materials: ["Giấy & bìa carton"],
      quantity: "Khoảng 40kg báo cũ",
      area: "Quận 10",
      address: "Đường Sư Vạn Hạnh, Phường 12",
      time: "Sáng (8h–11h)",
      note: "Báo đã buộc thành bó.",
      photos: [],
      presorted: true,
      createdAt: ago(28),
      status: "dang-den",
      team: { id: "dt-co-sau", name: "Tổ ve chai Cô Sáu", phoneMasked: "09xx xxx 472" },
      appointment: ago(1),
      history: [
        { status: "cho-nhan", at: ago(28) },
        { status: "da-nhan", at: ago(26), note: "Tổ ve chai Cô Sáu nhận đơn" },
        { status: "dang-den", at: ago(1) },
      ],
    },
    {
      id: "r-mau-5",
      ownerName: "Chị Thảo",
      materials: ["Chai nhựa PET", "Lon nhôm"],
      quantity: "3 túi",
      area: "Gò Vấp",
      address: "Đường Phan Văn Trị, Phường 10",
      time: "Linh hoạt",
      note: "",
      photos: [],
      presorted: true,
      createdAt: ago(50),
      status: "da-can",
      team: { id: "dt-tu-hoa", name: "Đội thu gom Tư Hòa", phoneMasked: "09xx xxx 318" },
      appointment: ago(3),
      weighLines: [
        { material: "Chai nhựa PET", kg: 6.5, pricePerKg: 5000 },
        { material: "Lon nhôm", kg: 2.4, pricePerKg: 25000 },
      ],
      sortedConfirmed: true,
      history: [
        { status: "cho-nhan", at: ago(50) },
        { status: "da-nhan", at: ago(47), note: "Đội thu gom Tư Hòa nhận đơn" },
        { status: "dang-den", at: ago(4) },
        { status: "da-can", at: ago(3) },
      ],
    },
    {
      id: "r-mau-6",
      ownerName: "Chú Bảy",
      materials: ["Rác tái chế hỗn hợp"],
      quantity: "2 túi lớn",
      area: "Thủ Đức",
      address: "Đường Võ Văn Ngân, Phường Linh Chiểu",
      time: "Chiều (13h–17h)",
      note: "Đã tách nhựa và giấy.",
      photos: [],
      presorted: true,
      createdAt: ago(80),
      status: "hoan-tat",
      team: { id: "dt-thu-duc-xanh", name: "Nhóm thu gom Thủ Đức Xanh", phoneMasked: "09xx xxx 127" },
      appointment: ago(55),
      weighLines: [{ material: "Rác tái chế hỗn hợp", kg: 11, pricePerKg: 2000 }],
      sortedConfirmed: true,
      payout: { method: "tien-mat", amount: 22000, points: 32 },
      history: [
        { status: "cho-nhan", at: ago(80) },
        { status: "da-nhan", at: ago(76), note: "Nhóm thu gom Thủ Đức Xanh nhận đơn" },
        { status: "dang-den", at: ago(56) },
        { status: "da-can", at: ago(55) },
        { status: "hoan-tat", at: ago(55) },
      ],
    },
  ];
}
