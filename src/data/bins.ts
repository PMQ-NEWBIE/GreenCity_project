import type { Area } from "@/types";
import type { Bin, BinLevel, BinReport, BinReportStatus, BinType, Dropoff, DropoffStatus } from "@/types/features";
import { AREA_CENTER } from "./geo";

export const BIN_TYPE_LABEL: Record<BinType, string> = {
  "tai-che": "Tái chế",
  "quan-ao": "Quần áo cũ",
  "huu-co": "Rác hữu cơ",
};

export const BIN_TYPE_HINT: Record<BinType, string> = {
  "tai-che": "Giấy, chai nhựa, lon, chai lọ đã tráng sạch",
  "quan-ao": "Quần áo, giày dép khô sạch, cho vào túi buộc kín",
  "huu-co": "Rác thực phẩm, vỏ rau củ, bã trà, bã cà phê",
};

/** Vật liệu bỏ được vào từng loại thùng. */
export const BIN_MATERIALS: Record<BinType, string[]> = {
  "tai-che": ["Giấy & bìa carton", "Chai nhựa PET", "Lon nhôm", "Chai lọ thủy tinh"],
  "quan-ao": ["Quần áo", "Giày dép", "Chăn mền, vải vụn"],
  "huu-co": ["Rác thực phẩm", "Vỏ rau củ, trái cây", "Bã trà, bã cà phê"],
};

/** Người bỏ đồ chọn theo khoảng, lưu giá trị giữa khoảng. */
export const WEIGHT_BANDS: { label: string; kg: number }[] = [
  { label: "Dưới 1kg", kg: 0.5 },
  { label: "1–3kg", kg: 2 },
  { label: "3–5kg", kg: 4 },
  { label: "Trên 5kg", kg: 6 },
];

export const BIN_LEVEL_LABEL: Record<BinLevel, string> = {
  "binh-thuong": "Còn chỗ",
  "sap-day": "Sắp đầy",
  day: "Đã đầy",
  "dang-xu-ly": "Đang đi đổ",
};

export const DROPOFF_STATUS_LABEL: Record<DropoffStatus, string> = {
  "cho-kiem-tra": "Chờ kiểm tra",
  dat: "Đạt chuẩn",
  "khong-dat": "Không đạt",
};

export const BIN_REPORT_STATUS_LABEL: Record<BinReportStatus, string> = {
  moi: "Mới báo",
  "da-xac-nhan": "Đã xác nhận",
  "khong-dung": "Báo chưa đúng",
  "da-xu-ly": "Đã đổ thùng",
};

export const DROPOFF_REJECT_REASONS = ["Lẫn rác không tái chế được", "Bỏ sai loại thùng", "Không thấy đồ trong thùng"] as const;

/** Rải thùng quanh tâm quận theo một độ lệch nhỏ cố định. */
function at(area: Area, dLat: number, dLng: number) {
  const c = AREA_CENTER[area];
  return { lat: Math.round((c.lat + dLat) * 1e5) / 1e5, lng: Math.round((c.lng + dLng) * 1e5) / 1e5 };
}

const ago = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

type BinDraft = [code: string, type: BinType, area: Area, name: string, address: string, dLat: number, dLng: number, level: BinLevel, emptiedHoursAgo: number, collaborator: string];

/** 24 thùng mẫu (dữ liệu minh họa) — đủ 3 loại, rải 10 quận. */
const BIN_DRAFTS: BinDraft[] = [
  ["TC-001", "tai-che", "Quận 1", "Cổng chợ phường, lối vào phía đông", "Đường Nguyễn Thái Bình, Phường Nguyễn Thái Bình", 0.003, -0.004, "binh-thuong", 20, "Chị Mai"],
  ["QA-002", "quan-ao", "Quận 1", "Nhà văn hóa phường, cạnh bảng tin", "Đường Cô Giang, Phường Cầu Ông Lãnh", -0.006, -0.002, "sap-day", 70, "Chị Mai"],
  ["TC-003", "tai-che", "Quận 3", "Đầu hẻm, cạnh trạm điện", "Đường Trần Quốc Thảo, Phường Võ Thị Sáu", 0.002, 0.003, "binh-thuong", 10, "Anh Tâm"],
  ["HC-004", "huu-co", "Quận 3", "Sân chung cư, cạnh nhà xe", "Đường Lý Chính Thắng, Phường Xuân Hòa", -0.004, -0.003, "day", 30, "Anh Tâm"],
  ["TC-005", "tai-che", "Quận 5", "Trước nhà thiếu nhi quận", "Đường Trần Hưng Đạo, Phường Chợ Quán", 0.002, 0.004, "binh-thuong", 5, "Cô Lựu"],
  ["QA-006", "quan-ao", "Quận 5", "Cổng phụ trường tiểu học", "Đường An Dương Vương, Phường An Đông", -0.003, -0.005, "binh-thuong", 40, "Cô Lựu"],
  ["TC-007", "tai-che", "Quận 7", "Sảnh khu căn hộ, góc cầu thang bộ", "Đường Nguyễn Thị Thập, Phường Tân Hưng", 0.004, -0.006, "sap-day", 26, "Anh Bảo"],
  ["HC-008", "huu-co", "Quận 7", "Chợ tạm, khu bán rau", "Đường Huỳnh Tấn Phát, Phường Tân Thuận", -0.005, 0.004, "binh-thuong", 8, "Anh Bảo"],
  ["QA-009", "quan-ao", "Quận 7", "Nhà văn hóa khu phố 3", "Đường Lê Văn Lương, Phường Tân Hưng", 0.008, 0.002, "binh-thuong", 90, "Anh Bảo"],
  ["TC-010", "tai-che", "Quận 10", "Trước ủy ban phường", "Đường Sư Vạn Hạnh, Phường Diên Hồng", 0.003, -0.002, "binh-thuong", 15, "Chị Hằng"],
  ["HC-011", "huu-co", "Quận 10", "Hẻm chợ, đầu dãy hàng cá", "Đường Nguyễn Tri Phương, Phường Vườn Lài", -0.004, 0.003, "dang-xu-ly", 48, "Chị Hằng"],
  ["TC-012", "tai-che", "Bình Thạnh", "Đầu hẻm 42, cạnh tiệm sửa xe", "Đường Nơ Trang Long, Phường Bình Thạnh", 0.005, -0.004, "binh-thuong", 12, "Anh Hòa"],
  ["QA-013", "quan-ao", "Bình Thạnh", "Sân nhà thờ giáo xứ, cổng sau", "Đường Bùi Đình Túy, Phường Gia Định", 0.001, 0.006, "binh-thuong", 55, "Anh Hòa"],
  ["HC-014", "huu-co", "Bình Thạnh", "Chung cư cũ, chân cầu thang C", "Đường Xô Viết Nghệ Tĩnh, Phường Thạnh Mỹ Tây", -0.006, 0.002, "sap-day", 36, "Anh Hòa"],
  ["TC-015", "tai-che", "Phú Nhuận", "Trước chợ, cạnh trạm xe buýt", "Đường Phan Đăng Lưu, Phường Đức Nhuận", 0.003, 0.002, "day", 52, "Chị Vân"],
  ["QA-016", "quan-ao", "Phú Nhuận", "Nhà văn hóa phường, lối vào chính", "Đường Huỳnh Văn Bánh, Phường Phú Nhuận", -0.003, -0.003, "binh-thuong", 30, "Chị Vân"],
  ["TC-017", "tai-che", "Gò Vấp", "Cổng công viên khu phố", "Đường Phan Văn Trị, Phường Hạnh Thông", 0.002, 0.005, "binh-thuong", 18, "Anh Lộc"],
  ["HC-018", "huu-co", "Gò Vấp", "Chợ phường, góc bán trái cây", "Đường Quang Trung, Phường Gò Vấp", -0.004, -0.002, "binh-thuong", 6, "Anh Lộc"],
  ["QA-019", "quan-ao", "Gò Vấp", "Sân trường trung học, cổng phụ", "Đường Lê Đức Thọ, Phường An Hội Tây", 0.009, -0.004, "binh-thuong", 80, "Anh Lộc"],
  ["TC-020", "tai-che", "Tân Bình", "Trước siêu thị mini, cạnh bãi xe", "Đường Bàu Cát, Phường Tân Bình", 0.004, -0.003, "sap-day", 22, "Cô Hương"],
  ["HC-021", "huu-co", "Tân Bình", "Khu tập thể, sân giữa", "Đường Hoàng Hoa Thám, Phường Bảy Hiền", -0.003, 0.004, "binh-thuong", 14, "Cô Hương"],
  ["TC-022", "tai-che", "Thủ Đức", "Ký túc xá sinh viên, sảnh nhà B", "Đường Võ Văn Ngân, Phường Thủ Đức", 0.004, -0.006, "binh-thuong", 9, "Chị Ngọc"],
  ["QA-023", "quan-ao", "Thủ Đức", "Nhà văn hóa khu phố 2", "Đường Kha Vạn Cân, Phường Linh Xuân", -0.006, 0.003, "binh-thuong", 60, "Chị Ngọc"],
  ["HC-024", "huu-co", "Thủ Đức", "Chợ đầu mối nhỏ, cuối dãy rau", "Đường Lê Văn Việt, Phường Tăng Nhơn Phú", 0.002, 0.012, "binh-thuong", 4, "Chị Ngọc"],
];

export function binsSeed(): Bin[] {
  return BIN_DRAFTS.map(([code, type, area, name, address, dLat, dLng, level, emptied, collaborator]) => ({
    id: code.toLowerCase(),
    code,
    type,
    name,
    area,
    address,
    ...at(area, dLat, dLng),
    level,
    lastEmptiedAt: ago(emptied),
    collaborator,
  }));
}

/** Lượt bỏ đồ và báo thùng đầy của người khác — để hàng chờ của cộng tác viên có sẵn việc. */
export function dropoffsSeed(): Dropoff[] {
  return [
    { id: "do-mau-1", binId: "tc-003", binCode: "TC-003", binType: "tai-che", userName: "Anh Duy", material: "Chai nhựa PET", estKg: 2, photos: [], at: ago(1), status: "cho-kiem-tra", points: 5, capped: false },
    { id: "do-mau-2", binId: "qa-016", binCode: "QA-016", binType: "quan-ao", userName: "Chị Vy", material: "Quần áo", estKg: 4, photos: [], at: ago(2), status: "cho-kiem-tra", points: 12, capped: false },
    { id: "do-mau-3", binId: "hc-018", binCode: "HC-018", binType: "huu-co", userName: "Cô Mai", material: "Vỏ rau củ, trái cây", estKg: 2, photos: [], at: ago(5), status: "cho-kiem-tra", points: 2, capped: false },
    { id: "do-mau-4", binId: "tc-012", binCode: "TC-012", binType: "tai-che", userName: "Anh Khôi", material: "Lon nhôm", estKg: 0.5, photos: [], at: ago(26), status: "dat", points: 5, capped: false, reviewedAt: ago(24), reviewer: "Anh Hòa", actualKg: 0.5 },
  ];
}

export function binReportsSeed(): BinReport[] {
  return [
    { id: "bc-mau-1", binId: "hc-004", level: "day", userName: "Chị Lan", at: ago(3), status: "moi", merged: 1, points: 5 },
    { id: "bc-mau-2", binId: "tc-015", level: "day", userName: "Anh Phúc", at: ago(5), status: "da-xac-nhan", merged: 0, points: 5 },
  ];
}
