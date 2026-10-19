"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { useCollect, useToast } from "@/store/hooks";
import { SubmitButton } from "@/components/greencity/SubmitButton";
import { ChoiceChip, FieldError, PageContainer, PageIntro, StepHeading, inputClass } from "@/components/greencity/ui";
import { PhotoPicker } from "@/features/_shared/PhotoPicker";
import { RequestItem } from "@/features/collect/RequestItem";
import { ruleById } from "@/data/point-rules";
import { ROUTES } from "@/lib/routes";
import { AREAS, MATERIAL_OPTIONS, TIME_OPTIONS, type Area } from "@/types";
import { cn } from "@/lib/utils";

export function CollectView() {
  const { mine, create } = useCollect();
  const toast = useToast();
  const router = useRouter();
  const [materials, setMaterials] = useState<string[]>([]);
  const [presorted, setPresorted] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [area, setArea] = useState<Area | "">("");
  const [address, setAddress] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const perKg = ruleById("pickup-kg");
  const sortedBonus = ruleById("pickup-sorted");
  const clearError = (key: string) => setErrors((er) => (er[key] ? { ...er, [key]: "" } : er));

  const toggleMaterial = (m: string) => {
    setMaterials((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
    clearError("materials");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "idle") return;
    const errs: Record<string, string> = {};
    if (materials.length === 0) errs.materials = "Chọn ít nhất một loại";
    if (!quantity.trim()) errs.quantity = "Ước chừng là được, ví dụ: 2 bao, 15kg";
    if (!area) errs.area = "Chọn khu vực";
    if (address.trim().length < 5) errs.address = "Ghi tên đường và phường để đội tìm đường";
    if (!time) errs.time = "Chọn khung giờ bạn có nhà";
    setErrors(errs);
    const firstError = Object.keys(errs)[0];
    if (firstError) {
      document.getElementById(`collect-${firstError}`)?.focus();
      return;
    }

    setStatus("loading");
    window.setTimeout(() => {
      const request = create({
        materials,
        presorted,
        quantity: quantity.trim(),
        photos,
        area: area as Area,
        address: address.trim(),
        time,
        note: note.trim(),
      });
      setStatus("success");
      toast("success", "Đã gửi yêu cầu", "Đội thu gom gần bạn sẽ nhận đơn và hẹn giờ.");
      router.push(ROUTES.collectRequest(request.id));
    }, 500);
  };

  return (
    <PageContainer>
      <PageIntro title="Gọi thu gom tận nhà">
        Cho chúng tôi biết bạn cần dọn gì và lúc nào có nhà. Đội thu gom gần nhất sẽ nhận đơn, tới cân tại chỗ và trả
        tiền cho bạn.
      </PageIntro>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <form onSubmit={submit} noValidate className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <fieldset>
            <legend className="w-full">
              <StepHeading step={1} title="Bạn cần dọn những gì?" hint="Chọn được nhiều loại." />
            </legend>
            <div id="collect-materials" tabIndex={-1} className="mt-4 flex flex-wrap gap-2 outline-none">
              {MATERIAL_OPTIONS.map((m) => (
                <ChoiceChip key={m} selected={materials.includes(m)} onClick={() => toggleMaterial(m)}>
                  {m}
                </ChoiceChip>
              ))}
            </div>
            <FieldError msg={errors.materials} />
            <label
              className={cn(
                "mt-4 flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                presorted ? "border-primary bg-accent" : "border-border hover:border-primary/40"
              )}
            >
              <input
                type="checkbox"
                checked={presorted}
                onChange={(e) => setPresorted(e.target.checked)}
                className="mt-0.5 h-5 w-5 accent-primary"
              />
              <span>
                <span className="block text-[15px] font-bold text-foreground">Tôi đã phân loại sẵn</span>
                <span className="block text-[13px] text-muted-foreground">
                  Giấy, nhựa, kim loại để riêng từng túi. Được cộng thêm {sortedBonus.points} điểm khi đội thu gom xác nhận.
                </span>
              </span>
            </label>
          </fieldset>

          <div>
            <StepHeading step={2} title="Khoảng bao nhiêu?" hint="Ảnh không bắt buộc, nhưng giúp đội mang đúng xe." />
            <label htmlFor="collect-quantity" className="sr-only">
              Khối lượng hoặc số lượng ước tính
            </label>
            <input
              id="collect-quantity"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                clearError("quantity");
              }}
              placeholder="VD: 2 bao giấy, khoảng 15kg"
              aria-invalid={!!errors.quantity}
              aria-describedby={errors.quantity ? "collect-quantity-err" : undefined}
              className={cn(inputClass(errors.quantity), "mt-4")}
            />
            <FieldError id="collect-quantity-err" msg={errors.quantity} />
            <div className="mt-4">
              <PhotoPicker id="collect-photos" photos={photos} onChange={setPhotos} />
            </div>
          </div>

          <fieldset>
            <legend className="w-full">
              <StepHeading step={3} title="Ở đâu, lúc nào?" />
            </legend>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="collect-area" className="mb-1.5 block text-[14px] font-semibold text-foreground">
                  Khu vực
                </label>
                <select
                  id="collect-area"
                  value={area}
                  onChange={(e) => {
                    setArea(e.target.value as Area);
                    clearError("area");
                  }}
                  aria-invalid={!!errors.area}
                  className={cn(inputClass(errors.area), "select-chevron cursor-pointer appearance-none")}
                >
                  <option value="">Chọn quận…</option>
                  {AREAS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
                <FieldError msg={errors.area} />
              </div>
              <div>
                <label htmlFor="collect-address" className="mb-1.5 block text-[14px] font-semibold text-foreground">
                  Đường, phường
                </label>
                <input
                  id="collect-address"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    clearError("address");
                  }}
                  placeholder="VD: Đường Nơ Trang Long, Phường 13"
                  aria-invalid={!!errors.address}
                  aria-describedby="collect-address-hint"
                  className={inputClass(errors.address)}
                />
                {errors.address ? (
                  <FieldError msg={errors.address} />
                ) : (
                  <p id="collect-address-hint" className="mt-1.5 text-[13px] text-muted-foreground">
                    Bản demo không cần số nhà.
                  </p>
                )}
              </div>
            </div>
            <p className="mb-1.5 mt-4 text-[14px] font-semibold text-foreground">Giờ bạn có nhà</p>
            <div id="collect-time" tabIndex={-1} className="flex flex-wrap gap-2 outline-none">
              {TIME_OPTIONS.map((t) => (
                <ChoiceChip
                  key={t}
                  selected={time === t}
                  onClick={() => {
                    setTime(t);
                    clearError("time");
                  }}
                >
                  {t}
                </ChoiceChip>
              ))}
            </div>
            <FieldError msg={errors.time} />
          </fieldset>

          <div>
            <StepHeading step={4} title="Ghi chú cho đội thu gom" hint="Không bắt buộc." />
            <label htmlFor="collect-note" className="sr-only">
              Ghi chú
            </label>
            <textarea
              id="collect-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: nhà có thang máy, đồ để ở tầng 3, gọi trước 15 phút…"
              className={cn(inputClass(), "mt-4 h-auto resize-none py-3")}
            />
          </div>

          <SubmitButton status={status} loadingText="Đang gửi…" successText="Đã gửi yêu cầu">
            <Send className="h-[18px] w-[18px]" aria-hidden="true" />
            Gửi yêu cầu thu gom
          </SubmitButton>
        </form>

        <div className="flex flex-col gap-6">
          <section aria-labelledby="my-requests">
            <h3 id="my-requests" className="text-[18px] font-bold text-foreground">
              Yêu cầu của bạn
            </h3>
            {mine.length === 0 ? (
              <p className="mt-3 rounded-2xl border border-dashed border-border p-5 text-[14px] text-muted-foreground">
                Bạn chưa gửi yêu cầu nào. Yêu cầu sau khi gửi sẽ hiện ở đây, bấm vào để theo dõi từng bước.
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-3">
                {mine.map((r) => (
                  <RequestItem key={r.id} request={r} />
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="how-collect" className="rounded-2xl bg-accent p-5">
            <h3 id="how-collect" className="text-[16px] font-bold text-foreground">
              Sau khi gửi sẽ thế nào?
            </h3>
            <ol className="mt-3 flex flex-col gap-2.5 text-[14px] leading-relaxed text-foreground/85">
              <li>
                <strong>1.</strong> Đội thu gom phụ trách khu của bạn nhận đơn và hẹn giờ.
              </li>
              <li>
                <strong>2.</strong> Tới nơi, đội cân từng loại ngay trước mặt bạn.
              </li>
              <li>
                <strong>3.</strong> Bạn nhận tiền mặt, chuyển khoản, hoặc quy ra điểm thưởng.
              </li>
              <li>
                <strong>4.</strong> Mỗi kg được cộng {perKg.points} điểm, đổi được phân bón, túi vải và quà xanh khác.
              </li>
            </ol>
          </section>
        </div>
      </div>
    </PageContainer>
  );
}
