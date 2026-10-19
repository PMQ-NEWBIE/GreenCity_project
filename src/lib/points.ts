/**
 * Tính điểm thưởng — hàm thuần, không dính React, test được bằng `node --test`.
 * Chỉ import kiểu (bị xóa khi chạy) nên Node đọc thẳng file .ts này được.
 */
import type { PointEntry, PointRule, Redemption, RedemptionStatus } from "@/types/features";

/** Số dư: tổng các mục đã ghi nhận (cả cộng lẫn trừ). */
export function balanceOf(entries: readonly PointEntry[]): number {
  return entries.reduce((sum, e) => (e.status === "confirmed" ? sum + e.delta : sum), 0);
}

/** Điểm đang chờ xác minh (chỉ tính phần cộng). */
export function pendingOf(entries: readonly PointEntry[]): number {
  return entries.reduce((sum, e) => (e.status === "pending" && e.delta > 0 ? sum + e.delta : sum), 0);
}

/** Điểm cho một quy tắc theo số lượng (kg hoặc số lần), làm tròn xuống. */
export function pointsFor(rule: PointRule, quantity = 1): number {
  return Math.max(0, Math.floor(rule.points * quantity));
}

function sameLocalDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Số mục (chưa bị từ chối) thỏa điều kiện, ghi nhận trong cùng ngày với `now`. */
export function countToday(
  entries: readonly PointEntry[],
  match: (e: PointEntry) => boolean,
  now: Date = new Date()
): number {
  return entries.filter((e) => e.status !== "rejected" && match(e) && sameLocalDay(new Date(e.at), now)).length;
}

/** Còn được cộng điểm theo quy tắc này trong hôm nay không (quy tắc không có giới hạn → luôn được). */
export function canEarnToday(
  entries: readonly PointEntry[],
  rule: PointRule,
  match: (e: PointEntry) => boolean,
  now: Date = new Date()
): boolean {
  if (rule.dailyCap == null) return true;
  return countToday(entries, match, now) < rule.dailyCap;
}

/** Duyệt hoặc từ chối một mục đang chờ. Mục đã quyết định rồi thì giữ nguyên. */
export function applyDecision(
  entry: PointEntry,
  decision: "confirmed" | "rejected",
  patch: { delta?: number; note?: string } = {}
): PointEntry {
  if (entry.status !== "pending") return entry;
  return {
    ...entry,
    status: decision,
    delta: patch.delta ?? entry.delta,
    note: patch.note ?? entry.note,
  };
}

export type RedeemBlock = "not_logged_in" | "out_of_stock" | "not_enough_points";

/** Kiểm tra theo đúng thứ tự: đăng nhập → còn hàng → đủ điểm. null = được đổi. */
export function checkRedeem(input: {
  loggedIn: boolean;
  stockLeft: number;
  balance: number;
  cost: number;
}): RedeemBlock | null {
  if (!input.loggedIn) return "not_logged_in";
  if (input.stockLeft <= 0) return "out_of_stock";
  if (input.balance < input.cost) return "not_enough_points";
  return null;
}

/** Bỏ 0, O, 1, I để đọc mã qua điện thoại không bị nhầm. */
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Mã nhận quà dạng GC-XXXX-XXXX. */
export function makeRedeemCode(random: () => number = Math.random): string {
  const block = () =>
    Array.from({ length: 4 }, () => CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)]).join("");
  return `GC-${block()}-${block()}`;
}

export const REDEEM_VALID_DAYS = 14;

/** "ready" quá hạn thì thành "expired" — tính lúc đọc, không lưu. */
export function redemptionStatus(r: Redemption, now: Date = new Date()): RedemptionStatus {
  if (r.status === "ready" && new Date(r.expiresAt).getTime() < now.getTime()) return "expired";
  return r.status;
}
