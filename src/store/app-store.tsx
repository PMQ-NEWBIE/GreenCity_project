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
import type {
  AppPage,
  CollectionRequest,
  DemoUser,
  Product,
  Route,
  ToastItem,
} from "@/types";

const STORAGE_KEY = "greencity-demo-v1";

interface PersistShape {
  user: DemoUser | null;
  favorites: string[];
  myListings: Product[];
  myRequests: CollectionRequest[];
}

interface AppState {
  route: Route;
  pendingRoute: Route | null;
  discoverPreset: string;
  user: DemoUser | null;
  products: Product[];
  favorites: string[];
  requests: CollectionRequest[];
  toasts: ToastItem[];
}

type Action =
  | { type: "NAVIGATE"; route: Route }
  | { type: "SET_PENDING"; route: Route | null }
  | { type: "SET_DISCOVER_PRESET"; preset: string }
  | { type: "LOGIN"; user: DemoUser }
  | { type: "LOGOUT" }
  | { type: "HYDRATE"; data: PersistShape }
  | { type: "TOGGLE_FAVORITE"; id: string }
  | { type: "ADD_PRODUCT"; product: Product }
  | { type: "REMOVE_PRODUCT"; id: string }
  | { type: "ADD_REQUEST"; request: CollectionRequest }
  | { type: "UPDATE_USER"; name: string; email: string }
  | { type: "PUSH_TOAST"; toast: ToastItem }
  | { type: "DISMISS_TOAST"; id: string };

const initialState: AppState = {
  route: { screen: "landing" },
  pendingRoute: null,
  discoverPreset: "all",
  user: null,
  products: PRODUCTS,
  favorites: [],
  requests: REQUESTS,
  toasts: [],
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "NAVIGATE":
      return { ...state, route: action.route };
    case "SET_PENDING":
      return { ...state, pendingRoute: action.route };
    case "SET_DISCOVER_PRESET":
      return { ...state, discoverPreset: action.preset };
    case "LOGIN":
      return {
        ...state,
        user: action.user,
        route: state.pendingRoute ?? { screen: "app", page: "dashboard" },
        pendingRoute: null,
      };
    case "LOGOUT":
      return { ...state, user: null, route: { screen: "landing" }, pendingRoute: null };
    case "HYDRATE": {
      const { user, favorites, myListings, myRequests } = action.data;
      const mine = [...(myListings ?? []), ...PRODUCTS];
      const reqs = [...(myRequests ?? []), ...REQUESTS];
      return {
        ...state,
        user,
        favorites: favorites ?? [],
        products: mine,
        requests: reqs,
        route: user ? { screen: "app", page: "dashboard" } : state.route,
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
      return { ...state, toasts: [...state.toasts.slice(-3), action.toast] };
    case "DISMISS_TOAST":
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  navigate: (route: Route) => void;
  goLanding: () => void;
  goAuth: (mode?: "login" | "register" | "forgot") => void;
  goApp: (page: AppPage, productId?: string) => void;
  setPending: (route: Route | null) => void;
  setDiscoverPreset: (preset: string) => void;
  login: (user: DemoUser) => void;
  logout: () => void;
  toggleFavorite: (id: string) => void;
  addProduct: (product: Product) => void;
  removeProduct: (id: string) => void;
  addRequest: (request: CollectionRequest) => void;
  updateUser: (name: string, email: string) => void;
  toast: (
    kind: ToastItem["kind"],
    title: string,
    description?: string
  ) => void;
  dismissToast: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const hydratedRef = useRef(false);

  // Hydrate persisted demo session on mount
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw) as PersistShape;
        dispatch({ type: "HYDRATE", data });
      }
    } catch {
      /* ignore corrupted storage */
    }
    hydratedRef.current = true;
  }, []);

  // Persist demo session
  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      const payload: PersistShape = {
        user: state.user,
        favorites: state.favorites,
        myListings: state.products.filter((p) => p.isMine),
        myRequests: state.requests.filter((r) => r.isMine),
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* storage full — demo still works in-memory */
    }
  }, [state.user, state.favorites, state.products, state.requests]);

  const navigate = useCallback((route: Route) => {
    dispatch({ type: "NAVIGATE", route });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, []);

  const goLanding = useCallback(() => {
    dispatch({ type: "NAVIGATE", route: { screen: "landing" } });
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  const goAuth = useCallback((mode: "login" | "register" | "forgot" = "login") => {
    dispatch({ type: "NAVIGATE", route: { screen: "auth", mode } });
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  const goApp = useCallback((page: AppPage, productId?: string) => {
    dispatch({ type: "NAVIGATE", route: { screen: "app", page, productId } });
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  const setPending = useCallback((route: Route | null) => {
    dispatch({ type: "SET_PENDING", route });
  }, []);

  const setDiscoverPreset = useCallback((preset: string) => {
    dispatch({ type: "SET_DISCOVER_PRESET", preset });
  }, []);

  const login = useCallback((user: DemoUser) => dispatch({ type: "LOGIN", user }), []);
  const logout = useCallback(() => dispatch({ type: "LOGOUT" }), []);

  const toggleFavorite = useCallback((id: string) => {
    dispatch({ type: "TOGGLE_FAVORITE", id });
  }, []);

  const addProduct = useCallback((product: Product) => {
    dispatch({ type: "ADD_PRODUCT", product });
  }, []);

  const removeProduct = useCallback((id: string) => {
    dispatch({ type: "REMOVE_PRODUCT", id });
  }, []);

  const addRequest = useCallback((request: CollectionRequest) => {
    dispatch({ type: "ADD_REQUEST", request });
  }, []);

  const updateUser = useCallback((name: string, email: string) => {
    dispatch({ type: "UPDATE_USER", name, email });
  }, []);

  const dismissToast = useCallback((id: string) => {
    dispatch({ type: "DISMISS_TOAST", id });
  }, []);

  const toast = useCallback(
    (kind: ToastItem["kind"], title: string, description?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      dispatch({ type: "PUSH_TOAST", toast: { id, kind, title, description } });
      window.setTimeout(() => {
        dispatch({ type: "DISMISS_TOAST", id });
      }, 4200);
    },
    []
  );

  const isFavorite = useCallback(
    (id: string) => state.favorites.includes(id),
    [state.favorites]
  );

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      navigate,
      goLanding,
      goAuth,
      goApp,
      setPending,
      setDiscoverPreset,
      login,
      logout,
      toggleFavorite,
      addProduct,
      removeProduct,
      addRequest,
      updateUser,
      toast,
      dismissToast,
      isFavorite,
    }),
    [
      state,
      navigate,
      goLanding,
      goAuth,
      goApp,
      setPending,
      setDiscoverPreset,
      login,
      logout,
      toggleFavorite,
      addProduct,
      removeProduct,
      addRequest,
      updateUser,
      toast,
      dismissToast,
      isFavorite,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
