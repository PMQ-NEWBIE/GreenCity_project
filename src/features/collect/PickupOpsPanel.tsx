"use client";

import { useState } from "react";
import { Plus, Scale, Trash2, Truck, Wallet } from "lucide-react";
import { useCollect, useToast } from "@/store/hooks";
import { FieldError, buttonClass, inputClass } from "@/components/greencity/ui";
import { MATERIAL_PRICE_PER_KG, PAYOUT_LABEL } from "@/data/pickup";
import { POINT_RULES } from "@/data/point-rules";
import { pickupPoints, totalAmount, totalKg } from "@/lib/pickup";
import { MATERIAL_OPTIONS } from "@/types";
import type { PayoutMethod, PickupRequest, WeighLine } from "@/types/features";
import { formatPrice } from "@/utils/format";
import { cn } from "@/lib/utils";

/** "YYYY-MM-DDTHH:mm" theo giờ máy — giá trị cho <input type="datetime-local">. */
function localInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** 9 giờ sáng hôm sau — giờ hẹn gợi ý. */
export function tomorrowNine(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  return d;
}

/**
 * Thao tác của người mua (vựa, ve chai dạo) cho một yêu cầu thu gom:
 * nhận đơn → lên đường → cân → thanh toán. Dùng ở trang chi tiết trong khu người mua.
 */
export function PickupOpsPanel({ request: r }: { request: PickupRequest }) {
  if (r.status === "cho-nhan") return <AssignStep request={r} />;
  if (r.status === "da-nhan") return <DepartStep request={r} />;
  if (r.status === "dang-den") return <WeighStep request={r} />;
  if (r.status === "da-can") return <PayStep request={r} />;
  return null;
}

function Panel({ icon: Icon, title, children }: { icon: typeof Truck; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-primary/30 bg-card p-5">
      <h3 className="flex items-center gap-2 text-[16px] font-bold text-foreground">
        <Icon className="h-[18px] w-[18px] text-primary" aria-hidden="true" />
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Người mua tự nhận yêu cầu và hẹn giờ tới lấy. */
function AssignStep({ request: r }: { request: PickupRequest }) {
  const { take } = useCollect();
  const toast = useToast();
  const [when, setWhen] = useState(() => localInputValue(tomorrowNine()));
  const [error, setError] = useState("");

  const submit = () => {
    const at = new Date(when);
    if (Number.isNaN(at.getTime())) return setError("Chọn giờ hẹn");
    take(r.id, at.toISOString());
    toast("success", "Bạn đã nhận đơn", `Hẹn ${r.ownerName} lúc ${at.toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}.`);
  };

  return (
    <Panel icon={Truck} title="Nhận đơn này">
      <p className="text-[14px] text-muted-foreground">
        Người nhận trước sẽ giữ đơn. Hẹn giờ trong khung {r.time.toLowerCase()} mà người gửi đã chọn.
      </p>
      <div className="mt-4 max-w-xs">
        <label htmlFor={`when-${r.id}`} className="mb-1.5 block text-[14px] font-semibold text-foreground">
          Giờ hẹn
        </label>
        <input id={`when-${r.id}`} type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className={inputClass()} />
      </div>
      <FieldError msg={error} />
      <button type="button" onClick={submit} className={cn(buttonClass.primary, "mt-4 w-full sm:w-auto")}>
        Nhận đơn, hẹn giờ
      </button>
    </Panel>
  );
}

function DepartStep({ request: r }: { request: PickupRequest }) {
  const { depart } = useCollect();
  const toast = useToast();
  return (
    <Panel icon={Truck} title="Lên đường">
      <p className="text-[14px] text-muted-foreground">Bấm khi bạn bắt đầu đi tới nhà người gửi. Họ sẽ thấy "Người mua đang tới".</p>
      <button
        type="button"
        onClick={() => {
          depart(r.id);
          toast("info", "Đã báo người gửi là bạn đang tới");
        }}
        className={cn(buttonClass.primary, "mt-4 w-full sm:w-auto")}
      >
        Tôi đang tới
      </button>
    </Panel>
  );
}

interface LineDraft {
  material: string;
  kg: string;
  price: string;
}

function WeighStep({ request: r }: { request: PickupRequest }) {
  const { weigh } = useCollect();
  const toast = useToast();
  const [lines, setLines] = useState<LineDraft[]>(() =>
    r.materials.map((m) => ({ material: m, kg: "", price: String(MATERIAL_PRICE_PER_KG[m] ?? 2000) }))
  );
  const [sorted, setSorted] = useState(r.presorted);
  const [error, setError] = useState("");

  const parsed: WeighLine[] = lines.map((l) => ({
    material: l.material,
    kg: Number(l.kg.replace(",", ".")) || 0,
    pricePerKg: Number(l.price) || 0,
  }));
  const unused = MATERIAL_OPTIONS.filter((m) => !lines.some((l) => l.material === m));

  const update = (i: number, patch: Partial<LineDraft>) => {
    setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));
    setError("");
  };

  const submit = () => {
    if (!parsed.some((l) => l.kg > 0)) return setError("Nhập khối lượng cho ít nhất một loại");
    if (parsed.some((l) => l.kg > 0 && l.pricePerKg <= 0)) return setError("Đơn giá cần lớn hơn 0");
    weigh(r.id, parsed, sorted);
    toast("success", "Đã lưu số cân", `${totalKg(parsed).toLocaleString("vi-VN")}kg · ${formatPrice(totalAmount(parsed))}`);
  };

  return (
    <Panel icon={Scale} title="Cân tại nhà">
      <div className="flex flex-col gap-3">
        {lines.map((l, i) => (
          <fieldset key={l.material} className="grid grid-cols-[minmax(0,1fr)_88px_104px_44px] items-end gap-2">
            <legend className="sr-only">{l.material}</legend>
            <p className="pb-3 text-[14px] font-semibold text-foreground">{l.material}</p>
            <div>
              <label htmlFor={`kg-${r.id}-${i}`} className="mb-1 block text-[12px] font-semibold text-muted-foreground">
                Kg
              </label>
              <input
                id={`kg-${r.id}-${i}`}
                inputMode="decimal"
                value={l.kg}
                onChange={(e) => update(i, { kg: e.target.value.replace(/[^0-9.,]/g, "") })}
                placeholder="0"
                className={cn(inputClass(), "px-3")}
              />
            </div>
            <div>
              <label htmlFor={`price-${r.id}-${i}`} className="mb-1 block text-[12px] font-semibold text-muted-foreground">
                Đồng/kg
              </label>
              <input
                id={`price-${r.id}-${i}`}
                inputMode="numeric"
                value={l.price}
                onChange={(e) => update(i, { price: e.target.value.replace(/[^0-9]/g, "") })}
                className={cn(inputClass(), "px-3")}
              />
            </div>
            <button
              type="button"
              onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))}
              disabled={lines.length === 1}
              aria-label={`Bỏ dòng ${l.material}`}
              className="flex h-12 w-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-destructive disabled:opacity-40"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </fieldset>
        ))}
      </div>

      {unused.length > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <label htmlFor={`add-${r.id}`} className="sr-only">
            Thêm loại vật liệu
          </label>
          <select
            id={`add-${r.id}`}
            value=""
            onChange={(e) => {
              const m = e.target.value;
              if (m) setLines((ls) => [...ls, { material: m, kg: "", price: String(MATERIAL_PRICE_PER_KG[m] ?? 2000) }]);
            }}
            className={cn(inputClass(), "select-chevron h-11 cursor-pointer appearance-none sm:max-w-xs")}
          >
            <option value="">+ Thêm loại khác…</option>
            {unused.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <Plus className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </div>
      )}

      <label className="mt-4 flex cursor-pointer items-center gap-3 text-[14px] text-foreground">
        <input type="checkbox" checked={sorted} onChange={(e) => setSorted(e.target.checked)} className="h-5 w-5 accent-primary" />
        Đồ đã được phân loại đúng (cộng điểm thưởng thêm)
      </label>

      <p className="mt-4 rounded-xl bg-muted px-4 py-3 text-[14px] text-foreground" aria-live="polite">
        Tổng: <strong>{totalKg(parsed).toLocaleString("vi-VN")}kg</strong> · <strong>{formatPrice(totalAmount(parsed))}</strong>
      </p>
      <FieldError msg={error} />
      <button type="button" onClick={submit} className={cn(buttonClass.primary, "mt-4 w-full sm:w-auto")}>
        Lưu số cân
      </button>
    </Panel>
  );
}

export function PayoutChoice({
  request: r,
  method,
  onChange,
  name,
}: {
  request: PickupRequest;
  method: PayoutMethod;
  onChange: (m: PayoutMethod) => void;
  name: string;
}) {
  const lines = r.weighLines ?? [];
  return (
    <div className="grid gap-2" role="radiogroup" aria-label="Cách nhận tiền">
      {(Object.keys(PAYOUT_LABEL) as PayoutMethod[]).map((m) => {
        const pts = pickupPoints(lines, !!r.sortedConfirmed, m, POINT_RULES);
        const total = pts.kg + pts.sorted + pts.cash;
        return (
          <label
            key={m}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors",
              method === m ? "border-primary bg-accent" : "border-border hover:border-primary/40"
            )}
          >
            <input type="radio" name={name} checked={method === m} onChange={() => onChange(m)} className="mt-0.5 h-5 w-5 accent-primary" />
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold text-foreground">{PAYOUT_LABEL[m]}</span>
              <span className="block text-[13px] text-muted-foreground">
                {m === "quy-diem" ? "Không nhận tiền" : formatPrice(totalAmount(lines))} · +{total} điểm
              </span>
            </span>
          </label>
        );
      })}
    </div>
  );
}

function PayStep({ request: r }: { request: PickupRequest }) {
  const { finish } = useCollect();
  const toast = useToast();
  const [method, setMethod] = useState<PayoutMethod>("tien-mat");
  return (
    <Panel icon={Wallet} title="Thanh toán">
      <PayoutChoice request={r} method={method} onChange={setMethod} name={`pay-${r.id}`} />
      <button
        type="button"
        onClick={() => {
          finish(r.id, method);
          toast("success", "Đơn đã hoàn tất", r.ownerId ? "Điểm đã được cộng cho người gửi." : undefined);
        }}
        className={cn(buttonClass.primary, "mt-4 w-full sm:w-auto")}
      >
        Xác nhận đã thanh toán
      </button>
    </Panel>
  );
}
