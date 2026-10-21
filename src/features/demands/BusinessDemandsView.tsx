"use client";

import { useState } from "react";
import { Plus, Store } from "lucide-react";
import { useDemands } from "@/store/use-demands";
import { useToast } from "@/store/hooks";
import { FieldError, PageContainer, PageIntro, buttonClass, inputClass } from "@/components/greencity/ui";
import { LOT_MATERIALS, LOT_SELLER_KIND_LABEL } from "@/data/lots";
import { AREAS, type Area } from "@/types";
import { formatPrice } from "@/utils/format";
import { cn } from "@/lib/utils";
import { DemandCard, OFFER_STATUS_BADGE } from "./DemandCard";

const selectCls = cn(inputClass(), "select-chevron cursor-pointer appearance-none");

/** Doanh nghiệp: đăng nhu cầu thu mua, nhận / từ chối lời chào của vựa và điểm thu gom. */
export function BusinessDemandsView() {
  const { mine, decide, close } = useDemands();
  const toast = useToast();
  const [adding, setAdding] = useState(false);

  return (
    <PageContainer>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageIntro title="Đăng nhu cầu cần mua">
          Cần một loại hàng đều đặn (rác hữu cơ làm phân, chai PET, bìa carton…)? Đăng nhu cầu, vựa và điểm thu gom sẽ chào hàng cho bạn chọn.
        </PageIntro>
        {!adding && (
          <button type="button" onClick={() => setAdding(true)} className={buttonClass.primary}>
            <Plus className="h-[18px] w-[18px]" aria-hidden="true" />
            Đăng nhu cầu
          </button>
        )}
      </div>

      {adding && <NewDemandForm onDone={() => setAdding(false)} />}

      {mine.length === 0 && !adding ? (
        <p className="mt-6 rounded-2xl border border-dashed border-border p-5 text-[14px] text-muted-foreground">
          Bạn chưa đăng nhu cầu nào. Lô có sẵn ở tab Chợ lô vật liệu; nhu cầu dùng khi bạn cần gom thêm theo yêu cầu riêng.
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 lg:grid-cols-2">
          {mine.map((d) => (
            <DemandCard key={d.id} demand={d}>
              <h4 className="text-[14px] font-bold text-foreground">Lời chào hàng ({d.offers.length})</h4>
              {d.offers.length === 0 ? (
                <p className="mt-1 text-[13px] text-muted-foreground">Chưa có ai chào. Vựa và điểm thu gom quanh khu vực sẽ thấy nhu cầu này.</p>
              ) : (
                <ul className="mt-2 flex flex-col gap-2">
                  {d.offers.map((o) => (
                    <li key={o.id} className="rounded-xl border border-border p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="flex items-center gap-1.5 text-[14px] font-semibold text-foreground">
                          <Store className="h-4 w-4 text-primary" aria-hidden="true" />
                          {LOT_SELLER_KIND_LABEL[o.fromKind]}: {o.fromName}
                        </p>
                        {o.status !== "cho" && (
                          <span className={cn("rounded-full px-2 py-0.5 text-[11.5px] font-bold", OFFER_STATUS_BADGE[o.status])}>
                            {o.status === "nhan" ? "Đã nhận" : "Đã từ chối"}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[14px] text-foreground">
                        {o.kg.toLocaleString("vi-VN")}kg · {formatPrice(o.pricePerKg)}/kg
                      </p>
                      {o.note && <p className="mt-1 text-[13px] text-muted-foreground">{o.note}</p>}
                      {o.status === "cho" && d.status === "dang-mua" && (
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              decide(d.id, o.id, "nhan");
                              toast("success", `Đã nhận chào hàng của ${o.fromName}`);
                            }}
                            className={cn(buttonClass.primary, "min-h-10 px-4 text-[14px]")}
                          >
                            Nhận
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              decide(d.id, o.id, "tu-choi");
                              toast("info", `Đã từ chối ${o.fromName}`);
                            }}
                            className={cn(buttonClass.secondary, "min-h-10 px-4 text-[14px]")}
                          >
                            Từ chối
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {d.status === "dang-mua" && (
                <button
                  type="button"
                  onClick={() => {
                    close(d.id);
                    toast("success", "Đã đóng nhu cầu", d.material);
                  }}
                  className={cn(buttonClass.ghost, "-ml-3 mt-2")}
                >
                  Đã đủ hàng, đóng nhu cầu
                </button>
              )}
            </DemandCard>
          ))}
        </ul>
      )}
    </PageContainer>
  );
}

function NewDemandForm({ onDone }: { onDone: () => void }) {
  const { post } = useDemands();
  const toast = useToast();
  const [f, setF] = useState({ material: LOT_MATERIALS[LOT_MATERIALS.length - 1] as string, kg: "", price: "", area: "", note: "" });
  const [error, setError] = useState("");
  const set = (k: keyof typeof f, v: string) => {
    setF((x) => ({ ...x, [k]: v }));
    setError("");
  };
  const num = (v: string) => Number(v.replace(/\./g, "").replace(",", "."));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!(num(f.kg) >= 50)) return setError("Nhu cầu từ 50kg trở lên");
    if (!(num(f.price) > 0)) return setError("Ghi giá thu mua mỗi kg");
    const d = post({ material: f.material, kg: num(f.kg), pricePerKg: num(f.price), area: (f.area || null) as Area | null, note: f.note });
    if (!d) return setError("Chỉ tài khoản doanh nghiệp đăng được nhu cầu");
    toast("success", "Đã đăng nhu cầu", `${d.kg.toLocaleString("vi-VN")}kg ${d.material.toLowerCase()}`);
    onDone();
  };

  return (
    <form onSubmit={submit} noValidate className="mt-6 rounded-2xl border border-primary/30 bg-card p-5">
      <h3 className="text-[16px] font-bold text-foreground">Nhu cầu mới</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="nd-material" className="mb-1.5 block text-[13px] font-semibold text-foreground">
            Loại hàng
          </label>
          <select id="nd-material" value={f.material} onChange={(e) => set("material", e.target.value)} className={selectCls}>
            {LOT_MATERIALS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="nd-kg" className="mb-1.5 block text-[13px] font-semibold text-foreground">
            Cần bao nhiêu kg
          </label>
          <input id="nd-kg" inputMode="decimal" value={f.kg} onChange={(e) => set("kg", e.target.value.replace(/[^0-9.,]/g, ""))} className={inputClass()} />
        </div>
        <div>
          <label htmlFor="nd-price" className="mb-1.5 block text-[13px] font-semibold text-foreground">
            Giá thu mua (đồng/kg)
          </label>
          <input id="nd-price" inputMode="decimal" value={f.price} onChange={(e) => set("price", e.target.value.replace(/[^0-9.,]/g, ""))} className={inputClass()} />
        </div>
        <div>
          <label htmlFor="nd-area" className="mb-1.5 block text-[13px] font-semibold text-foreground">
            Nhận hàng ở
          </label>
          <select id="nd-area" value={f.area} onChange={(e) => set("area", e.target.value)} className={selectCls}>
            <option value="">Cả thành phố</option>
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-3">
        <label htmlFor="nd-note" className="mb-1.5 block text-[13px] font-semibold text-foreground">
          Yêu cầu về hàng
        </label>
        <textarea
          id="nd-note"
          rows={2}
          maxLength={300}
          value={f.note}
          onChange={(e) => set("note", e.target.value)}
          placeholder="Ví dụ: rau củ, trái cây hết hạn; không lẫn túi nilon; nhận sáng thứ Hai"
          className={cn(inputClass(), "h-auto py-3")}
        />
      </div>
      <FieldError msg={error} />
      <div className="mt-4 flex gap-2">
        <button type="submit" className={buttonClass.primary}>
          Đăng nhu cầu
        </button>
        <button type="button" onClick={onDone} className={buttonClass.secondary}>
          Hủy
        </button>
      </div>
    </form>
  );
}
