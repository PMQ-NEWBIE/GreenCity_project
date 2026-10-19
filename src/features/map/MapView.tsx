"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { Crosshair, List, Loader2, Map as MapIcon, MapPin } from "lucide-react";
import { useBins } from "@/store/use-bins";
import { useLitter } from "@/store/use-litter";
import { PageContainer, PageIntro, buttonClass } from "@/components/greencity/ui";
import { GREEN_SHOPS } from "@/data/green-shops";
import { GARDENS, RECYCLE_POINTS } from "@/data/map-places";
import { distanceMeters, inHcmc } from "@/data/geo";
import { cn } from "@/lib/utils";
import type { LeafletMapProps } from "./LeafletMap";
import { BIN_COLOR, LAYER_COLOR, LAYER_LABEL, binPoint, litterPoint, placePoint, shopPoint, type ColorToken, type MapLayer, type MapPoint } from "./points";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center bg-muted text-[14px] text-muted-foreground">Đang tải bản đồ…</div>,
});

const LAYERS: MapLayer[] = ["thung", "vua", "vuon", "gian-hang", "diem-rac"];
const TOKENS: (ColorToken | "card" | "ring")[] = ["primary", "muted-foreground", "earth", "warn", "leaf", "forest", "destructive", "card", "ring"];

/** Đọc màu thật của các token từ biến CSS (đổi theo nền sáng/tối). */
function readColors(): LeafletMapProps["colors"] {
  const css = getComputedStyle(document.documentElement);
  return Object.fromEntries(TOKENS.map((t) => [t, css.getPropertyValue(`--${t}`).trim() || "#15803d"])) as LeafletMapProps["colors"];
}

/** ?thung=, ?gian-hang=, ?diem-rac= → id điểm cần mở sẵn. */
function focusFromUrl(sp: URLSearchParams): string | null {
  for (const key of ["thung", "gian-hang", "diem-rac", "vua", "vuon"] as const) {
    const v = sp.get(key);
    if (v) return `${key}:${v}`;
  }
  return null;
}

export function MapView() {
  const { bins } = useBins();
  const { reports } = useLitter();
  const searchParams = useSearchParams();
  const { resolvedTheme } = useTheme();
  const [layers, setLayers] = useState<Set<MapLayer>>(() => new Set(LAYERS));
  const [selectedId, setSelectedId] = useState<string | null>(() => focusFromUrl(searchParams));
  const [mobileView, setMobileView] = useState<"map" | "list">("map");
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [geo, setGeo] = useState<"idle" | "loading" | "error">("idle");
  const [colors, setColors] = useState<LeafletMapProps["colors"] | null>(null);

  // Màu điểm phải đọc lại sau khi next-themes đổi class trên <html>
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setColors(readColors()));
    return () => window.cancelAnimationFrame(id);
  }, [resolvedTheme]);

  const all = useMemo<MapPoint[]>(
    () => [
      ...bins.map(binPoint),
      ...RECYCLE_POINTS.map((p) => placePoint(p, "vua")),
      ...GARDENS.map((p) => placePoint(p, "vuon")),
      ...GREEN_SHOPS.map(shopPoint),
      ...reports.filter((r) => r.status === "cho-xac-minh" || r.status === "da-xac-minh").flatMap((r) => litterPoint(r) ?? []),
    ],
    [bins, reports]
  );

  const visible = useMemo(() => {
    const list = all.filter((p) => layers.has(p.layer) || p.id === selectedId);
    if (!userPos) return list;
    return [...list].sort((a, b) => distanceMeters(userPos, a) - distanceMeters(userPos, b));
  }, [all, layers, selectedId, userPos]);

  const toggle = (l: MapLayer) =>
    setLayers((s) => {
      const n = new Set(s);
      if (n.has(l)) n.delete(l);
      else n.add(l);
      return n;
    });

  const locate = () => {
    if (!("geolocation" in navigator)) return setGeo("error");
    setGeo("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (!inHcmc(p)) return setGeo("error");
        setUserPos(p);
        setGeo("idle");
      },
      () => setGeo("error"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const select = (id: string) => {
    setSelectedId(id);
    setMobileView("map");
  };

  const countOf = (l: MapLayer) => all.filter((p) => p.layer === l).length;
  const dot = (c: ColorToken) => ({ backgroundColor: `var(--${c})` });

  return (
    <PageContainer className="max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageIntro title="Bản đồ xanh">
          Thùng thu gom, điểm tái chế, vườn cộng đồng và gian hàng xanh quanh bạn. Bấm một điểm để xem chi tiết.
        </PageIntro>
        <button type="button" onClick={locate} disabled={geo === "loading"} className={buttonClass.secondary}>
          {geo === "loading" ? <Loader2 className="h-[18px] w-[18px] animate-spin" aria-hidden="true" /> : <Crosshair className="h-[18px] w-[18px]" aria-hidden="true" />}
          {userPos ? "Đã sắp theo gần bạn" : "Gần tôi"}
        </button>
      </div>
      {geo === "error" && (
        <p className="mt-2 text-[13px] text-muted-foreground" role="status">
          Không lấy được vị trí của bạn (chưa cho phép hoặc đang ở ngoài TP.HCM). Danh sách vẫn xem được bình thường.
        </p>
      )}

      {/* Lớp dữ liệu */}
      <div className="hide-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Lớp hiển thị trên bản đồ">
        {LAYERS.map((l) => {
          const on = layers.has(l);
          return (
            <button
              key={l}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(l)}
              className={cn(
                "flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-[14px] font-semibold transition-colors",
                on ? "border-primary/50 bg-accent text-foreground" : "border-border bg-card text-muted-foreground"
              )}
            >
              {l === "thung" ? (
                <span className="flex -space-x-1" aria-hidden="true">
                  {(Object.values(BIN_COLOR) as ColorToken[]).map((c) => (
                    <span key={c} className="h-3 w-3 rounded-full border border-card" style={dot(c)} />
                  ))}
                </span>
              ) : (
                <span className="h-3 w-3 rounded-full" style={dot(LAYER_COLOR[l])} aria-hidden="true" />
              )}
              {LAYER_LABEL[l]}
              <span className="text-muted-foreground">{countOf(l)}</span>
            </button>
          );
        })}
      </div>

      {/* Điện thoại: chuyển qua lại bản đồ / danh sách */}
      <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1 lg:hidden" role="group" aria-label="Cách xem">
        {(["map", "list"] as const).map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={mobileView === v}
            onClick={() => setMobileView(v)}
            className={cn("flex min-h-11 items-center justify-center gap-2 rounded-lg text-[14px] font-semibold", mobileView === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}
          >
            {v === "map" ? <MapIcon className="h-4 w-4" aria-hidden="true" /> : <List className="h-4 w-4" aria-hidden="true" />}
            {v === "map" ? "Bản đồ" : `Danh sách (${visible.length})`}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <ul
          className={cn("flex flex-col gap-2 lg:h-[calc(100dvh-260px)] lg:min-h-[520px] lg:overflow-y-auto lg:pr-1", mobileView === "list" ? "flex" : "hidden lg:flex")}
          aria-label="Danh sách điểm"
        >
          {visible.map((p) => (
            <li key={p.id}>
              <div className={cn("rounded-2xl border bg-card p-3 transition-colors", p.id === selectedId ? "border-primary" : "border-border")}>
                <button type="button" onClick={() => select(p.id)} className="flex w-full items-start gap-3 text-left" aria-pressed={p.id === selectedId}>
                  <span className="mt-1.5 h-3 w-3 shrink-0 rounded-full" style={dot(p.color)} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] font-semibold text-muted-foreground">{p.kind}</span>
                    <span className="block text-[15px] font-bold leading-snug text-foreground">{p.name}</span>
                    <span className="mt-0.5 flex items-start gap-1 text-[13px] text-muted-foreground">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      {[p.address, p.area].filter(Boolean).join(", ")}
                    </span>
                    {p.note && <span className="mt-1 block text-[13px] text-foreground/80">{p.note}</span>}
                  </span>
                  {userPos && (
                    <span className="shrink-0 text-[13px] font-semibold tabular-nums text-primary">
                      {(distanceMeters(userPos, p) / 1000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}km
                    </span>
                  )}
                </button>
                {p.href && (
                  <Link href={p.href} className="ml-6 mt-2 inline-flex min-h-9 items-center text-[13px] font-semibold text-primary hover:underline">
                    {p.linkLabel ?? "Xem chi tiết"} →
                  </Link>
                )}
              </div>
            </li>
          ))}
          {visible.length === 0 && (
            <li className="rounded-2xl border border-dashed border-border p-5 text-[14px] text-muted-foreground">Bật ít nhất một lớp ở trên để xem các điểm.</li>
          )}
        </ul>

        <section
          aria-label="Bản đồ"
          className={cn(
            "gc-map isolate h-[62dvh] min-h-[380px] overflow-hidden rounded-2xl border border-border lg:h-[calc(100dvh-260px)] lg:min-h-[520px]",
            mobileView === "map" ? "block" : "hidden lg:block"
          )}
        >
          {colors && <LeafletMap points={visible} selectedId={selectedId} onSelect={setSelectedId} userPos={userPos} colors={colors} />}
        </section>
      </div>
      <p className="mt-3 text-[12px] text-muted-foreground">Vị trí và tên địa điểm là dữ liệu minh họa.</p>
    </PageContainer>
  );
}
