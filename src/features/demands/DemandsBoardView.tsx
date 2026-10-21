"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";
import { useDemands } from "@/store/use-demands";
import { useToast } from "@/store/hooks";
import { EmptyState } from "@/components/greencity/EmptyState";
import { GcModal } from "@/components/greencity/GcModal";
import { FieldError, PageContainer, PageIntro, buttonClass, inputClass } from "@/components/greencity/ui";
import type { PurchaseDemand } from "@/types/features";
import { formatPrice } from "@/utils/format";
import { cn } from "@/lib/utils";
import { DemandCard, OFFER_STATUS_BADGE, OFFER_STATUS_LABEL } from "./DemandCard";

/** Vựa và điểm thu gom: xem doanh nghiệp đang cần mua gì, chào hàng từ chỗ đã gom. */
export function DemandsBoardView() {
  const { open, myOffers } = useDemands();
  const [offering, setOffering] = useState<PurchaseDemand | null>(null);

  return (
    <PageContainer>
      <PageIntro title="Doanh nghiệp cần mua">
        Cơ sở làm phân hữu cơ, xưởng tái chế nhựa, giấy… đăng nhu cầu ở đây. Có hàng sẵn thì chào số lượng và giá của bạn, doanh nghiệp nhận là hẹn xe tới lấy.
      </PageIntro>

      {open.length === 0 ? (
        <EmptyState className="mt-6" icon={Building2} title="Chưa có nhu cầu nào" description="Khi doanh nghiệp đăng cần mua, nhu cầu sẽ hiện ở đây." />
      ) : (
        <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {open.map((d) => {
            const mine = myOffers.filter((m) => m.demand.id === d.id).map((m) => m.offer);
            return (
              <DemandCard key={d.id} demand={d}>
                {mine.length > 0 && (
                  <ul className="mb-3 flex flex-col gap-1.5">
                    {mine.map((o) => (
                      <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/60 px-3 py-2 text-[13px]">
                        <span>
                          Bạn chào {o.kg.toLocaleString("vi-VN")}kg · {formatPrice(o.pricePerKg)}/kg
                        </span>
                        <span className={cn("rounded-full px-2 py-0.5 text-[11.5px] font-bold", OFFER_STATUS_BADGE[o.status])}>{OFFER_STATUS_LABEL[o.status]}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <button type="button" onClick={() => setOffering(d)} className={cn(buttonClass.primary, "w-full")}>
                  {mine.length > 0 ? "Chào thêm" : "Chào hàng"}
                </button>
              </DemandCard>
            );
          })}
        </ul>
      )}

      <OfferModal demand={offering} onClose={() => setOffering(null)} />
    </PageContainer>
  );
}

function OfferModal({ demand: d, onClose }: { demand: PurchaseDemand | null; onClose: () => void }) {
  const { offer } = useDemands();
  const toast = useToast();
  const [kg, setKg] = useState("");
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const num = (v: string) => Number(v.replace(/\./g, "").replace(",", "."));

  const close = () => {
    setKg("");
    setPrice("");
    setNote("");
    setError("");
    onClose();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!d) return;
    const k = num(kg);
    const p = price ? num(price) : d.pricePerKg;
    if (!(k >= 10)) return setError("Chào ít nhất 10kg");
    if (!(p > 0)) return setError("Ghi giá mỗi kg");
    if (!offer(d.id, { kg: k, pricePerKg: p, note })) return setError("Nhu cầu này vừa đóng, không chào được nữa");
    toast("success", "Đã gửi chào hàng", `${d.businessName} · ${k.toLocaleString("vi-VN")}kg ${d.material.toLowerCase()}`);
    close();
  };

  return (
    <GcModal open={!!d} onClose={close} title="Chào hàng" description={d ? `${d.businessName} cần ${d.kg.toLocaleString("vi-VN")}kg ${d.material.toLowerCase()}, trả ${formatPrice(d.pricePerKg)}/kg` : undefined}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="offer-kg" className="mb-1.5 block text-[14px] font-semibold">
              Bạn có bao nhiêu kg?
            </label>
            <input id="offer-kg" inputMode="decimal" value={kg} onChange={(e) => setKg(e.target.value.replace(/[^0-9.,]/g, ""))} className={inputClass()} />
          </div>
          <div>
            <label htmlFor="offer-price" className="mb-1.5 block text-[14px] font-semibold">
              Giá chào (đồng/kg)
            </label>
            <input
              id="offer-price"
              inputMode="decimal"
              value={price}
              placeholder={d ? String(d.pricePerKg) : ""}
              onChange={(e) => setPrice(e.target.value.replace(/[^0-9.,]/g, ""))}
              className={inputClass()}
            />
          </div>
        </div>
        <div>
          <label htmlFor="offer-note" className="mb-1.5 block text-[14px] font-semibold">
            Ghi chú <span className="font-normal text-muted-foreground">(không bắt buộc)</span>
          </label>
          <textarea
            id="offer-note"
            rows={3}
            maxLength={300}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ví dụ: hàng ở kho Gò Vấp, đã phân loại, giao được sáng thứ Hai"
            className={cn(inputClass(), "h-auto py-3")}
          />
        </div>
        <FieldError msg={error} />
        <p className="text-[13px] text-muted-foreground">Bỏ trống giá thì chào đúng giá doanh nghiệp đưa ra.</p>
        <button type="submit" className={buttonClass.primary}>
          Gửi chào hàng
        </button>
      </form>
    </GcModal>
  );
}
