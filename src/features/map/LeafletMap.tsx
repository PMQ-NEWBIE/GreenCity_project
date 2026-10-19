"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import type { CircleMarker as LeafletCircle } from "leaflet";
import type { ColorToken, MapPoint } from "./points";

export interface LeafletMapProps {
  points: MapPoint[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  userPos: { lat: number; lng: number } | null;
  /** Màu thật (đọc từ biến CSS) cho từng token */
  colors: Record<ColorToken | "card" | "ring", string>;
}

const HCMC: [number, number] = [10.795, 106.7];

/**
 * Bản đồ Leaflet — chỉ nạp ở trình duyệt (MapView dùng next/dynamic, ssr: false).
 * Điểm vẽ bằng CircleMarker nên không cần ảnh icon mặc định của Leaflet.
 */
export default function LeafletMap({ points, selectedId, onSelect, userPos, colors }: LeafletMapProps) {
  const markers = useRef(new Map<string, LeafletCircle>());
  const selected = points.find((p) => p.id === selectedId) ?? null;

  return (
    <MapContainer center={HCMC} zoom={12} scrollWheelZoom className="h-full w-full" aria-label="Bản đồ các điểm xanh">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      {points.map((p) => {
        const active = p.id === selectedId;
        return (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lng]}
            radius={active ? 11 : 7}
            pathOptions={{ color: colors.card, weight: 2, fillColor: colors[p.color], fillOpacity: active ? 1 : 0.85 }}
            eventHandlers={{ click: () => onSelect(p.id) }}
            ref={(m) => {
              if (m) markers.current.set(p.id, m);
              else markers.current.delete(p.id);
            }}
          >
            <Popup>
              <p className="!m-0 text-[12px] font-semibold text-muted-foreground">{p.kind}</p>
              <p className="!m-0 text-[14px] font-bold text-foreground">{p.name}</p>
              <p className="!m-0 text-[12px] text-muted-foreground">
                {[p.address, p.area].filter(Boolean).join(", ")}
              </p>
              {p.note && <p className="!mb-0 !mt-1 text-[12px] text-foreground/85">{p.note}</p>}
              {p.href && (
                <Link href={p.href} className="mt-1.5 inline-block text-[13px] font-semibold">
                  {p.linkLabel ?? "Xem chi tiết"} →
                </Link>
              )}
            </Popup>
          </CircleMarker>
        );
      })}
      {userPos && (
        <CircleMarker
          center={[userPos.lat, userPos.lng]}
          radius={8}
          pathOptions={{ color: colors.card, weight: 3, fillColor: colors.ring, fillOpacity: 1 }}
        >
          <Popup>Vị trí của bạn</Popup>
        </CircleMarker>
      )}
      <FocusSelected point={selected} markers={markers} />
      <FitUser pos={userPos} />
    </MapContainer>
  );
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Bay tới điểm đang chọn và mở popup của nó. */
function FocusSelected({ point, markers }: { point: MapPoint | null; markers: React.RefObject<Map<string, LeafletCircle>> }) {
  const map = useMap();
  useEffect(() => {
    if (!point) return;
    const zoom = Math.max(map.getZoom(), 15);
    if (prefersReducedMotion()) map.setView([point.lat, point.lng], zoom);
    else map.flyTo([point.lat, point.lng], zoom, { duration: 0.6 });
    // Đợi bay xong mới mở popup, để popup không bị đẩy lệch
    const t = window.setTimeout(() => markers.current.get(point.id)?.openPopup(), prefersReducedMotion() ? 0 : 650);
    return () => window.clearTimeout(t);
  }, [point?.id]);
  return null;
}

/** Lấy được vị trí người dùng thì đưa bản đồ về quanh chỗ đó. */
function FitUser({ pos }: { pos: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (pos) map.setView([pos.lat, pos.lng], 14);
  }, [pos, map]);
  return null;
}
