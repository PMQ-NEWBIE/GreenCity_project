"use client";

import { useState } from "react";
import { Gift } from "lucide-react";
import { useLedger } from "@/store/use-admin";
import { useToast } from "@/store/hooks";
import { FieldError, buttonClass, inputClass } from "@/components/greencity/ui";
import { REDEMPTION_STATUS_LABEL } from "@/data/labels";
import { formatDateTime } from "@/utils/format";
import { cn } from "@/lib/utils";

/** Mã dạng GC-XXXX-XXXX: bỏ khoảng trắng, viết hoa, tự thêm "GC-" nếu người dân chỉ đọc phần sau. */
function normalizeCode(v: string) {
  const s = v.toUpperCase().replace(/\s+/g, "");
  return s.startsWith("GC-") ? s : `GC-${s}`;
}

/**
 * Trả thưởng tại điểm thu gom: người dân đọc mã nhận quà (có trong mục Đổi quà của họ),
 * cộng tác viên nhập mã, đối chiếu đúng món rồi bấm đã trao.
 */
export function GiftHandover() {
  const { redemptions, markCollected, partnerOf } = useLedger();
  const toast = useToast();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [found, setFound] = useState<string | null>(null);
  const ready = redemptions.filter((r) => r.status === "ready");
  const hit = redemptions.find((r) => r.id === found);

  const lookup = (e: React.FormEvent) => {
    e.preventDefault();
    const c = normalizeCode(code);
    const r = redemptions.find((x) => x.code === c);
    setFound(null);
    if (!r) return setError("Không có mã này. Nhờ người dân mở mục Đổi quà để đọc lại mã.");
    if (r.status !== "ready") return setError(`Mã ${r.code} ${REDEMPTION_STATUS_LABEL[r.status].toLowerCase()}, không trao lại được.`);
    setError("");
    setFound(r.id);
  };

  const handOver = (id: string, c: string) => {
    markCollected(id);
    toast("success", "Đã trao quà", c);
    setFound(null);
    setCode("");
  };

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={lookup} noValidate className="rounded-2xl border border-primary/30 bg-card p-5">
        <label htmlFor="gift-code" className="block text-[16px] font-bold text-foreground">
          Nhập mã nhận quà
        </label>
        <p className="mt-1 text-[14px] text-muted-foreground">Người dân đọc mã trong mục Đổi quà của họ, ví dụ GC-AB12-CD34.</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            id="gift-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="GC-XXXX-XXXX"
            autoComplete="off"
            className={cn(inputClass(error), "font-mono uppercase sm:max-w-xs")}
          />
          <button type="submit" className={buttonClass.primary}>
            Kiểm tra mã
          </button>
        </div>
        <FieldError msg={error} />
        {hit && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-accent px-4 py-3" role="status">
            <p className="text-[15px] text-accent-foreground">
              <strong>{hit.rewardName}</strong> · {partnerOf(hit.rewardId)}
              <span className="block text-[13px]">Đổi lúc {formatDateTime(hit.at)} · {hit.pointsSpent} điểm</span>
            </p>
            <button type="button" onClick={() => handOver(hit.id, hit.code)} className={buttonClass.primary}>
              <Gift className="h-[18px] w-[18px]" aria-hidden="true" />
              Đã trao quà
            </button>
          </div>
        )}
      </form>

      <section aria-labelledby="gift-waiting">
        <h3 id="gift-waiting" className="mb-3 text-[18px] font-bold text-foreground">
          Quà đang chờ nhận ({ready.length})
        </h3>
        {ready.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-5 text-[14px] text-muted-foreground">Chưa có ai đổi quà đang chờ nhận.</p>
        ) : (
          <ul className="grid gap-2 lg:grid-cols-2">
            {ready.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-bold text-foreground">{r.rewardName}</p>
                  <p className="text-[12px] text-muted-foreground">
                    <span className="font-mono">{r.code}</span> · hết hạn {formatDateTime(r.expiresAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
