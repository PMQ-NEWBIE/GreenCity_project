import type { LotGrade, LotSellerKind, LotStatus, MaterialLot } from "@/types/features";
import { IMAGES } from "./mock-data";

export const LOT_STATUS_LABEL: Record<LotStatus, string> = {
  "san-sang": "Đang bán",
  "dang-giu": "Đang giữ",
  "da-ban": "Đã bán",
};

export const LOT_GRADE_HINT: Record<LotGrade, string> = {
  A: "Sạch, đúng loại, dùng ngay",
  B: "Lẫn ít tạp chất, cần lọc nhẹ",
  C: "Lẫn nhiều, giá thấp",
};

export const LOT_SELLER_KIND_LABEL: Record<LotSellerKind, string> = {
  vua: "Vựa",
  "diem-thu-gom": "Điểm thu gom",
};

/**
 * Loại vật liệu bán theo lô (khớp nhãn MATERIAL_OPTIONS để nối với đơn thu gom).
 * Rác hữu cơ (rau củ, trái cây hết hạn ở chợ) bán cho doanh nghiệp làm phân hữu cơ.
 */
export const LOT_MATERIALS = ["Giấy & bìa carton", "Chai nhựa PET", "Nhựa các loại", "Lon nhôm", "Sắt & kim loại", "Chai lọ thủy tinh", "Rác hữu cơ"] as const;

export const LOT_IMAGE: Record<string, string> = {
  "Giấy & bìa carton": IMAGES.cardboard,
  "Chai nhựa PET": IMAGES.petBottles,
  "Nhựa các loại": IMAGES.plastic,
  "Lon nhôm": IMAGES.aluminum,
  "Sắt & kim loại": IMAGES.metal,
  "Chai lọ thủy tinh": IMAGES.glassBottles,
  // Chưa có ảnh chụp thật lô rác hữu cơ → LotCard hiện ô biểu tượng
  "Rác hữu cơ": "",
};

const ago = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();
const ahead = (h: number) => new Date(Date.now() + h * 3_600_000).toISOString();

/** Lô mẫu (dữ liệu minh họa, kho và doanh nghiệp hư cấu). */
export function lotsSeed(): MaterialLot[] {
  const lot = (
    id: string,
    material: (typeof LOT_MATERIALS)[number],
    weightKg: number,
    pricePerKg: number,
    grade: LotGrade,
    purity: number,
    moisture: number,
    warehouse: string,
    area: MaterialLot["area"],
    inspector: string,
    inspectedHoursAgo: number,
    note: string,
    extra: Partial<MaterialLot> = {}
  ): MaterialLot => ({
    id,
    code: `LO-${id.slice(-4).toUpperCase()}`,
    material,
    weightKg,
    pricePerKg,
    grade,
    purity,
    moisture,
    warehouse,
    area,
    inspector,
    inspectedAt: ago(inspectedHoursAgo),
    image: LOT_IMAGE[material],
    note,
    status: "san-sang",
    ...extra,
  });
  return [
    lot("lo-gc01", "Giấy & bìa carton", 1200, 3600, "A", 96, 8, "Kho Gò Vấp", "Gò Vấp", "Anh Lộc", 20, "Đã ép kiện 40kg, khô, không dính băng keo.", { sellerName: "Vựa Minh Đức", sellerKind: "vua" }),
    lot("lo-pt02", "Chai nhựa PET", 650, 6200, "A", 94, 3, "Kho Bình Thạnh", "Bình Thạnh", "Anh Hòa", 30, "Chai trong, đã bỏ nắp và nhãn, ép dẹt đóng bao.", { sellerName: "Vựa Tư Hòa", sellerKind: "vua" }),
    lot("lo-al03", "Lon nhôm", 280, 26000, "B", 88, 2, "Kho Tân Bình", "Tân Bình", "Cô Hương", 12, "Lẫn ít lon sắt, đã ép khối.", {
      status: "dang-giu",
      reservation: { businessId: "namviet@vidu.vn", businessName: "Công ty Tái chế Nam Việt", at: ago(10), expiresAt: ahead(38), pickupAt: ahead(20), note: "Xe 2,5 tấn tới lấy." },
    }),
    lot("lo-sk04", "Sắt & kim loại", 2300, 7500, "B", 85, 1, "Kho Thủ Đức", "Thủ Đức", "Chị Ngọc", 48, "Sắt vụn xây dựng, đã tách tôn mỏng riêng.", { sellerName: "Vựa Thủ Đức Xanh", sellerKind: "vua" }),
    lot("lo-tt05", "Chai lọ thủy tinh", 900, 900, "C", 72, 5, "Kho Quận 7", "Quận 7", "Anh Bảo", 60, "Lẫn mảnh vỡ, chưa tách màu."),
    lot("lo-nh06", "Nhựa các loại", 540, 3800, "B", 83, 4, "Kho Bình Thạnh", "Bình Thạnh", "Anh Hòa", 26, "Nhựa HDPE và PP, đã rửa sơ."),
    lot("lo-gc07", "Giấy & bìa carton", 800, 3200, "B", 87, 12, "Kho Quận 10", "Quận 10", "Chị Hằng", 70, "Lẫn giấy báo, hơi ẩm do mưa."),
    lot("lo-hc09", "Rác hữu cơ", 320, 800, "A", 92, 70, "Điểm thu gom chợ Gò Vấp", "Gò Vấp", "Anh Lộc", 6, "Trái cây, rau củ hết hạn gom ở góc chợ trong 2 ngày, chưa lẫn túi nilon.", {
      sellerName: "Điểm thu gom chợ Gò Vấp",
      sellerKind: "diem-thu-gom",
    }),
    lot("lo-hc10", "Rác hữu cơ", 180, 700, "B", 80, 75, "Điểm thu gom chợ tạm Quận 7", "Quận 7", "Anh Bảo", 30, "Rau củ héo, vỏ trái cây; lẫn ít bao bì giấy.", { sellerName: "Điểm thu gom chợ tạm Quận 7", sellerKind: "diem-thu-gom" }),
    lot("lo-pt08", "Chai nhựa PET", 400, 6000, "A", 95, 3, "Kho Gò Vấp", "Gò Vấp", "Anh Lộc", 100, "Lô đã chốt bán tuần trước.", {
      status: "da-ban",
      soldAt: ago(80),
      soldTo: "Xưởng hạt nhựa Phước Long",
    }),
  ];
}
