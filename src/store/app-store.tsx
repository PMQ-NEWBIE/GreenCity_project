"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { PRODUCTS } from "@/data/mock-data";
import { ruleById } from "@/data/point-rules";
import type { DemoUser, Product, ToastItem, UserRole } from "@/types";
import type { PointEntry, Redemption } from "@/types/features";
import { balanceOf, checkRedeem } from "@/lib/points";
import { REWARDS } from "@/data/rewards";
import { loadPersisted, savePersisted, type PersistShape } from "./persist";
import { pointsHydrate, pointsInitial, pointsReducer, type PointsAction, type PointsState } from "./slices/points";
import { rewardsInitial, rewardsReducer, stockLeft, type RewardsAction, type RewardsState } from "./slices/rewards";
import { swapHydrate, swapInitial, swapReducer, type SwapAction, type SwapState } from "./slices/swap";
import { collectHydrate, collectInitial, collectReducer, type CollectAction, type CollectState } from "./slices/collect";
import { partnersInitial, partnersReducer, type PartnersAction, type PartnersState } from "./slices/partners";
import { binsHydrate, binsInitial, binsReducer, type BinsAction, type BinsState } from "./slices/bins";
import { litterHydrate, litterInitial, litterReducer, type LitterAction, type LitterState } from "./slices/litter";
import { lotsHydrate, lotsInitial, lotsReducer, type LotsAction, type LotsState } from "./slices/lots";

export interface AppState {
  /** true sau khi đã đọc localStorage — trước đó chưa biết người dùng đã đăng nhập hay chưa. */
  ready: boolean;
  user: DemoUser | null;
  /** false → phiên đăng nhập không được lưu lại khi tải lại trang. */
  remember: boolean;
  /** true ngay sau khi người dùng tự bấm đăng xuất → về trang chủ thay vì trang đăng nhập. */
  signedOut: boolean;
  products: Product[];
  favorites: string[];
  toasts: ToastItem[];
  points: PointsState;
  rewards: RewardsState;
  swap: SwapState;
  collect: CollectState;
  partners: PartnersState;
  bins: BinsState;
  litter: LitterState;
  lots: LotsState;
}

/** Thời điểm và id do nơi gọi tạo ra, để reducer luôn cho cùng kết quả với cùng một action. */
interface Stamp {
  now: string;
  welcomeId: string;
}

export type Action =
  | ({ type: "LOGIN"; user: DemoUser; remember: boolean } & Stamp)
  | { type: "LOGOUT" }
  | ({ type: "HYDRATE"; data: PersistShape | null } & Stamp)
  | { type: "SET_ROLE"; role: UserRole }
  | { type: "TOGGLE_FAVORITE"; id: string }
  | { type: "ADD_PRODUCT"; product: Product }
  | { type: "REMOVE_PRODUCT"; id: string }
  | { type: "UPDATE_USER"; name: string; email: string }
  | { type: "PUSH_TOAST"; toast: ToastItem }
  | { type: "DISMISS_TOAST"; id: string }
  | { type: "REWARDS_REDEEM"; redemption: Redemption; entry: PointEntry }
  | PointsAction
  | RewardsAction
  | SwapAction
  | CollectAction
  | PartnersAction
  | BinsAction
  | LitterAction
  | LotsAction;

const initialState: AppState = {
  ready: false,
  user: null,
  remember: true,
  signedOut: false,
  products: PRODUCTS,
  favorites: [],
  toasts: [],
  points: pointsInitial,
  rewards: rewardsInitial,
  swap: swapInitial,
  collect: collectInitial,
  partners: partnersInitial,
  bins: binsInitial,
  litter: litterInitial,
  lots: lotsInitial,
};

/** Người dùng chưa có điểm chào mừng thì cộng một lần (đọc số điểm từ POINT_RULES). */
function withWelcome(state: AppState, stamp: Stamp): AppState {
  const user = state.user;
  if (!user) return state;
  const has = state.points.entries.some((e) => e.reason === "welcome" && e.userId === user.email);
  if (has) return state;
  const entry: PointEntry = {
    id: stamp.welcomeId,
    at: stamp.now,
    delta: ruleById("welcome").points,
    reason: "welcome",
    title: "Điểm chào mừng thành viên mới",
    status: "confirmed",
    userId: user.email,
  };
  return { ...state, points: pointsReducer(state.points, { type: "POINTS_ADD", entry }) };
}

export function reducer(state: AppState, action: Action): AppState {
  if (action.type.startsWith("POINTS_")) return { ...state, points: pointsReducer(state.points, action as PointsAction) };
  if (action.type.startsWith("SWAP_")) return { ...state, swap: swapReducer(state.swap, action as SwapAction) };
  if (action.type.startsWith("COLLECT_"))
    return { ...state, collect: collectReducer(state.collect, action as CollectAction) };
  if (action.type.startsWith("PARTNERS_"))
    return { ...state, partners: partnersReducer(state.partners, action as PartnersAction) };
  if (action.type.startsWith("BINS_")) return { ...state, bins: binsReducer(state.bins, action as BinsAction) };
  if (action.type.startsWith("LITTER_")) return { ...state, litter: litterReducer(state.litter, action as LitterAction) };
  if (action.type.startsWith("LOTS_")) return { ...state, lots: lotsReducer(state.lots, action as LotsAction) };
  if (action.type !== "REWARDS_REDEEM" && action.type.startsWith("REWARDS_"))
    return { ...state, rewards: rewardsReducer(state.rewards, action as RewardsAction) };

  switch (action.type) {
    case "LOGIN":
      return withWelcome({ ...state, user: action.user, remember: action.remember, signedOut: false }, action);
    case "LOGOUT":
      return { ...state, user: null, signedOut: true };
    case "HYDRATE": {
      const d = action.data;
      const next: AppState = d
        ? {
            ...state,
            ready: true,
            user: d.user,
            favorites: d.favorites,
            products: [...d.myListings, ...PRODUCTS],
            points: d.points,
            rewards: d.rewards,
            swap: d.swap,
            collect: d.collect,
            partners: d.partners,
            bins: d.bins,
            litter: d.litter,
            lots: d.lots,
          }
        : {
            ...state,
            ready: true,
            swap: swapHydrate(null),
            collect: collectHydrate(null, [], null),
            bins: binsHydrate(null),
            litter: litterHydrate(null),
            lots: lotsHydrate(null),
            points: pointsHydrate(null),
          };
      return withWelcome(next, action);
    }
    case "SET_ROLE":
      return state.user ? { ...state, user: { ...state.user, role: action.role } } : state;
    case "TOGGLE_FAVORITE": {
      const has = state.favorites.includes(action.id);
      return {
        ...state,
        favorites: has ? state.favorites.filter((f) => f !== action.id) : [...state.favorites, action.id],
      };
    }
    case "ADD_PRODUCT":
      return { ...state, products: [action.product, ...state.products] };
    case "REMOVE_PRODUCT":
      return { ...state, products: state.products.filter((p) => p.id !== action.id) };
    case "UPDATE_USER":
      return state.user ? { ...state, user: { ...state.user, name: action.name, email: action.email } } : state;
    case "PUSH_TOAST":
      return { ...state, toasts: [...state.toasts.slice(-2), action.toast] };
    case "DISMISS_TOAST":
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    case "REWARDS_REDEEM": {
      // Kiểm tra lại ở đây: hai lần bấm liên tiếp không được làm âm điểm hay âm kho
      const reward = REWARDS.find((r) => r.id === action.redemption.rewardId);
      const user = state.user;
      if (!reward || !user) return state;
      const mine = state.points.entries.filter((e) => e.userId === user.email);
      const block = checkRedeem({
        loggedIn: true,
        stockLeft: stockLeft(reward, state.rewards.redemptions),
        balance: balanceOf(mine),
        cost: reward.pointsCost,
      });
      if (block) return state;
      return {
        ...state,
        rewards: { redemptions: [action.redemption, ...state.rewards.redemptions] },
        points: pointsReducer(state.points, { type: "POINTS_ADD", entry: action.entry }),
      };
    }
    default:
      return state;
  }
}

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function stamp(): Stamp {
  return { now: new Date().toISOString(), welcomeId: newId("pt") };
}

interface AppContextValue {
  state: AppState;
  /** Trạng thái mới nhất, kể cả các action vừa gửi mà React chưa kịp vẽ lại. */
  getState: () => AppState;
  dispatch: (action: Action) => void;
  login: (user: DemoUser, remember?: boolean) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
  toggleFavorite: (id: string) => void;
  addProduct: (product: Product) => void;
  removeProduct: (id: string) => void;
  updateUser: (name: string, email: string) => void;
  toast: (kind: ToastItem["kind"], title: string, description?: string) => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, rawDispatch] = useReducer(reducer, initialState);
  // Chạy cùng reducer trên ref ngay lúc gửi action → đọc được trạng thái mới đồng bộ
  // (cần cho redeem: trả kết quả ngay và chặn bấm hai lần).
  const stateRef = useRef<AppState>(initialState);
  const hydratedRef = useRef(false);
  const quotaWarnedRef = useRef(false);

  const dispatch = useCallback((action: Action) => {
    stateRef.current = reducer(stateRef.current, action);
    rawDispatch(action);
  }, []);
  const getState = useCallback(() => stateRef.current, []);

  const toast = useCallback(
    (kind: ToastItem["kind"], title: string, description?: string) => {
      const id = newId("t");
      dispatch({ type: "PUSH_TOAST", toast: { id, kind, title, description } });
      window.setTimeout(() => dispatch({ type: "DISMISS_TOAST", id }), 4000);
    },
    [dispatch]
  );

  // Đọc phiên demo đã lưu
  useEffect(() => {
    dispatch({ type: "HYDRATE", data: loadPersisted(), ...stamp() });
    hydratedRef.current = true;
  }, [dispatch]);

  // Lưu phiên demo
  useEffect(() => {
    if (!hydratedRef.current) return;
    const result = savePersisted(state);
    if (result === "quota" && !quotaWarnedRef.current) {
      quotaWarnedRef.current = true;
      toast("error", "Bộ nhớ trình duyệt đã đầy", "Thay đổi mới chỉ giữ trong lần mở này. Xóa bớt tin có ảnh để lưu tiếp.");
    }
  }, [state.user, state.remember, state.favorites, state.products, state.points, state.rewards, state.swap, state.collect, state.partners, state.bins, state.litter, state.lots, toast]);

  const login = useCallback(
    (user: DemoUser, remember = true) => dispatch({ type: "LOGIN", user, remember, ...stamp() }),
    [dispatch]
  );
  const logout = useCallback(() => dispatch({ type: "LOGOUT" }), [dispatch]);
  const setRole = useCallback((role: UserRole) => dispatch({ type: "SET_ROLE", role }), [dispatch]);
  const toggleFavorite = useCallback((id: string) => dispatch({ type: "TOGGLE_FAVORITE", id }), [dispatch]);
  const addProduct = useCallback((product: Product) => dispatch({ type: "ADD_PRODUCT", product }), [dispatch]);
  const removeProduct = useCallback((id: string) => dispatch({ type: "REMOVE_PRODUCT", id }), [dispatch]);
  const updateUser = useCallback(
    (name: string, email: string) => dispatch({ type: "UPDATE_USER", name, email }),
    [dispatch]
  );
  const dismissToast = useCallback((id: string) => dispatch({ type: "DISMISS_TOAST", id }), [dispatch]);

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      getState,
      dispatch,
      login,
      logout,
      setRole,
      toggleFavorite,
      addProduct,
      removeProduct,
      updateUser,
      toast,
      dismissToast,
    }),
    [state, getState, dispatch, login, logout, setRole, toggleFavorite, addProduct, removeProduct, updateUser, toast, dismissToast]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
