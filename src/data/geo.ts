import type { Area } from "@/types";

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

/** Khoảng cách (mét) giữa hai điểm theo công thức haversine. */
export function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

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
