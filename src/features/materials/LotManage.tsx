"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useToast } from "@/store/hooks";
import { useMaterials } from "@/store/use-materials";
import { FieldError, buttonClass, inputClass } from "@/components/greencity/ui";
import { LOT_MATERIALS, LOT_STATUS_LABEL } from "@/data/lots";
import { AREAS, type Area } from "@/types";
import type { LotGrade } from "@/types/features";
import { formatDateTime, formatPrice } from "@/utils/format";
import { cn } from "@/lib/utils";
import { GRADE_BADGE, LOT_STATUS_BADGE } from "./LotCard";

const selectCls = cn(
  inputClass(),
  "select-chevron cursor-pointer appearance-none",
);

/**
 * scope "mine": vựa / điểm thu gom đăng lô từ hàng đã gom, chốt bán hoặc bỏ giữ khi doanh nghiệp đặt.
 * scope "all": ban điều hành xem mọi lô để theo dõi, không thao tác thay người bán.
 */
export function LotManage({ scope = "mine" }: { scope?: "mine" | "all" }) {
  const { lots: allLots, myLots, markSold, release } = useMaterials();
  const toast = useToast();
  const [adding, setAdding] = useState(false);
  const mine = scope === "mine";
  const lots = mine ? myLots : allLots;

  return (
    <div>
      {mine &&
        (adding ? (
          <NewLotForm onDone={() => setAdding(false)} />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className={buttonClass.primary}
          >
            <Plus className="h-[18px] w-[18px]" aria-hidden="true" />
            Đăng lô mới
          </button>
        ))}
      {mine && lots.length === 0 && !adding && (
        <p className="mt-4 rounded-2xl border border-dashed border-border p-5 text-[14px] text-muted-foreground">
          Bạn chưa đăng lô nào. Gom đủ từ 50kg một loại thì đăng lô, doanh
          nghiệp tái chế sẽ đặt giữ và tới lấy.
        </p>
      )}
      {lots.length > 0 && (
        <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-[14px]">
            <caption className="sr-only">Danh sách lô vật liệu</caption>
            <thead>
              <tr className="border-b border-border text-left text-[12px] uppercase tracking-wide text-muted-foreground">
                <th scope="col" className="px-4 py-3 font-semibold">
                  Lô
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Khối lượng, giá
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Tình trạng
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  <span className="sr-only">Thao tác</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {lots.map((l) => (
                <tr
                  key={l.id}
                  className="border-b border-border/60 last:border-0 align-top"
                >
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-foreground">
                      {l.code}
                    </span>
                    <span
                      className={cn(
                        "ml-2 rounded-full px-2 py-0.5 text-[11px] font-bold",
                        GRADE_BADGE[l.grade],
                      )}
                    >
                      {l.grade}
                    </span>
                    <span className="block text-foreground">{l.material}</span>
                    <span className="block text-[12px] text-muted-foreground">
                      {l.warehouse}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-foreground">
                    {l.weightKg.toLocaleString("vi-VN")}kg
                    <span className="block text-[12px] text-muted-foreground">
                      {formatPrice(l.pricePerKg)}/kg
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[12px] font-bold",
                        LOT_STATUS_BADGE[l.status],
                      )}
                    >
                      {LOT_STATUS_LABEL[l.status]}
                    </span>
                    {l.reservation && (
                      <span className="mt-1 block text-[12px] text-muted-foreground">
                        {l.reservation.businessName} · lấy{" "}
                        {formatDateTime(l.reservation.pickupAt)}
                      </span>
                    )}
                    {l.soldTo && (
                      <span className="mt-1 block text-[12px] text-muted-foreground">
                        {l.soldTo}
                      </span>
                    )}
                    {!mine && l.sellerName && (
                      <span className="mt-1 block text-[12px] text-muted-foreground">
                        Người bán: {l.sellerName}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {mine && l.status === "dang-giu" && (
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            markSold(l.id);
                            toast("success", `Đã chốt bán ${l.code}`);
                          }}
                          className={cn(
                            buttonClass.primary,
                            "min-h-10 px-3 text-[14px]",
                          )}
                        >
                          Chốt đã bán
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            release(l.id);
                            toast("info", `Đã bỏ giữ ${l.code}`);
                          }}
                          className={cn(buttonClass.ghost, "min-h-10")}
                        >
                          Bỏ giữ
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function NewLotForm({ onDone }: { onDone: () => void }) {
  const { createLot } = useMaterials();
  const toast = useToast();
  const [f, setF] = useState({
    material: LOT_MATERIALS[0] as string,
    weightKg: "",
    pricePerKg: "",
    grade: "A" as LotGrade,
    purity: "90",
    moisture: "5",
    warehouse: "",
    area: "" as Area | "",
    note: "",
  });
  const [error, setError] = useState("");
  const set = (k: keyof typeof f, v: string) => {
    setF((x) => ({ ...x, [k]: v }));
    setError("");
  };
  const num = (v: string) => Number(v.replace(",", "."));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!(num(f.weightKg) >= 50)) return setError("Lô cần ít nhất 50kg");
    if (!(num(f.pricePerKg) > 0)) return setError("Nhập giá mỗi kg");
    const purity = num(f.purity);
    const moisture = num(f.moisture);
    if (!(purity >= 0 && purity <= 100) || !(moisture >= 0 && moisture <= 100))
      return setError("Độ sạch và độ ẩm nằm trong 0–100%");
    if (f.warehouse.trim().length < 3 || !f.area)
      return setError("Ghi tên kho và chọn quận");
    const lot = createLot({
      material: f.material,
      weightKg: num(f.weightKg),
      pricePerKg: num(f.pricePerKg),
      grade: f.grade,
      purity,
      moisture,
      warehouse: f.warehouse.trim(),
      area: f.area as Area,
      note: f.note.trim(),
    });
    toast("success", `Đã đăng lô ${lot.code}`);
    onDone();
  };

  const input = (
    k: "weightKg" | "pricePerKg" | "purity" | "moisture",
    label: string,
  ) => (
    <div>
      <label
        htmlFor={`nl-${k}`}
        className="mb-1.5 block text-[13px] font-semibold text-foreground"
      >
        {label}
      </label>
      <input
        id={`nl-${k}`}
        inputMode="decimal"
        value={f[k]}
        onChange={(e) => set(k, e.target.value.replace(/[^0-9.,]/g, ""))}
        className={inputClass()}
      />
    </div>
  );

  return (
    <form
      onSubmit={submit}
      noValidate
      className="rounded-2xl border border-primary/30 bg-card p-5"
    >
      <h3 className="text-[16px] font-bold text-foreground">Lô mới</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label
            htmlFor="nl-material"
            className="mb-1.5 block text-[13px] font-semibold text-foreground"
          >
            Vật liệu
          </label>
          <select
            id="nl-material"
            value={f.material}
            onChange={(e) => set("material", e.target.value)}
            className={selectCls}
          >
            {LOT_MATERIALS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        {input("weightKg", "Khối lượng (kg)")}
        {input("pricePerKg", "Giá (đồng/kg)")}
        <div>
          <label
            htmlFor="nl-grade"
            className="mb-1.5 block text-[13px] font-semibold text-foreground"
          >
            Hạng
          </label>
          <select
            id="nl-grade"
            value={f.grade}
            onChange={(e) => set("grade", e.target.value)}
            className={selectCls}
          >
            {(["A", "B", "C"] as const).map((g) => (
              <option key={g} value={g}>
                Hạng {g}
              </option>
            ))}
          </select>
        </div>
        {input("purity", "Độ sạch (%)")}
        {input("moisture", "Độ ẩm (%)")}
        <div>
          <label
            htmlFor="nl-warehouse"
            className="mb-1.5 block text-[13px] font-semibold text-foreground"
          >
            Kho
          </label>
          <input
            id="nl-warehouse"
            value={f.warehouse}
            onChange={(e) => set("warehouse", e.target.value)}
            placeholder="Kho Gò Vấp"
            className={inputClass()}
          />
        </div>
        <div>
          <label
            htmlFor="nl-area"
            className="mb-1.5 block text-[13px] font-semibold text-foreground"
          >
            Quận
          </label>
          <select
            id="nl-area"
            value={f.area}
            onChange={(e) => set("area", e.target.value)}
            className={selectCls}
          >
            <option value="">Chọn quận…</option>
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-3">
        <label
          htmlFor="nl-note"
          className="mb-1.5 block text-[13px] font-semibold text-foreground"
        >
          Ghi chú kiểm định
        </label>
        <input
          id="nl-note"
          value={f.note}
          onChange={(e) => set("note", e.target.value)}
          placeholder="VD: đã ép kiện 40kg, lẫn ít băng keo"
          className={inputClass()}
        />
      </div>
      <FieldError msg={error} />
      <div className="mt-4 flex gap-2">
        <button type="submit" className={buttonClass.primary}>
          Đăng lô
        </button>
        <button
          type="button"
          onClick={onDone}
          className={buttonClass.secondary}
        >
          Hủy
        </button>
      </div>
    </form>
  );
}
