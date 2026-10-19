import type { Partner } from "@/types/features";
import { PARTNERS_SEED } from "@/data/partners";

/** Đối tác thu gom và cơ sở chế biến phân bón — nhóm vận hành thêm, sửa, ngưng. */
export interface PartnersState {
  partners: Partner[];
}

export type PartnersAction = { type: "PARTNERS_UPSERT"; partner: Partner };

export const partnersInitial: PartnersState = { partners: PARTNERS_SEED };

export function partnersReducer(state: PartnersState, action: PartnersAction): PartnersState {
  switch (action.type) {
    case "PARTNERS_UPSERT": {
      const exists = state.partners.some((p) => p.id === action.partner.id);
      return {
        partners: exists
          ? state.partners.map((p) => (p.id === action.partner.id ? action.partner : p))
          : [action.partner, ...state.partners],
      };
    }
    default:
      return state;
  }
}

function isPartner(v: unknown): v is Partner {
  if (!v || typeof v !== "object") return false;
  const p = v as Record<string, unknown>;
  return typeof p.id === "string" && typeof p.name === "string" && Array.isArray(p.areas);
}

export function partnersHydrate(raw: unknown): PartnersState {
  const list = (raw as { partners?: unknown } | null)?.partners;
  return { partners: Array.isArray(list) ? list.filter(isPartner) : PARTNERS_SEED };
}

export function partnersPersist(state: PartnersState): unknown {
  return { partners: state.partners };
}
