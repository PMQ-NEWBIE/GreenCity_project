import type { Bin, BinType, GreenShop, LitterReport } from "@/types/features";
import type { MapPlace } from "@/data/map-places";
import { BIN_LEVEL_LABEL, BIN_TYPE_LABEL } from "@/data/bins";
import { GREEN_SHOP_KIND_LABEL } from "@/data/labels";
import { LITTER_STATUS_LABEL } from "@/data/litter";
import { ROUTES } from "@/lib/routes";

export type MapLayer = "thung" | "vua" | "vuon" | "gian-hang" | "diem-rac";

export const LAYER_LABEL: Record<MapLayer, string> = {
  thung: "Thùng thu gom",
  vua: "Điểm tái chế, vựa",
  vuon: "Vườn cộng đồng",
  "gian-hang": "Gian hàng xanh",
  "diem-rac": "Điểm rác đã báo",
};

/** Màu điểm lấy từ biến CSS của theme (đọc lúc chạy, đúng cả nền sáng lẫn tối). */
export type ColorToken = "primary" | "muted-foreground" | "earth" | "warn" | "leaf" | "forest" | "destructive";

export const LAYER_COLOR: Record<Exclude<MapLayer, "thung">, ColorToken> = {
  vua: "warn",
  vuon: "leaf",
  "gian-hang": "forest",
  "diem-rac": "destructive",
};

export const BIN_COLOR: Record<BinType, ColorToken> = {
  "tai-che": "primary",
  "quan-ao": "muted-foreground",
  "huu-co": "earth",
};

export interface MapPoint {
  /** "<lớp>:<id gốc>" — không trùng giữa các lớp */
  id: string;
  layer: MapLayer;
  color: ColorToken;
  /** Nhãn nhỏ phía trên tên, ví dụ "Thùng tái chế · TC-003" */
  kind: string;
  name: string;
  area: string;
  address: string;
  lat: number;
  lng: number;
  note?: string;
  href?: string;
  linkLabel?: string;
}

export function binPoint(b: Bin): MapPoint {
  return {
    id: `thung:${b.id}`,
    layer: "thung",
    color: BIN_COLOR[b.type],
    kind: `Thùng ${BIN_TYPE_LABEL[b.type].toLowerCase()} · ${b.code}`,
    name: b.name,
    area: b.area,
    address: b.address,
    lat: b.lat,
    lng: b.lng,
    note: BIN_LEVEL_LABEL[b.level],
    href: `${ROUTES.bins}?thung=${b.id}`,
    linkLabel: "Bỏ đồ, báo đầy",
  };
}

export function placePoint(p: MapPlace, layer: "vua" | "vuon"): MapPoint {
  return { id: `${layer}:${p.id}`, layer, color: LAYER_COLOR[layer], kind: LAYER_LABEL[layer], name: p.name, area: p.area, address: p.address, lat: p.lat, lng: p.lng, note: p.note };
}

export function shopPoint(s: GreenShop): MapPoint {
  return {
    id: `gian-hang:${s.slug}`,
    layer: "gian-hang",
    color: LAYER_COLOR["gian-hang"],
    kind: GREEN_SHOP_KIND_LABEL[s.kind],
    name: s.name,
    area: s.area,
    address: s.address,
    lat: s.lat,
    lng: s.lng,
    note: s.openHours,
    href: ROUTES.shop(s.slug),
    linkLabel: "Xem gian hàng",
  };
}

export function litterPoint(r: LitterReport): MapPoint | null {
  if (r.lat == null || r.lng == null) return null;
  return {
    id: `diem-rac:${r.id}`,
    layer: "diem-rac",
    color: LAYER_COLOR["diem-rac"],
    kind: `Điểm rác · ${LITTER_STATUS_LABEL[r.status]}`,
    name: r.address || `Điểm rác ở ${r.area}`,
    area: r.area,
    address: r.address,
    lat: r.lat,
    lng: r.lng,
    note: r.description || undefined,
  };
}
