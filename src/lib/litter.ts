/**
 * Báo điểm rác tự phát — tìm báo cáo trùng. Hàm thuần, chỉ import kiểu.
 * Hàm tính khoảng cách truyền vào từ ngoài (src/data/geo.ts) để file này không có import chạy thật.
 */
import type { LitterReport } from "@/types/features";

export const DUPLICATE_RADIUS_M = 100;
export const DUPLICATE_HOURS = 24;

type Distance = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => number;

/** Chữ thường, bỏ dấu, gộp khoảng trắng — để so địa chỉ gõ tay. */
export function normalizeAddress(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Báo cáo còn hiệu lực (chưa bị bác, chưa dọn) gần vị trí này trong 24 giờ qua.
 * Có tọa độ cả hai bên → so khoảng cách; không thì so cùng quận + cùng địa chỉ.
 */
export function findDuplicate(
  reports: readonly LitterReport[],
  candidate: { lat?: number; lng?: number; area: string; address: string },
  now: Date,
  distance: Distance
): { report: LitterReport; meters: number | null } | null {
  const since = now.getTime() - DUPLICATE_HOURS * 3_600_000;
  const addr = normalizeAddress(candidate.address);
  for (const r of reports) {
    if (r.status === "khong-hop-le" || r.status === "da-don") continue;
    if (new Date(r.at).getTime() < since) continue;
    if (candidate.lat != null && candidate.lng != null && r.lat != null && r.lng != null) {
      const m = distance({ lat: candidate.lat, lng: candidate.lng }, { lat: r.lat, lng: r.lng });
      if (m <= DUPLICATE_RADIUS_M) return { report: r, meters: Math.round(m) };
    } else if (addr && r.area === candidate.area && normalizeAddress(r.address) === addr) {
      return { report: r, meters: null };
    }
  }
  return null;
}
