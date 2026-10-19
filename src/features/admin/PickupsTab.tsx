"use client";

import { useMemo, useState } from "react";
import { Search, Truck } from "lucide-react";
import { useCollect } from "@/store/hooks";
import { EmptyState } from "@/components/greencity/EmptyState";
import { inputClass } from "@/components/greencity/ui";
import { RequestItem } from "@/features/collect/RequestItem";
import { PICKUP_STATUS_LABEL } from "@/data/pickup";
import { isFinal } from "@/lib/pickup";
import type { PickupStatus } from "@/types/features";
import { cn } from "@/lib/utils";

type Filter = "mo" | PickupStatus | "all";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "mo", label: "Đang mở" },
  { key: "cho-nhan", label: PICKUP_STATUS_LABEL["cho-nhan"] },
  { key: "da-can", label: PICKUP_STATUS_LABEL["da-can"] },
  { key: "hoan-tat", label: "Hoàn tất" },
  { key: "da-huy", label: "Đã hủy" },
  { key: "all", label: "Tất cả" },
];

/** IV.1 — hàng chờ đơn thu gom. Bấm một đơn để mở trang chi tiết, có bảng thao tác cho đội thu gom. */
export function PickupsTab() {
  const { requests } = useCollect();
  const [filter, setFilter] = useState<Filter>("mo");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return requests.filter(
      (r) =>
        (filter === "all" || (filter === "mo" ? !isFinal(r.status) : r.status === filter)) &&
        (!s || [r.ownerName, r.area, r.address, ...r.materials].some((x) => x.toLowerCase().includes(s)))
    );
  }, [requests, filter, q]);

  return (
    <div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Lọc theo trạng thái">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "min-h-11 rounded-full border px-4 text-[14px] font-semibold transition-colors",
                filter === f.key ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground/80 hover:border-primary/50 hover:text-primary"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative lg:w-72">
          <label htmlFor="pickup-search" className="sr-only">
            Tìm đơn
          </label>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input id="pickup-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tên, quận, loại đồ…" className={cn(inputClass(), "pl-10")} />
        </div>
      </div>
      <p className="mt-4 text-[14px] text-muted-foreground" aria-live="polite">
        <strong className="text-foreground">{list.length}</strong> đơn
      </p>
      {list.length === 0 ? (
        <EmptyState icon={Truck} title="Không có đơn nào" description="Đổi bộ lọc để xem đơn ở trạng thái khác." />
      ) : (
        <ul className="mt-3 grid gap-3 lg:grid-cols-2">
          {list.map((r) => (
            <RequestItem key={r.id} request={r} showOwner />
          ))}
        </ul>
      )}
    </div>
  );
}
