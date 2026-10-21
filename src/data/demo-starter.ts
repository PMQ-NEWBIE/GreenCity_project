import type { DemoUser, Product } from "@/types";
import type { DemandOffer, MaterialLot, Order, OrderStatus, PickupRequest, PointEntry, PurchaseDemand, Redemption } from "@/types/features";
import { POINT_RULES } from "@/data/point-rules";
import { REWARDS } from "@/data/rewards";
import { IMAGES } from "@/data/mock-data";
import { LOT_IMAGE } from "@/data/lots";
import { pickupPoints, totalAmount } from "@/lib/pickup";
import { REDEEM_VALID_DAYS } from "@/lib/points";
import type { Action, AppState } from "@/store/app-store";

/**
 * HOẠT ĐỘNG KHỞI ĐẦU CỦA BẢN DEMO
 *
 * Tài khoản demo vào lần đầu mà trống trơn thì không thấy web "đang chạy" ra sao. Gói này gắn sẵn cho mỗi vai trò
 * vài việc đang dở và vài việc đã xong — đúng như một người đã dùng web được ít hôm:
 * - người dân: 1 tin ve chai có người thu mua vừa đặt (chờ xác nhận), 1 món đã bán xong, 1 món đang mua,
 *   1 lần gọi người tới lấy đã xong (có điểm thưởng)
 * - người thu mua: 1 đơn đang chờ tới lấy, 1 đơn đã xong, 1 yêu cầu tới lấy đã nhận, 2 lô bán cho doanh nghiệp, 1 lời chào hàng đã được nhận
 * - cộng tác viên: 2 phần quà chờ trao, 1 lô rác hữu cơ, 1 lời chào hàng đang chờ
 * - doanh nghiệp: 1 nhu cầu rác hữu cơ có 2 lời chào, 1 lô đang giữ
 * Tên người, vựa, doanh nghiệp đều hư cấu. Mốc thời gian tính lùi từ lúc vào nên lúc nào cũng "mới".
 * Chỉ chạy một lần cho mỗi email (AppState.demoSeeded). Hàm thuần: trả về các action để gửi vào store.
 */
export function demoStarterActions(user: DemoUser, state: AppState, now = Date.now()): Action[] {
  const at = (hoursAgo: number) => new Date(now - hoursAgo * 3_600_000).toISOString();
  const key = user.email.replace(/[^a-z0-9]/gi, "").toLowerCase();
  const id = (part: string) => `demo-${key}-${part}`;
  const actions: Action[] = [];

  const order = (o: Omit<Order, "status" | "events" | "createdAt">, path: OrderStatus[], startHoursAgo: number, endHoursAgo: number): Order => {
    const step = path.length > 1 ? (startHoursAgo - endHoursAgo) / (path.length - 1) : 0;
    return {
      ...o,
      createdAt: at(startHoursAgo),
      status: path[path.length - 1],
      events: path.map((status, i) => ({ at: at(startHoursAgo - step * i), status, by: status === "pending" || status === "cancelled" ? "buyer" : "seller" })),
    };
  };

  if (user.role === "resident") {
    const seller = { name: user.name, type: "individual" as const, rating: 5, deals: 3, joined: user.memberSince || "Hôm nay", initials: (user.name.trim()[0] ?? "B").toUpperCase() };
    const giay: Product = {
      id: id("giay"),
      name: "Giấy vụn, bìa carton dọn kho",
      categoryId: "paper",
      price: 3800,
      unit: "kg",
      area: "Bình Thạnh",
      description: "Dọn kho cuối năm được khoảng 25kg giấy vụn và bìa carton, để khô trong nhà, đã gom vào bao. Tới lấy buổi sáng giúp mình.",
      image: IMAGES.paper,
      postedHoursAgo: 3,
      status: "available",
      seller,
      isMine: true,
    };
    const chai: Product = {
      id: id("chai"),
      name: "Chai bia thủy tinh — cả két",
      categoryId: "glass",
      price: 1200,
      unit: "chai",
      area: "Bình Thạnh",
      description: "Chai bia thủy tinh xanh còn nguyên, đã tráng sạch, khoảng một két 24 chai.",
      image: IMAGES.glass,
      postedHoursAgo: 52,
      status: "sold",
      seller,
      isMine: true,
    };
    actions.push({ type: "ADD_PRODUCT", product: chai }, { type: "ADD_PRODUCT", product: giay });
    // Đánh dấu đã "thấy" tin để người mua mô phỏng không đặt thêm lần nữa
    actions.push({ type: "ORDERS_DEMO_SEEN", productId: giay.id, at: at(3) }, { type: "ORDERS_DEMO_SEEN", productId: chai.id, at: at(52) });
    const snap = (p: Product) => ({ name: p.name, image: p.image, price: p.price, unit: p.unit, area: p.area });

    actions.push(
      {
        type: "ORDERS_UPSERT",
        order: order(
          { id: id("don-giay"), productId: giay.id, product: snap(giay), buyerId: "demo:Anh Tư Hòa (ve chai)", buyerName: "Anh Tư Hòa (ve chai)", sellerId: user.email, sellerName: user.name, quantity: "Khoảng 25 kg", meetTime: "Sáng (8h–11h)", note: "Tôi đi xe ba gác, mang cân theo, cân tại nhà luôn." },
          ["pending"], 0.7, 0.7
        ),
      },
      {
        type: "ORDERS_UPSERT",
        order: order(
          { id: id("don-chai"), productId: chai.id, product: snap(chai), buyerId: "demo:Vựa phế liệu Minh Đức", buyerName: "Vựa phế liệu Minh Đức", sellerId: user.email, sellerName: user.name, quantity: "Cả két 24 chai", meetTime: "Chiều (13h–17h)", note: "" },
          ["pending", "accepted", "done"], 50, 46
        ),
      }
    );
    const ban = state.products.find((p) => p.id === "p6");
    if (ban)
      actions.push({
        type: "ORDERS_UPSERT",
        order: order(
          { id: id("mua-ban"), productId: ban.id, product: snap(ban), buyerId: user.email, buyerName: user.name, sellerId: `demo:${ban.seller.name}`, sellerName: ban.seller.name, quantity: "1 món", meetTime: "Tối (18h–20h)", note: "Mình tới xem bàn trước rồi chở về luôn." },
          ["pending", "accepted"], 20, 18
        ),
      });

    // Một lần gọi người tới lấy đã xong tuần trước
    const lines = [
      { material: "Giấy & bìa carton", kg: 12, pricePerKg: 3500 },
      { material: "Lon nhôm", kg: 3, pricePerKg: 26000 },
    ];
    const pts = pickupPoints(lines, true, "tien-mat", POINT_RULES);
    const pickup: PickupRequest = {
      id: id("thu-gom"),
      ownerId: user.email,
      ownerName: user.name,
      materials: ["Giấy & bìa carton", "Lon nhôm"],
      quantity: "2 bao giấy, 1 túi lon",
      area: "Bình Thạnh",
      address: "Đường Nơ Trang Long, Phường 13",
      time: "Sáng (8h–11h)",
      note: "Gọi trước 15 phút giúp mình.",
      photos: [],
      presorted: true,
      createdAt: at(170),
      status: "hoan-tat",
      history: [
        { status: "cho-nhan", at: at(170) },
        { status: "da-nhan", at: at(168), note: "Anh Tư Hòa (ve chai) nhận đơn" },
        { status: "dang-den", at: at(150) },
        { status: "da-can", at: at(149.5) },
        { status: "hoan-tat", at: at(149.4) },
      ],
      team: { id: "demo:anh-tu-hoa", name: "Anh Tư Hòa (ve chai)", phoneMasked: "09xx xxx 318" },
      appointment: at(150),
      weighLines: lines,
      sortedConfirmed: true,
      payout: { method: "tien-mat", amount: totalAmount(lines), points: pts.kg + pts.sorted },
    };
    actions.push({ type: "COLLECT_ADD", request: pickup });
    const entry = (part: string, delta: number, title: string, hoursAgo: number): PointEntry => ({
      id: id(part), at: at(hoursAgo), delta, reason: "home_pickup", title, status: "confirmed", refId: pickup.id, userId: user.email,
    });
    actions.push({ type: "POINTS_ADD", entry: entry("diem-thu-gom", pts.kg + pts.sorted, "Gọi người tới lấy · 15kg, đã phân loại", 149.4) });
  }

  if (user.role === "partner") {
    const snapOf = (pid: string) => state.products.find((p) => p.id === pid);
    const pet = snapOf("p2");
    if (pet)
      actions.push({
        type: "ORDERS_UPSERT",
        order: order(
          { id: id("mua-pet"), productId: pet.id, product: { name: pet.name, image: pet.image, price: pet.price, unit: pet.unit, area: pet.area }, buyerId: user.email, buyerName: user.name, sellerId: `demo:${pet.seller.name}`, sellerName: pet.seller.name, quantity: "Cả lô 12 kg", meetTime: "Sáng (8h–11h)", note: "Sáng mai tôi ghé, chị để sẵn bao giúp." },
          ["pending", "accepted"], 5, 4
        ),
      });
    // Đơn cũ đã xong — tin đã gỡ, đơn giữ ảnh chụp lại lúc đặt
    actions.push({
      type: "ORDERS_UPSERT",
      order: order(
        { id: id("mua-sat"), productId: id("tin-cu-sat"), product: { name: "Sắt vụn, khung cửa cũ", image: IMAGES.metal, price: 7000, unit: "kg", area: "Gò Vấp" }, buyerId: user.email, buyerName: user.name, sellerId: "demo:Cô Ba", sellerName: "Cô Ba", quantity: "Khoảng 60 kg", meetTime: "Cuối tuần", note: "" },
        ["pending", "accepted", "done"], 80, 72
      ),
    });
    // Một yêu cầu tới lấy đã nhận, hẹn sáng mai
    const team = { id: `u:${user.email}`, name: user.name, phoneMasked: "09xx xxx xxx" };
    actions.push({
      type: "PARTNERS_UPSERT",
      partner: { id: team.id, kind: "thu-gom", name: user.name, areas: ["Gò Vấp"], phoneMasked: team.phoneMasked, contactName: user.name, note: "Tài khoản người mua trên Green City", active: true },
    });
    const tomorrow9 = new Date(now);
    tomorrow9.setDate(tomorrow9.getDate() + 1);
    tomorrow9.setHours(9, 0, 0, 0);
    actions.push({
      type: "COLLECT_ADD",
      request: {
        id: id("toi-lay"),
        ownerName: "Cô Hạnh",
        materials: ["Giấy & bìa carton", "Chai nhựa PET"],
        quantity: "3 bao lớn",
        area: "Gò Vấp",
        address: "Đường Quang Trung, Phường 10",
        time: "Sáng (8h–11h)",
        note: "Nhà có hẻm nhỏ, xe ba gác vào được.",
        photos: [],
        presorted: true,
        createdAt: at(6),
        status: "da-nhan",
        history: [
          { status: "cho-nhan", at: at(6) },
          { status: "da-nhan", at: at(5.5), note: `${user.name} nhận đơn` },
        ],
        team,
        appointment: tomorrow9.toISOString(),
      },
    });
    actions.push(...sellerLots(user, "vua", id, at), ...offerOn(state, "nc-mau-2", user, "vua", { kg: 400, pricePerKg: 6300, note: "Chai trong đã ép dẹt, đóng bao 20kg." }, "nhan", id, at));
  }

  if (user.role === "collaborator") {
    // Hai phần quà người dân đã đổi, chờ tới điểm nhận
    const gifts: Redemption[] = [
      { id: id("qua-1"), rewardId: REWARDS[1].id, rewardName: REWARDS[1].name, pointsSpent: REWARDS[1].pointsCost, code: "GC-7KQ2-MD4P", at: at(20), expiresAt: at(20 - REDEEM_VALID_DAYS * 24), status: "ready", userId: "lan@vidu.vn" },
      { id: id("qua-2"), rewardId: REWARDS[2].id, rewardName: REWARDS[2].name, pointsSpent: REWARDS[2].pointsCost, code: "GC-H3TX-9RAB", at: at(4), expiresAt: at(4 - REDEEM_VALID_DAYS * 24), status: "ready", userId: "khoa@vidu.vn" },
    ];
    for (const r of gifts) actions.push({ type: "REWARDS_ADD", redemption: r });
    actions.push(...sellerLots(user, "diem-thu-gom", id, at), ...offerOn(state, "nc-mau-1", user, "diem-thu-gom", { kg: 250, pricePerKg: 900, note: "Rau củ, trái cây hết hạn gom ở góc chợ, chưa lẫn nilon." }, "cho", id, at));
  }

  if (user.role === "business") {
    const offers: DemandOffer[] = [
      { id: id("chao-1"), fromId: "demo:Vựa Minh Đức", fromName: "Vựa Minh Đức", fromKind: "vua", kg: 300, pricePerKg: 850, note: "Gom từ 3 sạp rau, giao sáng thứ Hai.", at: at(3), status: "cho" },
      { id: id("chao-2"), fromId: "demo:Điểm thu gom chợ Gò Vấp", fromName: "Điểm thu gom chợ Gò Vấp", fromKind: "diem-thu-gom", kg: 250, pricePerKg: 900, note: "Trái cây hết hạn ở góc chợ, đã tách nilon.", at: at(9), status: "nhan" },
    ];
    const demand: PurchaseDemand = {
      id: id("nhu-cau"),
      businessId: user.email,
      businessName: user.name,
      material: "Rác hữu cơ",
      kg: 800,
      pricePerKg: 900,
      area: "Gò Vấp",
      note: "Cần rau củ, trái cây hết hạn để ủ phân. Không lẫn túi nilon, thịt cá. Nhận thứ Hai và thứ Năm.",
      createdAt: at(26),
      status: "dang-mua",
      offers,
    };
    actions.push({ type: "DEMANDS_UPSERT", demand });
    const hold = state.lots.lots.find((l) => l.id === "lo-gc07" && l.status === "san-sang");
    if (hold)
      actions.push({
        type: "LOTS_UPSERT",
        lot: { ...hold, status: "dang-giu", reservation: { businessId: user.email, businessName: user.name, at: at(8), expiresAt: at(8 - 48), pickupAt: at(-20), note: "Xe tải 2 tấn tới lấy." } },
      });
  }

  actions.push({ type: "DEMO_SEEDED", email: user.email });
  return actions;
}

/** Lô bán cho doanh nghiệp: vựa có giấy carton (1 lô đang có doanh nghiệp giữ), điểm thu gom có rác hữu cơ */
function sellerLots(user: DemoUser, kind: MaterialLot["sellerKind"], id: (p: string) => string, at: (h: number) => string): Action[] {
  const base = { inspector: user.name, sellerId: user.email, sellerName: user.name, sellerKind: kind } as const;
  if (kind === "diem-thu-gom")
    return [
      {
        type: "LOTS_UPSERT",
        lot: { ...base, id: id("lo-huu-co"), code: "LO-HC21", material: "Rác hữu cơ", weightKg: 250, pricePerKg: 850, grade: "A", purity: 93, moisture: 68, inspectedAt: at(5), warehouse: "Điểm thu gom chợ Gò Vấp", area: "Gò Vấp", image: LOT_IMAGE["Rác hữu cơ"] ?? "", note: "Rau củ, trái cây hết hạn gom trong 2 ngày.", status: "san-sang" },
      },
    ];
  return [
    {
      type: "LOTS_UPSERT",
      lot: { ...base, id: id("lo-giay"), code: "LO-GC21", material: "Giấy & bìa carton", weightKg: 600, pricePerKg: 3700, grade: "A", purity: 95, moisture: 7, inspectedAt: at(10), warehouse: `Kho ${user.name}`, area: "Gò Vấp", image: LOT_IMAGE["Giấy & bìa carton"], note: "Bìa carton đã ép kiện 40kg, khô.", status: "san-sang" },
    },
    {
      type: "LOTS_UPSERT",
      lot: {
        ...base, id: id("lo-lon"), code: "LO-AL21", material: "Lon nhôm", weightKg: 180, pricePerKg: 26500, grade: "A", purity: 96, moisture: 1, inspectedAt: at(30), warehouse: `Kho ${user.name}`, area: "Gò Vấp", image: LOT_IMAGE["Lon nhôm"], note: "Lon đã ép khối, không lẫn lon sắt.", status: "dang-giu",
        reservation: { businessId: "demo:nam-viet", businessName: "Công ty Tái chế Nam Việt", at: at(6), expiresAt: at(6 - 48), pickupAt: at(-18), note: "Xe tới lấy chiều mai." },
      },
    },
  ];
}

/** Lời chào hàng của vựa / điểm thu gom vào một nhu cầu mẫu của doanh nghiệp */
function offerOn(state: AppState, demandId: string, user: DemoUser, kind: DemandOffer["fromKind"], o: { kg: number; pricePerKg: number; note: string }, status: DemandOffer["status"], id: (p: string) => string, at: (h: number) => string): Action[] {
  const d = state.demands.list.find((x) => x.id === demandId);
  if (!d || d.offers.some((x) => x.fromId === user.email)) return [];
  const offer: DemandOffer = { id: id(`chao-${demandId}`), fromId: user.email, fromName: user.name, fromKind: kind, ...o, at: at(12), status };
  return [{ type: "DEMANDS_UPSERT", demand: { ...d, offers: [...d.offers, offer] } }];
}
