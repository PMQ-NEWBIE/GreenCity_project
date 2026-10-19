"use client";

import { useState } from "react";
import { CheckCircle2, Clock, MapPin, PackageCheck, Send, Weight } from "lucide-react";
import { useApp } from "@/store/app-store";
import { SubmitButton } from "@/components/greencity/SubmitButton";
import { ChoiceChip, FieldError, PageContainer, PageIntro, StepHeading, inputClass } from "@/components/greencity/ui";
import { AREAS, MATERIAL_OPTIONS, TIME_OPTIONS, type CollectionRequest, type RequestStatus } from "@/types";
import { formatHoursAgo } from "@/utils/format";
import { cn } from "@/lib/utils";

export const REQUEST_STATUS: Record<RequestStatus, { label: string; cls: string; icon: typeof Clock }> = {
  pending: { label: "Đang tìm người thu gom", cls: "bg-amber-500/15 text-warn", icon: Clock },
  matched: { label: "Đã có người nhận", cls: "bg-accent text-primary", icon: CheckCircle2 },
  done: { label: "Đã thu gom xong", cls: "bg-muted text-muted-foreground", icon: PackageCheck },
};

export function CollectView() {
  const { addRequest, toast, state } = useApp();
  const [materials, setMaterials] = useState<string[]>([]);
  const [quantity, setQuantity] = useState("");
  const [area, setArea] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const mine = state.requests.filter((r) => r.isMine);
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
    if (!time) errs.time = "Chọn khung giờ bạn có nhà";
    setErrors(errs);
    const firstError = Object.keys(errs)[0];
    if (firstError) {
      document.getElementById(`collect-${firstError}`)?.focus();
      return;
    }

    setStatus("loading");
    window.setTimeout(() => {
      const request: CollectionRequest = {
        id: `r-${Date.now()}`,
        materials,
        quantity: quantity.trim(),
        area,
        time,
        note: note.trim(),
        hoursAgo: 0,
        status: "pending",
        isMine: true,
      };
      addRequest(request);
      setStatus("success");
      toast("success", "Đã gửi yêu cầu", "Người thu gom gần bạn sẽ liên hệ để hẹn giờ.");
      window.setTimeout(() => {
        setMaterials([]);
        setQuantity("");
        setArea("");
        setTime("");
        setNote("");
        setStatus("idle");
      }, 1200);
    }, 500);
  };

  return (
    <PageContainer>
      <PageIntro title="Gọi thu gom tận nhà">
        Cho chúng tôi biết bạn cần dọn gì và lúc nào có nhà. Người thu gom gần nhất sẽ nhận yêu cầu và gọi lại hẹn giờ.
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
          </fieldset>

          <div>
            <StepHeading step={2} title="Khoảng bao nhiêu?" />
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
          </div>

          <fieldset>
            <legend className="w-full">
              <StepHeading step={3} title="Ở đâu, lúc nào?" />
            </legend>
            <label htmlFor="collect-area" className="mb-1.5 mt-4 block text-[14px] font-semibold text-foreground">
              Khu vực
            </label>
            <select
              id="collect-area"
              value={area}
              onChange={(e) => {
                setArea(e.target.value);
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
            <StepHeading step={4} title="Ghi chú cho người thu gom" hint="Không bắt buộc." />
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
                Bạn chưa gửi yêu cầu nào. Yêu cầu sau khi gửi sẽ hiện ở đây cùng trạng thái.
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
                <strong>1.</strong> Người thu gom ở gần bạn nhận được yêu cầu.
              </li>
              <li>
                <strong>2.</strong> Họ gọi lại để hẹn giờ và báo giá sơ bộ.
              </li>
              <li>
                <strong>3.</strong> Tới nơi, cân đo tại chỗ và trả tiền cho bạn (nếu đồ có giá trị).
              </li>
            </ol>
          </section>
        </div>
      </div>
    </PageContainer>
  );
}

export function RequestItem({ request: r }: { request: CollectionRequest }) {
  const st = REQUEST_STATUS[r.status];
  return (
    <li className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[15px] font-bold text-foreground">{r.materials.join(", ")}</p>
        <span className={cn("flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-bold", st.cls)}>
          <st.icon className="h-3.5 w-3.5" aria-hidden="true" />
          {st.label}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Weight className="h-3.5 w-3.5" aria-hidden="true" />
          {r.quantity}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          {r.area}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {r.time}
        </span>
      </div>
      {r.note && <p className="mt-2 text-[13px] text-muted-foreground">“{r.note}”</p>}
      <p className="mt-2 text-[12px] text-muted-foreground">Gửi {formatHoursAgo(r.hoursAgo).toLowerCase()}</p>
    </li>
  );
}
