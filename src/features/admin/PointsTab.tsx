"use client";

import { useState } from "react";
import { Gift } from "lucide-react";
import { useToast } from "@/store/hooks";
import { useLedger } from "@/store/use-admin";
import { FieldError, buttonClass, inputClass } from "@/components/greencity/ui";
import { POINT_REASON_LABEL, POINT_STATUS_LABEL, REDEMPTION_STATUS_LABEL } from "@/data/labels";
import { formatDateTime } from "@/utils/format";
import { cn } from "@/lib/utils";

/** IV.3 — danh sách điểm thưởng, lịch sử từng người, chỉnh điểm tay, giao quà đã đổi. */
export function PointsTab() {
  const { users, adjust, redemptions, markCollected, partnerOf } = useLedger();
  const toast = useToast();
  const [selected, setSelected] = useState<string | null>(null);
  const user = users.find((u) => u.email === selected) ?? users[0];
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const ready = redemptions.filter((r) => r.status === "ready");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(delta);
    if (!Number.isInteger(n) || n === 0) return setError("Nhập số điểm khác 0, ví dụ 10 hoặc -10");
    if (reason.trim().length < 5) return setError("Ghi lý do chỉnh (ít nhất 5 ký tự)");
    if (user.balance + n < 0) return setError("Số dư không được âm");
    adjust(user.email, n, reason);
    toast("success", `Đã chỉnh ${n > 0 ? "+" : ""}${n} điểm cho ${user.name}`);
    setDelta("");
    setReason("");
    setError("");
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
        <section aria-labelledby="pt-users">
          <h3 id="pt-users" className="mb-3 text-[18px] font-bold text-foreground">
            Người dùng ({users.length})
          </h3>
          <ul className="flex flex-col gap-1.5">
            {users.map((u) => (
              <li key={u.email}>
                <button
                  type="button"
                  aria-pressed={u.email === user?.email}
                  onClick={() => setSelected(u.email)}
                  className={cn(
                    "flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border px-4 text-left transition-colors",
                    u.email === user?.email ? "border-primary bg-accent" : "border-border bg-card hover:border-primary/40"
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-bold text-foreground">{u.name}</span>
                    <span className="block truncate text-[12px] text-muted-foreground">{u.email}</span>
                  </span>
                  <span className="shrink-0 text-[15px] font-extrabold tabular-nums text-primary">{u.balance}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        {user && (
          <section aria-labelledby="pt-detail" className="min-w-0">
            <h3 id="pt-detail" className="text-[18px] font-bold text-foreground">
              {user.name}: {user.balance} điểm
              {user.pending > 0 && <span className="ml-2 text-[14px] font-semibold text-muted-foreground">(+{user.pending} chờ xác minh)</span>}
            </h3>
            <form onSubmit={submit} noValidate className="mt-3 grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:items-end">
              <div>
                <label htmlFor="adj-delta" className="mb-1.5 block text-[13px] font-semibold text-foreground">
                  Số điểm
                </label>
                <input id="adj-delta" inputMode="numeric" value={delta} onChange={(e) => { setDelta(e.target.value.replace(/[^0-9-]/g, "")); setError(""); }} placeholder="+10 / -10" className={inputClass()} />
              </div>
              <div>
                <label htmlFor="adj-reason" className="mb-1.5 block text-[13px] font-semibold text-foreground">
                  Lý do (bắt buộc)
                </label>
                <input id="adj-reason" value={reason} onChange={(e) => { setReason(e.target.value); setError(""); }} placeholder="VD: bù điểm lượt cân bị nhập thiếu" className={inputClass()} />
              </div>
              <button type="submit" className={buttonClass.primary}>
                Chỉnh điểm
              </button>
              <div className="sm:col-span-3">
                <FieldError msg={error} />
              </div>
            </form>
            <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
              {user.entries.map((e) => (
                <li key={e.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] text-foreground">{e.title}</p>
                    <p className="text-[12px] text-muted-foreground">
                      {POINT_REASON_LABEL[e.reason]} · {formatDateTime(e.at)}
                      {e.status !== "confirmed" && <> · {POINT_STATUS_LABEL[e.status]}</>}
                      {e.note && <> · {e.note}</>}
                    </p>
                  </div>
                  <span className={cn("shrink-0 text-[15px] font-bold tabular-nums", e.status === "rejected" ? "text-muted-foreground line-through" : e.delta > 0 ? "text-primary" : "text-foreground")}>
                    {e.delta > 0 ? "+" : "−"}
                    {Math.abs(e.delta)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <section aria-labelledby="pt-gifts">
        <h3 id="pt-gifts" className="mb-3 flex items-center gap-2 text-[18px] font-bold text-foreground">
          <Gift className="h-5 w-5 text-primary" aria-hidden="true" />
          Quà chờ giao ({ready.length})
        </h3>
        {redemptions.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-5 text-[14px] text-muted-foreground">Chưa có ai đổi quà.</p>
        ) : (
          <ul className="grid gap-2 lg:grid-cols-2">
            {redemptions.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-bold text-foreground">{r.rewardName}</p>
                  <p className="text-[12px] text-muted-foreground">
                    <span className="font-mono">{r.code}</span> · {partnerOf(r.rewardId)} · {REDEMPTION_STATUS_LABEL[r.status]}
                  </p>
                </div>
                {r.status === "ready" && (
                  <button type="button" onClick={() => { markCollected(r.id); toast("success", "Đã ghi nhận giao quà", r.code); }} className={cn(buttonClass.secondary, "min-h-11")}>
                    Đã giao quà
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
