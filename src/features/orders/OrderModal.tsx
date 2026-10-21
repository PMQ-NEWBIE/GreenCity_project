"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/store/app-store";
import { useOrders } from "@/store/use-orders";
import { useLinks } from "@/store/use-links";
import { GcModal } from "@/components/greencity/GcModal";
import { ChoiceChip, FieldError, buttonClass, inputClass } from "@/components/greencity/ui";
import { TIME_OPTIONS, type Product } from "@/types";
import { formatPrice } from "@/utils/format";
import { cn } from "@/lib/utils";

const QTY_HINT: Record<Product["unit"], string> = {
  kg: "Ví dụ: khoảng 15 kg",
  chai: "Ví dụ: 50 chai",
  "món": "Ví dụ: 1 món",
  "lô": "Ví dụ: cả lô",
};

/** Người mua đặt một tin: bao nhiêu, khi nào tới lấy, ghi chú. Người bán nhận hoặc từ chối ở mục "Đơn khách đặt mua". */
export function OrderModal({ product, open, onClose }: { product: Product; open: boolean; onClose: () => void }) {
  const { toast } = useApp();
  const { place } = useOrders();
  const router = useRouter();
  const links = useLinks();
  const [quantity, setQuantity] = useState("");
  const [meetTime, setMeetTime] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<{ quantity?: string; meetTime?: string }>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!quantity.trim()) errs.quantity = "Ghi số lượng bạn muốn mua";
    if (!meetTime) errs.meetTime = "Chọn khung giờ tới lấy";
    setErrors(errs);
    if (errs.quantity) return document.getElementById("order-qty")?.focus();
    if (errs.meetTime) return;
    const order = place(product, { quantity, meetTime, note });
    if (!order) return toast("error", "Không đặt được", "Tin có thể vừa được bán. Tải lại trang để xem.");
    onClose();
    toast("success", "Đã gửi đơn", `Chờ ${product.seller.name} xác nhận.`);
    router.push(links.order(order.id));
  };

  return (
    <GcModal open={open} onClose={onClose} title="Đặt mua" description={`${product.name} · ${formatPrice(product.price, product.unit)}`}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        <div>
          <label htmlFor="order-qty" className="mb-1.5 block text-[14px] font-semibold">
            Bạn muốn mua bao nhiêu?
          </label>
          <input
            id="order-qty"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder={QTY_HINT[product.unit]}
            aria-invalid={!!errors.quantity}
            aria-describedby={errors.quantity ? "order-qty-err" : undefined}
            className={inputClass(errors.quantity)}
          />
          <FieldError id="order-qty-err" msg={errors.quantity} />
        </div>

        <fieldset>
          <legend className="mb-2 text-[14px] font-semibold">Khi nào bạn tới lấy?</legend>
          <div className="flex flex-wrap gap-2">
            {TIME_OPTIONS.map((t) => (
              <ChoiceChip key={t} selected={meetTime === t} onClick={() => setMeetTime(t)}>
                {t}
              </ChoiceChip>
            ))}
          </div>
          <FieldError msg={errors.meetTime} />
        </fieldset>

        <div>
          <label htmlFor="order-note" className="mb-1.5 block text-[14px] font-semibold">
            Ghi chú cho người bán <span className="font-normal text-muted-foreground">(không bắt buộc)</span>
          </label>
          <textarea
            id="order-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            maxLength={300}
            placeholder="Ví dụ: tôi mang cân theo, đi xe ba gác"
            className={cn(inputClass(), "h-auto py-3")}
          />
        </div>

        <p className="text-[13px] text-muted-foreground">Chưa phải trả tiền. Hai bên gặp nhau, cân lại rồi mới thanh toán.</p>
        <button type="submit" className={buttonClass.primary}>
          Gửi đơn cho người bán
        </button>
      </form>
    </GcModal>
  );
}
