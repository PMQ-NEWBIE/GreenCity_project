import type { LitterReport, LitterSize, LitterStatus } from "@/types/features";
import { AREA_CENTER } from "./geo";

export const LITTER_SIZE: Record<LitterSize, { label: string; desc: string }> = {
  nho: { label: "Nhỏ", desc: "Vài túi rác vứt bừa" },
  vua: { label: "Vừa", desc: "Một đống cao tới đầu gối" },
  lon: { label: "Lớn", desc: "Cả bãi, lấn ra lòng đường hoặc kênh" },
};

export const LITTER_STATUS_LABEL: Record<LitterStatus, string> = {
  "cho-xac-minh": "Chờ xác minh",
  "da-xac-minh": "Đã xác minh",
  "khong-hop-le": "Không hợp lệ",
  "da-don": "Đã dọn",
};

export const LITTER_REJECT_REASONS = ["Ảnh không rõ", "Tới nơi không thấy rác", "Trùng báo cáo khác"] as const;

const ago = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();
const near = (area: keyof typeof AREA_CENTER, dLat: number, dLng: number) => ({
  lat: Math.round((AREA_CENTER[area].lat + dLat) * 1e5) / 1e5,
  lng: Math.round((AREA_CENTER[area].lng + dLng) * 1e5) / 1e5,
});

/** Báo cáo mẫu của người khác (dữ liệu minh họa) — cho hàng chờ xác minh và bản đồ. */
export function litterSeed(): LitterReport[] {
  return [
    { id: "dr-mau-1", userName: "Anh Duy", photos: [], ...near("Bình Thạnh", 0.004, 0.006), locationSource: "gps", area: "Bình Thạnh", address: "Chân cầu, bờ kênh Nhiêu Lộc", size: "vua", description: "Túi rác và xà bần đổ dưới chân cầu, bốc mùi.", at: ago(2), status: "cho-xac-minh", points: 20 },
    { id: "dr-mau-2", userName: "Chị Thảo", photos: [], ...near("Gò Vấp", -0.006, 0.003), locationSource: "gps", area: "Gò Vấp", address: "Bãi đất trống cuối hẻm", size: "lon", description: "Nệm cũ, bàn ghế gãy và rác sinh hoạt chất thành đống.", at: ago(6), status: "cho-xac-minh", points: 20 },
    { id: "dr-mau-3", userName: "Cô Hạnh", photos: [], ...near("Quận 7", 0.006, -0.002), locationSource: "gps", area: "Quận 7", address: "Vỉa hè trước công trình đang xây", size: "nho", description: "Mấy bao xi măng rách và chai nhựa.", at: ago(20), status: "da-xac-minh", points: 20, verifiedAt: ago(18), verifier: "Anh Bảo" },
    { id: "dr-mau-4", userName: "Anh Phúc", photos: [], ...near("Quận 10", -0.002, 0.005), locationSource: "tay", area: "Quận 10", address: "Góc chợ, cạnh cột điện", size: "nho", description: "Rác chợ chưa được gom.", at: ago(40), status: "da-don", points: 20, verifiedAt: ago(38), verifier: "Chị Hằng", cleanedAt: ago(30) },
    { id: "dr-mau-5", userName: "Chú Bảy", photos: [], ...near("Thủ Đức", 0.005, 0.009), locationSource: "gps", area: "Thủ Đức", address: "Lề đường gần trạm xe buýt", size: "vua", description: "Rác đổ trộm ban đêm.", at: ago(10), status: "khong-hop-le", points: 0, rejectReason: "Tới nơi không thấy rác", verifiedAt: ago(8), verifier: "Chị Ngọc" },
  ];
}
