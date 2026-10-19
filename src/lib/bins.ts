/**
 * Thùng thu gom cố định: điểm khi bỏ đồ, giới hạn theo ngày, gộp báo thùng đầy trùng.
 * Hàm thuần, chỉ import kiểu — test được bằng `node --test`.
 */
import type { BinLevel, BinReport, BinType, Dropoff, PointEntry, PointRule } from "@/types/features";

/** Mỗi loại thùng tính điểm theo một quy tắc trong POINT_RULES. */
export const BIN_RULE_ID: Record<BinType, string> = {
  "tai-che": "bin-recycle",
  "quan-ao": "bin-clothes",
  "huu-co": "bin-organic",
};

/** Báo trùng: cùng thùng, trong vòng bao lâu thì gộp lại. */
export const DUPLICATE_REPORT_HOURS = 6;

function sameLocalDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * Điểm dự kiến cho một lượt bỏ đồ. Quy tắc tính theo "kg" thì nhân khối lượng,
 * theo "lần" thì cộng cố định. capped = đã chạm giới hạn trong ngày → 0 điểm.
 */
export function dropoffPoints(
  binType: BinType,
  kg: number,
  rules: readonly PointRule[],
  history: { dropoffs: readonly Dropoff[]; userId: string | undefined; now: Date }
): { points: number; capped: boolean; rule: PointRule | undefined } {
  const rule = rules.find((r) => r.id === BIN_RULE_ID[binType]);
  if (!rule) return { points: 0, capped: false, rule };
  if (rule.dailyCap != null) {
    const today = history.dropoffs.filter(
      (d) =>
        d.userId === history.userId &&
        d.binType === binType &&
        d.status !== "khong-dat" &&
        !d.capped &&
        sameLocalDay(new Date(d.at), history.now)
    ).length;
    if (today >= rule.dailyCap) return { points: 0, capped: true, rule };
  }
  const points = rule.unit === "kg" ? Math.max(0, Math.floor(rule.points * kg)) : rule.points;
  return { points, capped: false, rule };
}

/** Báo cáo còn mở (chưa xử lý xong / chưa bị bác) của thùng này trong cửa sổ gộp trùng. */
export function openReportFor(reports: readonly BinReport[], binId: string, now: Date): BinReport | undefined {
  const since = now.getTime() - DUPLICATE_REPORT_HOURS * 3_600_000;
  return reports.find(
    (r) => r.binId === binId && (r.status === "moi" || r.status === "da-xac-nhan") && new Date(r.at).getTime() >= since
  );
}

/** Người này hôm nay đã được tính điểm báo đầy cho thùng này chưa (giới hạn của quy tắc bin-full). */
export function fullReportCapped(
  reports: readonly BinReport[],
  binId: string,
  userId: string | undefined,
  rule: PointRule | undefined,
  now: Date
): boolean {
  if (!rule?.dailyCap) return false;
  const count = reports.filter(
    (r) => r.binId === binId && r.userId === userId && r.points > 0 && r.status !== "khong-dung" && sameLocalDay(new Date(r.at), now)
  ).length;
  return count >= rule.dailyCap;
}

const LEVEL_RANK: Record<BinLevel, number> = { "binh-thuong": 0, "sap-day": 1, day: 2, "dang-xu-ly": 3 };

/** Báo đầy chỉ nâng mức, không hạ (thùng đang đi đổ thì giữ nguyên). */
export function raiseLevel(current: BinLevel, reported: "sap-day" | "day"): BinLevel {
  return LEVEL_RANK[reported] > LEVEL_RANK[current] ? reported : current;
}

/** Mục điểm đang chờ thuộc các báo cáo/lượt bỏ đồ — để duyệt hoặc bác cùng lúc. */
export function pendingEntryIds(entries: readonly PointEntry[], refIds: readonly string[]): string[] {
  const set = new Set(refIds);
  return entries.filter((e) => e.status === "pending" && e.refId && set.has(e.refId)).map((e) => e.id);
}
