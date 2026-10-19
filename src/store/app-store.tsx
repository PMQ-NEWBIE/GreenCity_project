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
import { PRODUCTS, REQUESTS } from "@/data/mock-data";
import type { CollectionRequest, DemoUser, Product, ToastItem } from "@/types";

const STORAGE_KEY = "greencity-demo-v1";

interface PersistShape {
  user: DemoUser | null;
  favorites: string[];
  myListings: Product[];
  myRequests: CollectionRequest[];
}

interface AppState {
  /** true sau khi đã đọc localStorage — trước đó chưa biết người dùng đã đăng nhập hay chưa. */
  ready: boolean;
  user: DemoUser | null;
  /** false → phiên đăng nhập không được lưu lại khi tải lại trang. */
  remember: boolean;
  /** true ngay sau khi người dùng tự bấm đăng xuất → về trang chủ thay vì trang đăng nhập. */
  signedOut: boolean;
  products: Product[];
  favorites: string[];
  requests: CollectionRequest[];
  toasts: ToastItem[];
}

type Action =
  | { type: "LOGIN"; user: DemoUser; remember: boolean }
  | { type: "LOGOUT" }
  | { type: "HYDRATE"; data: PersistShape | null }
  | { type: "TOGGLE_FAVORITE"; id: string }
  | { type: "ADD_PRODUCT"; product: Product }
  | { type: "REMOVE_PRODUCT"; id: string }
  | { type: "ADD_REQUEST"; request: CollectionRequest }
  | { type: "UPDATE_USER"; name: string; email: string }
  | { type: "PUSH_TOAST"; toast: ToastItem }
  | { type: "DISMISS_TOAST"; id: string };

const initialState: AppState = {
  ready: false,
  user: null,
  remember: true,
  signedOut: false,
  products: PRODUCTS,
  favorites: [],
  requests: REQUESTS,
  toasts: [],
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "LOGIN":
      return { ...state, user: action.user, remember: action.remember, signedOut: false };
    case "LOGOUT":
      return { ...state, user: null, signedOut: true };
    case "HYDRATE": {
      if (!action.data) return { ...state, ready: true };
      const { user, favorites, myListings, myRequests } = action.data;
      return {
        ...state,
        ready: true,
        user,
        favorites: favorites ?? [],
        products: [...(myListings ?? []), ...PRODUCTS],
        requests: [...(myRequests ?? []), ...REQUESTS],
      };
    }
    case "TOGGLE_FAVORITE": {
      const has = state.favorites.includes(action.id);
      return {
        ...state,
        favorites: has
          ? state.favorites.filter((f) => f !== action.id)
          : [...state.favorites, action.id],
      };
    }
    case "ADD_PRODUCT":
      return { ...state, products: [action.product, ...state.products] };
    case "REMOVE_PRODUCT":
      return { ...state, products: state.products.filter((p) => p.id !== action.id) };
    case "ADD_REQUEST":
      return { ...state, requests: [action.request, ...state.requests] };
    case "UPDATE_USER":
      return state.user
        ? { ...state, user: { ...state.user, name: action.name, email: action.email } }
        : state;
    case "PUSH_TOAST":
      return { ...state, toasts: [...state.toasts.slice(-2), action.toast] };
    case "DISMISS_TOAST":
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  login: (user: DemoUser, remember?: boolean) => void;
  logout: () => void;
  toggleFavorite: (id: string) => void;
  addProduct: (product: Product) => void;
  removeProduct: (id: string) => void;
  addRequest: (request: CollectionRequest) => void;
  updateUser: (name: string, email: string) => void;
  toast: (kind: ToastItem["kind"], title: string, description?: string) => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const hydratedRef = useRef(false);

  // Đọc phiên demo đã lưu
  useEffect(() => {
    let data: PersistShape | null = null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) data = JSON.parse(raw) as PersistShape;
    } catch {
      /* dữ liệu hỏng — bắt đầu phiên mới */
    }
    dispatch({ type: "HYDRATE", data });
    hydratedRef.current = true;
  }, []);

  // Lưu phiên demo
  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      const payload: PersistShape = {
        user: state.remember ? state.user : null,
        favorites: state.favorites,
        myListings: state.products.filter((p) => p.isMine),
        myRequests: state.requests.filter((r) => r.isMine),
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* bộ nhớ đầy — demo vẫn chạy trong phiên hiện tại */
    }
  }, [state.user, state.remember, state.favorites, state.products, state.requests]);

  const login = useCallback(
    (user: DemoUser, remember = true) => dispatch({ type: "LOGIN", user, remember }),
    []
  );
  const logout = useCallback(() => dispatch({ type: "LOGOUT" }), []);
  const toggleFavorite = useCallback((id: string) => dispatch({ type: "TOGGLE_FAVORITE", id }), []);
  const addProduct = useCallback((product: Product) => dispatch({ type: "ADD_PRODUCT", product }), []);
  const removeProduct = useCallback((id: string) => dispatch({ type: "REMOVE_PRODUCT", id }), []);
  const addRequest = useCallback(
    (request: CollectionRequest) => dispatch({ type: "ADD_REQUEST", request }),
    []
  );
  const updateUser = useCallback(
    (name: string, email: string) => dispatch({ type: "UPDATE_USER", name, email }),
    []
  );
  const dismissToast = useCallback((id: string) => dispatch({ type: "DISMISS_TOAST", id }), []);

  const toast = useCallback((kind: ToastItem["kind"], title: string, description?: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    dispatch({ type: "PUSH_TOAST", toast: { id, kind, title, description } });
    window.setTimeout(() => dispatch({ type: "DISMISS_TOAST", id }), 4000);
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      login,
      logout,
      toggleFavorite,
      addProduct,
      removeProduct,
      addRequest,
      updateUser,
      toast,
      dismissToast,
    }),
    [state, login, logout, toggleFavorite, addProduct, removeProduct, addRequest, updateUser, toast, dismissToast]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
