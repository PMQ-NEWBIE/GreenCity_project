export const INK_SOURCES = [
  { id: "hero", text: "Đồ cũ nhà bạn chưa phải là rác.", trackingEm: -0.03 },
  { id: "features", text: "Ba việc bạn làm được ngay hôm nay", trackingEm: -0.02 },
  { id: "feature-1", text: "Bán ve chai trong một phút", trackingEm: -0.01 },
  { id: "feature-2", text: "Tách loại, bán được giá", trackingEm: -0.01 },
  { id: "feature-3", text: "Gọi người tới tận nhà", trackingEm: -0.01 },
  { id: "num-1", text: "01", trackingEm: -0.02 },
  { id: "num-2", text: "02", trackingEm: -0.02 },
  { id: "num-3", text: "03", trackingEm: -0.02 },
  { id: "cta", text: "Nhà bạn đang có gì cần dọn?", trackingEm: -0.02 },
] as const;

export type InkId = (typeof INK_SOURCES)[number]["id"];
