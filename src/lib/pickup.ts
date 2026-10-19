/**
 * Đơn thu gom tận nhà — chuyển trạng thái và tính tiền/điểm. Hàm thuần, test được bằng `node --test`.
 * Chỉ import kiểu nên Node đọc thẳng file .ts này được; quy tắc điểm truyền vào từ ngoài.
 */
import type { PayoutMethod, PickupRequest, PickupStatus, PointRule, WeighLine } from "@/types/features";

export const PICKUP_FLOW: PickupStatus[] = ["cho-nhan", "da-nhan", "dang-den", "da-can", "hoan-tat"];

export function stepIndex(status: PickupStatus): number {
  return PICKUP_FLOW.indexOf(status);
}

export function isFinal(status: PickupStatus): boolean {
  return status === "hoan-tat" || status === "da-huy";
}

/** Người gửi chỉ hủy được khi đội thu gom chưa lên đường. */
export function canCancel(status: PickupStatus): boolean {
  return status === "cho-nhan" || status === "da-nhan";
}

function push(req: PickupRequest, status: PickupStatus, now: string, note?: string): PickupRequest {
  return { ...req, status, history: [...req.history, { status, at: now, note }] };
}

function expect(req: PickupRequest, from: PickupStatus) {
  if (req.status !== from) throw new Error(`Đơn ${req.id} đang ở "${req.status}", không phải "${from}"`);
}

export function assignTeam(
  req: PickupRequest,
  team: NonNullable<PickupRequest["team"]>,
  appointment: string,
  now: string
): PickupRequest {
  expect(req, "cho-nhan");
  return { ...push(req, "da-nhan", now, `${team.name} nhận đơn`), team, appointment };
}

export function startTrip(req: PickupRequest, now: string): PickupRequest {
  expect(req, "da-nhan");
  return push(req, "dang-den", now);
}

export function recordWeighing(
  req: PickupRequest,
  lines: WeighLine[],
  sortedConfirmed: boolean,
  now: string
): PickupRequest {
  expect(req, "dang-den");
  const clean = lines.filter((l) => l.kg > 0);
  if (clean.length === 0) throw new Error("Cần ít nhất một dòng cân có khối lượng");
  return { ...push(req, "da-can", now), weighLines: clean, sortedConfirmed };
}

export function cancel(req: PickupRequest, reason: string, now: string): PickupRequest {
  if (!canCancel(req.status)) throw new Error(`Không hủy được đơn ở trạng thái "${req.status}"`);
  return { ...push(req, "da-huy", now, reason), cancelReason: reason };
}

export function totalKg(lines: readonly WeighLine[] = []): number {
  return Math.round(lines.reduce((s, l) => s + l.kg, 0) * 10) / 10;
}

export function totalAmount(lines: readonly WeighLine[] = []): number {
  return Math.round(lines.reduce((s, l) => s + l.kg * l.pricePerKg, 0));
}

export interface PickupPoints {
  /** Điểm theo kg đã cân */
  kg: number;
  /** Điểm thưởng thêm khi đội xác nhận đã phân loại sẵn */
  sorted: number;
  /** Điểm quy đổi từ tiền ve chai (chỉ khi chọn nhận điểm) */
  cash: number;
}

/** rules: POINT_RULES — tìm theo id để đổi số ở một chỗ là đúng toàn bộ. */
export function pickupPoints(
  lines: readonly WeighLine[],
  sortedConfirmed: boolean,
  method: PayoutMethod,
  rules: readonly PointRule[]
): PickupPoints {
  const rule = (id: string) => rules.find((r) => r.id === id);
  const perKg = rule("pickup-kg")?.points ?? 0;
  const sortedBonus = rule("pickup-sorted")?.points ?? 0;
  const perThousand = rule("pickup-cash-to-points")?.points ?? 0;
  return {
    kg: Math.floor(totalKg(lines) * perKg),
    sorted: sortedConfirmed ? sortedBonus : 0,
    cash: method === "quy-diem" ? Math.floor(totalAmount(lines) / 1000) * perThousand : 0,
  };
}

/** Hoàn tất: ghi cách thanh toán. Chọn quy ra điểm thì tiền mặt trả = 0. */
export function complete(
  req: PickupRequest,
  method: PayoutMethod,
  rules: readonly PointRule[],
  now: string
): { request: PickupRequest; points: PickupPoints } {
  expect(req, "da-can");
  const lines = req.weighLines ?? [];
  const points = pickupPoints(lines, !!req.sortedConfirmed, method, rules);
  const amount = method === "quy-diem" ? 0 : totalAmount(lines);
  return {
    request: {
      ...push(req, "hoan-tat", now),
      payout: { method, amount, points: points.kg + points.sorted + points.cash },
    },
    points,
  };
}
