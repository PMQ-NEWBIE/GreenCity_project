/**
 * Chợ vật liệu: giữ lô 48 giờ, hết hạn thì tự trả lô. Hàm thuần, chỉ import kiểu.
 */
import type { LotStatus, MaterialLot } from "@/types/features";

export const HOLD_HOURS = 48;

/** Lô đang giữ mà quá hạn thì coi như sẵn sàng lại — tính lúc đọc, không lưu. */
export function effectiveStatus(lot: MaterialLot, now: Date): LotStatus {
  if (lot.status === "dang-giu" && lot.reservation && new Date(lot.reservation.expiresAt).getTime() <= now.getTime()) return "san-sang";
  return lot.status;
}

/** Lô sau khi tính hạn giữ (bỏ thông tin giữ đã hết hạn). */
export function withEffectiveStatus(lot: MaterialLot, now: Date): MaterialLot {
  const status = effectiveStatus(lot, now);
  return status === lot.status ? lot : { ...lot, status, reservation: undefined };
}

export function holdExpiresAt(now: Date): string {
  return new Date(now.getTime() + HOLD_HOURS * 3_600_000).toISOString();
}

export function lotValue(lot: Pick<MaterialLot, "weightKg" | "pricePerKg">): number {
  return Math.round(lot.weightKg * lot.pricePerKg);
}

export type ReserveBlock = "not_available" | "pickup_too_soon" | "pickup_after_hold";

/** Giờ hẹn lấy hàng phải sau ít nhất 2 giờ và trước khi hết hạn giữ. */
export function checkReserve(lot: MaterialLot, pickupAt: Date, now: Date): ReserveBlock | null {
  if (effectiveStatus(lot, now) !== "san-sang") return "not_available";
  if (pickupAt.getTime() < now.getTime() + 2 * 3_600_000) return "pickup_too_soon";
  if (pickupAt.getTime() > new Date(holdExpiresAt(now)).getTime()) return "pickup_after_hold";
  return null;
}

/** Thời gian giữ còn lại, dạng "31 giờ 20 phút". */
export function timeLeft(expiresAt: string, now: Date): string {
  const ms = Math.max(0, new Date(expiresAt).getTime() - now.getTime());
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return h > 0 ? `${h} giờ ${m} phút` : `${m} phút`;
}
