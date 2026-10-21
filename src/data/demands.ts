import type { PurchaseDemand } from "@/types/features";

const ago = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

/** Nhu cầu thu mua mẫu của doanh nghiệp (tên hư cấu). Tạo lại mỗi lần mở trang. */
export function demandsSeed(): PurchaseDemand[] {
  return [
    {
      id: "nc-mau-1",
      businessId: "demo:phan-huu-co-ba-la",
      businessName: "Phân hữu cơ Ba Lá",
      material: "Rác hữu cơ",
      kg: 500,
      pricePerKg: 900,
      area: "Gò Vấp",
      note: "Cần rau củ, trái cây hết hạn từ chợ để ủ phân. Không lẫn túi nilon, thịt cá. Nhận mỗi sáng thứ Hai, thứ Năm.",
      createdAt: ago(5),
      status: "dang-mua",
      offers: [],
    },
    {
      id: "nc-mau-2",
      businessId: "demo:nhua-tai-sinh-phuong-nam",
      businessName: "Nhựa tái sinh Phương Nam",
      material: "Chai nhựa PET",
      kg: 1000,
      pricePerKg: 6500,
      area: null,
      note: "Chai trong, đã bỏ nắp và nhãn, ép dẹt. Xe tải tự tới lấy từ 300kg.",
      createdAt: ago(20),
      status: "dang-mua",
      offers: [],
    },
    {
      id: "nc-mau-3",
      businessId: "demo:giay-sai-gon-xanh",
      businessName: "Giấy Sài Gòn Xanh",
      material: "Giấy & bìa carton",
      kg: 2000,
      pricePerKg: 3800,
      area: null,
      note: "Bìa carton khô, ép kiện. Giá tốt hơn nếu độ ẩm dưới 10%.",
      createdAt: ago(40),
      status: "dang-mua",
      offers: [],
    },
  ];
}
