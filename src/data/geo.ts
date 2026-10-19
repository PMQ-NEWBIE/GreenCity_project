import type { Area } from "@/types";
import { distanceMeters } from "@/lib/geo";

export { distanceMeters };

/** Tâm gần đúng của từng quận — dùng khi người dùng không cho lấy vị trí, và để rải dữ liệu mẫu. */
export const AREA_CENTER: Record<Area, { lat: number; lng: number }> = {
  "Quận 1": { lat: 10.7769, lng: 106.7009 },
  "Quận 3": { lat: 10.7843, lng: 106.6844 },
  "Quận 5": { lat: 10.754, lng: 106.6634 },
  "Quận 7": { lat: 10.734, lng: 106.7218 },
  "Quận 10": { lat: 10.7746, lng: 106.6679 },
  "Bình Thạnh": { lat: 10.8106, lng: 106.7091 },
  "Phú Nhuận": { lat: 10.7992, lng: 106.6803 },
  "Gò Vấp": { lat: 10.8387, lng: 106.6653 },
  "Tân Bình": { lat: 10.8015, lng: 106.6527 },
  "Thủ Đức": { lat: 10.8494, lng: 106.7537 },
};

/** Quận gần nhất với một tọa độ (để điền sẵn khi lấy được vị trí). */
export function nearestArea(p: { lat: number; lng: number }): Area {
  let best: Area = "Quận 1";
  let bestD = Infinity;
  for (const [area, c] of Object.entries(AREA_CENTER) as [Area, { lat: number; lng: number }][]) {
    const d = distanceMeters(p, c);
    if (d < bestD) {
      bestD = d;
      best = area;
    }
  }
  return best;
}

/** Tọa độ trong khoảng TP.HCM (bỏ qua vị trí GPS sai lệch hoặc ở tỉnh khác). */
export function inHcmc(p: { lat: number; lng: number }): boolean {
  return p.lat > 10.35 && p.lat < 11.2 && p.lng > 106.3 && p.lng < 107.05;
}
