import { AREAS } from "@/types";
import { MATERIAL_GROUPS, lastMonths, type MaterialGroup, type StatRow } from "@/lib/stats";

/** Mức thu gom tương đối mỗi quận và mỗi nhóm (minh họa) — để số liệu trông có khác biệt hợp lý. */
const AREA_WEIGHT: Record<string, number> = {
  "Quận 1": 0.7, "Quận 3": 0.9, "Quận 5": 0.8, "Quận 7": 1.2, "Quận 10": 0.9,
  "Bình Thạnh": 1.4, "Phú Nhuận": 0.8, "Gò Vấp": 1.5, "Tân Bình": 1.1, "Thủ Đức": 1.6,
};
const GROUP_KG: Record<MaterialGroup, number> = { Giấy: 420, Nhựa: 260, "Kim loại": 180, "Thủy tinh": 90, Khác: 110 };

/** Số giả ngẫu nhiên cố định theo chuỗi — cùng đầu vào luôn ra cùng số. */
function rand(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}

/**
 * Lịch sử 6 tháng trước và tháng hiện tại tính tới hôm nay (dữ liệu minh họa, tăng dần theo thời gian).
 * Hoạt động thật trong trình duyệt được cộng thêm vào tháng hiện tại.
 */
export function statsSeed(now: Date = new Date()): StatRow[] {
  const months = lastMonths(now, 7);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const rows: StatRow[] = [];
  months.forEach((month, mi) => {
    // Tháng hiện tại mới đi được một phần
    const partial = mi === months.length - 1 ? now.getDate() / daysInMonth : 1;
    const growth = (0.75 + mi * 0.06) * partial;
    for (const area of AREAS) {
      for (const group of MATERIAL_GROUPS) {
        const k = `${month}|${area}|${group}`;
        rows.push({
          month,
          area,
          group,
          kg: Math.round(GROUP_KG[group] * AREA_WEIGHT[area] * growth * (0.8 + rand(k) * 0.4)),
          dropOk: group === "Khác" ? Math.round(30 * AREA_WEIGHT[area] * growth * (0.8 + rand(k + "ok") * 0.4)) : 0,
          dropBad: group === "Khác" ? Math.round(5 * (0.6 + rand(k + "bad") * 0.8)) : 0,
          litterDone: group === "Khác" ? Math.round(3 + rand(k + "lit") * 5) : 0,
          litterHours: 0,
        });
        const last = rows[rows.length - 1];
        if (last.litterDone) last.litterHours = last.litterDone * (18 + rand(k + "h") * 30);
      }
    }
  });
  return rows;
}
