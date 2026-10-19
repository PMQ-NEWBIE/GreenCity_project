import type { CollectionRequest, DemoUser } from "@/types";
import type { PickupRequest, PickupStatus } from "@/types/features";
import { AREAS, type Area } from "@/types";
import { pickupSeed } from "@/data/pickup";

/** Đơn thu gom tận nhà của mọi người (đơn của mình + đơn mẫu cho nhóm vận hành). */
export interface CollectState {
  requests: PickupRequest[];
}

export type CollectAction =
  | { type: "COLLECT_ADD"; request: PickupRequest }
  | { type: "COLLECT_UPDATE"; request: PickupRequest };

/** Rỗng cho tới khi HYDRATE chạy ở trình duyệt — đơn mẫu có mốc thời gian tính theo lúc mở trang. */
export const collectInitial: CollectState = { requests: [] };

export function collectReducer(state: CollectState, action: CollectAction): CollectState {
  switch (action.type) {
    case "COLLECT_ADD":
      return { requests: [action.request, ...state.requests] };
    case "COLLECT_UPDATE":
      return { requests: state.requests.map((r) => (r.id === action.request.id ? action.request : r)) };
    default:
      return state;
  }
}

const V1_STATUS: Record<CollectionRequest["status"], PickupStatus> = {
  pending: "cho-nhan",
  matched: "da-nhan",
  done: "hoan-tat",
};

/** Yêu cầu bản v1 (trạng thái pending/matched/done) → đơn bản mới. */
function fromV1(r: CollectionRequest, user: DemoUser | null): PickupRequest {
  const createdAt = new Date(Date.now() - (r.hoursAgo ?? 0) * 3_600_000).toISOString();
  const status = V1_STATUS[r.status] ?? "cho-nhan";
  return {
    id: r.id,
    ownerId: user?.email,
    ownerName: user?.name ?? "Bạn",
    materials: r.materials ?? [],
    quantity: r.quantity ?? "",
    area: (AREAS as readonly string[]).includes(r.area) ? (r.area as Area) : AREAS[0],
    address: "",
    time: r.time ?? "",
    note: r.note ?? "",
    photos: [],
    presorted: false,
    createdAt,
    status,
    history: status === "cho-nhan" ? [{ status, at: createdAt }] : [{ status: "cho-nhan", at: createdAt }, { status, at: createdAt }],
  };
}

function isPickup(v: unknown): v is PickupRequest {
  if (!v || typeof v !== "object") return false;
  const r = v as Record<string, unknown>;
  return typeof r.id === "string" && typeof r.status === "string" && Array.isArray(r.history) && Array.isArray(r.materials);
}

/** raw: dữ liệu bản mới (nếu đã có); legacy: myRequests của bản v1 để chuyển sang. */
export function collectHydrate(raw: unknown, legacy: CollectionRequest[], user: DemoUser | null): CollectState {
  const list = (raw as { requests?: unknown } | null)?.requests;
  if (Array.isArray(list)) return { requests: list.filter(isPickup) };
  return { requests: [...legacy.map((r) => fromV1(r, user)), ...pickupSeed()] };
}

export function collectPersist(state: CollectState): unknown {
  return { requests: state.requests };
}
