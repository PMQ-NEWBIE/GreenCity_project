"use client";

import { useState } from "react";
import { GcModal } from "@/components/greencity/GcModal";
import { FieldError, buttonClass, inputClass } from "@/components/greencity/ui";
import { useToast } from "@/store/hooks";
import { useMaterials } from "@/store/use-materials";
import { HOLD_HOURS, holdExpiresAt, lotValue, type ReserveBlock } from "@/lib/materials";
import type { MaterialLot } from "@/types/features";
import { formatDateTime, formatPrice } from "@/utils/format";
import { cn } from "@/lib/utils";

const BLOCK_MSG: Record<ReserveBlock, string> = {
  not_available: "Lô vừa có doanh nghiệp khác giữ hoặc đã bán.",
  pickup_too_soon: "Giờ lấy hàng cần sau ít nhất 2 giờ để kho chuẩn bị.",
  pickup_after_hold: `Giờ lấy hàng phải nằm trong ${HOLD_HOURS} giờ giữ lô.`,
};

function localInput(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function ReserveModal({ lot, onClose }: { lot: MaterialLot | null; onClose: () => void }) {
  return (
    <GcModal open={!!lot} onClose={onClose} title={`Giữ lô ${lot?.code ?? ""}`} description={`Lô được giữ riêng cho bạn ${HOLD_HOURS} giờ. Quá hạn chưa chốt thì lô tự mở bán lại.`}>
      {lot && <ReserveForm key={lot.id} lot={lot} onDone={onClose} />}
    </GcModal>
  );
}

function ReserveForm({ lot, onDone }: { lot: MaterialLot; onDone: () => void }) {
  const { reserve } = useMaterials();
  const toast = useToast();
  const [pickup, setPickup] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    return localInput(d);
  });
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const at = new Date(pickup);
    if (Number.isNaN(at.getTime())) return setError("Chọn giờ lấy hàng");
    const block = reserve(lot.id, at, note);
    if (block) return setError(BLOCK_MSG[block]);
    toast("success", `Đã giữ lô ${lot.code}`, `Giữ tới ${formatDateTime(holdExpiresAt(new Date()))}.`);
    onDone();
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <div className="rounded-xl bg-muted px-4 py-3 text-[14px] text-foreground">
        <p className="font-bold">
          {lot.material} · {lot.weightKg.toLocaleString("vi-VN")}kg · hạng {lot.grade}
        </p>
        <p className="text-muted-foreground">
          {formatPrice(lot.pricePerKg)}/kg, khoảng {formatPrice(lotValue(lot))} cả lô · {lot.warehouse}
        </p>
      </div>
      <div>
        <label htmlFor="reserve-pickup" className="mb-1.5 block text-[14px] font-semibold text-foreground">
          Giờ tới lấy hàng
        </label>
        <input id="reserve-pickup" type="datetime-local" value={pickup} onChange={(e) => { setPickup(e.target.value); setError(""); }} className={inputClass(error)} />
      </div>
      <div>
        <label htmlFor="reserve-note" className="mb-1.5 block text-[14px] font-semibold text-foreground">
          Ghi chú cho kho <span className="font-normal text-muted-foreground">(không bắt buộc)</span>
        </label>
        <input id="reserve-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="VD: xe 2,5 tấn, cần xe nâng" className={inputClass()} />
      </div>
      <FieldError msg={error} />
      <button type="submit" className={cn(buttonClass.primary, "mt-1")}>
        Giữ lô {HOLD_HOURS} giờ
      </button>
    </form>
  );
}
