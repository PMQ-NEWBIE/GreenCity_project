import type { Area } from "@/types";
import { AREA_CENTER } from "./geo";

/** Địa điểm chỉ dùng cho Bản đồ xanh (dữ liệu minh họa, tên hư cấu). */
export interface MapPlace {
  id: string;
  name: string;
  area: Area;
  address: string;
  lat: number;
  lng: number;
  note: string;
}

function place(id: string, name: string, area: Area, address: string, dLat: number, dLng: number, note: string): MapPlace {
  const c = AREA_CENTER[area];
  return { id, name, area, address, note, lat: Math.round((c.lat + dLat) * 1e5) / 1e5, lng: Math.round((c.lng + dLng) * 1e5) / 1e5 };
}

/** Điểm thu mua tái chế, vựa ve chai nhận bán lẻ. */
export const RECYCLE_POINTS: MapPlace[] = [
  place("vua-minh-duc", "Vựa phế liệu Minh Đức", "Tân Bình", "Đường Bàu Cát, Phường Tân Bình", 0.006, 0.002, "Nhận sắt, nhôm, đồ điện tử. 7:00–17:00."),
  place("vua-co-sau", "Điểm thu mua Cô Sáu", "Quận 10", "Đường Sư Vạn Hạnh, Phường Diên Hồng", -0.003, -0.004, "Giấy, chai nhựa, lon. Sáng đến trưa."),
  place("vua-tu-hoa", "Vựa ve chai Tư Hòa", "Bình Thạnh", "Đường Nơ Trang Long, Phường Bình Thạnh", 0.007, 0.001, "Nhận đồ cồng kềnh, có xe ba gác."),
  place("diem-thu-q7", "Điểm thu gom tái chế khu phố 4", "Quận 7", "Đường Huỳnh Tấn Phát, Phường Tân Thuận", -0.002, 0.007, "Thứ Bảy, Chủ nhật 8:00–11:00."),
  place("vua-thu-duc", "Vựa nhựa Thủ Đức Xanh", "Thủ Đức", "Đường Võ Văn Ngân, Phường Thủ Đức", -0.004, 0.004, "Chuyên nhựa PET và HDPE đã phân loại."),
  place("diem-thu-q5", "Điểm đổi pin cũ", "Quận 5", "Đường Trần Hưng Đạo, Phường Chợ Quán", 0.004, -0.002, "Nhận pin, bóng đèn hỏng để xử lý riêng."),
];

/** Vườn cộng đồng nhận rác hữu cơ đã ủ, có buổi hướng dẫn trồng rau. */
export const GARDENS: MapPlace[] = [
  place("vuon-binh-thanh", "Vườn rau khu phố 12", "Bình Thạnh", "Đường Bùi Đình Túy, Phường Gia Định", -0.003, -0.005, "Hướng dẫn ủ phân sáng Chủ nhật."),
  place("vuon-go-vap", "Vườn cộng đồng Hạnh Thông", "Gò Vấp", "Đường Phan Văn Trị, Phường Hạnh Thông", 0.005, -0.006, "Nhận phân ủ từ thùng hữu cơ HC-018."),
  place("vuon-thu-duc", "Vườn sân thượng ký túc xá", "Thủ Đức", "Đường Kha Vạn Cân, Phường Linh Xuân", 0.008, -0.004, "Sinh viên tự quản, cần thêm người tưới cuối tuần."),
  place("vuon-q3", "Vườn hẻm xanh Võ Thị Sáu", "Quận 3", "Đường Trần Quốc Thảo, Phường Võ Thị Sáu", -0.002, 0.005, "Trồng rau thơm trong thùng xốp tái sử dụng."),
  place("vuon-phu-nhuan", "Vườn nhà văn hóa phường", "Phú Nhuận", "Đường Huỳnh Văn Bánh, Phường Phú Nhuận", 0.003, 0.004, "Mở cửa 6:00–9:00 hằng ngày."),
];
