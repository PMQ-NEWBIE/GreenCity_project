"use client";

import { cn } from "@/lib/utils";

const fmt = (n: number) => n.toLocaleString("vi-VN");

/** Làm tròn lên mốc dễ đọc: 1, 2, 2,5, 5 × 10^k. */
function niceMax(v: number): number {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  return ([1, 2, 2.5, 5, 10].find((m) => m * p >= v) ?? 10) * p;
}

/**
 * Cột dọc một chuỗi số liệu (màu chart-1). Lưới mờ, cột bo 4px ở đầu, khe 2px giữa các cột.
 * Rê chuột hoặc Tab vào cột để xem số; nhãn số chỉ ghi ở cột cuối.
 */
export function ColumnChart({ data, unit, label }: { data: { key: string; label: string; value: number }[]; unit: string; label: string }) {
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const ticks = [0, 0.5, 1].map((t) => Math.round(max * t));
  return (
    <figure aria-label={label} className="relative">
      <div className="flex h-56 gap-3">
        {/* Trục giá trị */}
        <div className="flex w-12 shrink-0 flex-col-reverse justify-between pb-6 text-right text-[11px] tabular-nums text-muted-foreground" aria-hidden="true">
          {ticks.map((t) => (
            <span key={t} className="-translate-y-1/2 leading-none first:translate-y-0">
              {fmt(t)}
            </span>
          ))}
        </div>
        <div className="relative flex min-w-0 flex-1 flex-col">
          {/* Lưới */}
          <div className="pointer-events-none absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between" aria-hidden="true">
            {ticks.map((t) => (
              <span key={t} className="h-px bg-border/70" />
            ))}
          </div>
          <div className="relative flex flex-1 items-end gap-[2px] pb-px">
            {data.map((d, i) => {
              const last = i === data.length - 1;
              return (
                <button
                  key={d.key}
                  type="button"
                  aria-label={`${d.label}: ${fmt(d.value)} ${unit}`}
                  className="group relative flex h-full flex-1 flex-col justify-end rounded-t-[4px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {last && (
                    <span className="mb-1 text-center text-[11px] font-semibold tabular-nums text-foreground" aria-hidden="true">
                      {fmt(d.value)}
                    </span>
                  )}
                  <span className="block w-full rounded-t-[4px] bg-chart-1 transition-opacity group-hover:opacity-80" style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? 2 : 0 }} />
                  {/* Tooltip */}
                  <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-popover px-2.5 py-1.5 text-[12px] text-popover-foreground shadow-md group-hover:block group-focus-visible:block">
                    <span className="block text-muted-foreground">{d.label}</span>
                    <span className="font-bold tabular-nums">
                      {fmt(d.value)} {unit}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex h-6 gap-[2px] border-t border-border pt-1" aria-hidden="true">
            {data.map((d) => (
              <span key={d.key} className="flex-1 truncate text-center text-[11px] text-muted-foreground">
                {d.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </figure>
  );
}

/** Thanh ngang xếp hạng (ít mục): tên — thanh — số. */
export function BarList({ data, unit, label, highlight }: { data: { key: string; label: string; value: number }[]; unit: string; label: string; highlight?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul aria-label={label} className="flex flex-col gap-2.5">
      {data.map((d) => (
        <li key={d.key} className="grid grid-cols-[96px_minmax(0,1fr)_auto] items-center gap-3 text-[13px]">
          <span className={cn("truncate", d.key === highlight ? "font-bold text-foreground" : "text-foreground/85")}>{d.label}</span>
          <span className="h-3 overflow-hidden rounded-r-[4px] bg-muted" aria-hidden="true">
            <span className={cn("block h-full rounded-r-[4px] bg-chart-1", highlight && d.key !== highlight && "opacity-45")} style={{ width: `${(d.value / max) * 100}%` }} />
          </span>
          <span className="w-20 text-right tabular-nums text-muted-foreground">
            {fmt(d.value)} {unit}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Bảng số liệu đi kèm biểu đồ — cho trình đọc màn hình và người cần số chính xác. */
export function DataTable({ caption, head, rows }: { caption: string; head: [string, string]; rows: [string, string][] }) {
  return (
    <details className="mt-4 rounded-xl border border-border">
      <summary className="flex min-h-11 cursor-pointer items-center px-4 text-[13px] font-semibold text-primary">Xem dạng bảng</summary>
      <div className="overflow-x-auto px-4 pb-3">
        <table className="w-full text-[13px]">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th scope="col" className="py-2 font-semibold">{head[0]}</th>
              <th scope="col" className="py-2 text-right font-semibold">{head[1]}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([a, b]) => (
              <tr key={a} className="border-b border-border/60 last:border-0">
                <th scope="row" className="py-1.5 font-normal text-foreground">{a}</th>
                <td className="py-1.5 text-right tabular-nums text-foreground">{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
