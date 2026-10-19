import type { CollectionRequest, DemoUser, Product, UserRole } from "@/types";
import type { AppState } from "./app-store";
import { pointsHydrate, pointsPersist, type PointsState } from "./slices/points";
import { rewardsHydrate, rewardsPersist, type RewardsState } from "./slices/rewards";
import { swapHydrate, swapPersist, type SwapState } from "./slices/swap";
import { collectHydrate, collectPersist, type CollectState } from "./slices/collect";
import { partnersHydrate, partnersPersist, type PartnersState } from "./slices/partners";

const KEY_V1 = "greencity-demo-v1";
const KEY_V2 = "greencity-demo-v2";

/** Dữ liệu đã đọc và kiểm tra xong, sẵn sàng đưa vào store. */
export interface PersistShape {
  user: DemoUser | null;
  favorites: string[];
  myListings: Product[];
  points: PointsState;
  rewards: RewardsState;
  swap: SwapState;
  collect: CollectState;
  partners: PartnersState;
}

const ROLES: UserRole[] = ["resident", "collaborator", "business", "operator"];

function readUser(raw: unknown): DemoUser | null {
  if (!raw || typeof raw !== "object") return null;
  const u = raw as Record<string, unknown>;
  if (typeof u.name !== "string" || typeof u.email !== "string") return null;
  return {
    name: u.name,
    email: u.email,
    memberSince: typeof u.memberSince === "string" ? u.memberSince : "",
    // Bản v1 chưa có vai trò → mặc định là người dân
    role: ROLES.includes(u.role as UserRole) ? (u.role as UserRole) : "resident",
  };
}

const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

function parse(raw: Record<string, unknown>): PersistShape {
  const user = readUser(raw.user);
  return {
    user,
    favorites: arr<string>(raw.favorites).filter((f) => typeof f === "string"),
    myListings: arr<Product>(raw.myListings),
    points: pointsHydrate(raw.points),
    rewards: rewardsHydrate(raw.rewards),
    swap: swapHydrate(raw.swap),
    // Bản cũ lưu yêu cầu thu gom ở myRequests (kiểu v1) → chuyển sang đơn bản mới
    collect: collectHydrate(raw.collect, arr<CollectionRequest>(raw.myRequests), user),
    partners: partnersHydrate(raw.partners),
  };
}

/** Đọc bản v2; chưa có thì chuyển từ v1 (giữ người dùng, đồ đã lưu, tin và yêu cầu của họ). */
export function loadPersisted(): PersistShape | null {
  try {
    const v2 = window.localStorage.getItem(KEY_V2);
    if (v2) return parse(JSON.parse(v2) as Record<string, unknown>);
    const v1 = window.localStorage.getItem(KEY_V1);
    if (v1) return parse(JSON.parse(v1) as Record<string, unknown>);
  } catch {
    /* dữ liệu hỏng — bắt đầu phiên mới */
  }
  return null;
}

export function savePersisted(state: AppState): "ok" | "quota" | "error" {
  const payload = {
    v: 2,
    user: state.remember ? state.user : null,
    favorites: state.favorites,
    myListings: state.products.filter((p) => p.isMine),
    points: pointsPersist(state.points),
    rewards: rewardsPersist(state.rewards),
    swap: swapPersist(state.swap),
    collect: collectPersist(state.collect),
    partners: partnersPersist(state.partners),
  };
  try {
    window.localStorage.setItem(KEY_V2, JSON.stringify(payload));
    return "ok";
  } catch (err) {
    return err instanceof DOMException && err.name === "QuotaExceededError" ? "quota" : "error";
  }
}
