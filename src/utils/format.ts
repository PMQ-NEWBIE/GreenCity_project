import type { Product } from "@/types";

export function formatPrice(price: number, unit?: string): string {
  const formatted = price.toLocaleString("vi-VN");
  return unit ? `${formatted}đ/${unit}` : `${formatted}đ`;
}

export function formatCompact(n: number): string {
  return n.toLocaleString("vi-VN");
}

export function formatHoursAgo(hours: number): string {
  if (hours < 1) return "Vừa xong";
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Hôm qua";
  return `${days} ngày trước`;
}

const dateFmt = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
const timeFmt = new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });

/** "19/10/2026" */
export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}

/** "07:30 · 19/10/2026" */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${timeFmt.format(d)} · ${dateFmt.format(d)}`;
}

/** "Vừa xong", "3 giờ trước", "Hôm qua", "5 ngày trước" */
export function formatRelativeTime(iso: string): string {
  const hours = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000));
  return formatHoursAgo(hours);
}

export function greetingByHour(): string {
  const h = new Date().getHours();
  if (h < 11) return "Chào buổi sáng";
  if (h < 14) return "Chào buổi trưa";
  if (h < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

export function todayLabel(): string {
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function isEmailFormat(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}
