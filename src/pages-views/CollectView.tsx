"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  MapPin,
  PackageCheck,
  Send,
  Truck,
  Weight,
} from "lucide-react";
import { useApp } from "@/store/app-store";
import { IMAGES } from "@/data/mock-data";
import { SmartImage } from "@/components/greencity/SmartImage";
import { SubmitButton } from "@/components/greencity/SubmitButton";
import { Reveal } from "@/components/greencity/Reveal";
import { AREAS, MATERIAL_OPTIONS, TIME_OPTIONS, type CollectionRequest } from "@/types";
import { formatHoursAgo } from "@/utils/format";
import { cn } from "@/lib/utils";

const REQUEST_STATUS: Record<string, { label: string; cls: string; icon: typeof Clock }> = {
  pending: { label: "Đang chờ ghép", cls: "bg-[#fdf3e3] text-warn", icon: Clock },
  matched: { label: "Đã ghép người thu gom", cls: "bg-accent text-primary", icon: CheckCircle2 },
  done: { label: "Hoàn tất thu gom", cls: "bg-[#eef4ee] text-muted-foreground", icon: PackageCheck },
};

const inputCls = (err?: string) =>
  cn(
    "h-12 w-full rounded-xl border-[1.5px] bg-white px-4 text-[14px] font-medium outline-none transition-all duration-200 placeholder:text-muted-foreground/60",
    err
      ? "border-destructive"
      : "border-[#dce7dc] hover:border-[#a8c9ae] focus:border-primary focus:shadow-[0_0_0_3px_rgba(36,139,82,0.14)]"
  );

export function CollectView() {
  const { addRequest, toast, state } = useApp();

  const [materials, setMaterials] = useState<string[]>([]);
  const [quantity, setQuantity] = useState("");
  const [area, setArea] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const toggleMaterial = (m: string) => {
    setMaterials((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
    setErrors((e) => ({ ...e, materials: "" }));
  };

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (status !== "idle") return;
    const errs: Record<string, string> = {};
    if (materials.length === 0) errs.materials = "Chọn ít nhất một loại vật liệu";
    if (!quantity.trim()) errs.quantity = "Nhập khối lượng / số lượng ước tính";
    if (!area) errs.area = "Chọn khu vực thu gom";
    if (!time) errs.time = "Chọn khung giờ mong muốn";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

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
      toast("success", "Đã gửi yêu cầu thu gom!", "Người thu gom gần khu vực sẽ nhận thông tin (demo).");
      window.setTimeout(() => {
        setMaterials([]);
        setQuantity("");
        setArea("");
        setTime("");
        setNote("");
        setStatus("idle");
      }, 1800);
    }, 1000);
  };

  return (
    <div className="nice-scroll h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          {/* Cột trái: form */}
          <div>
            <Reveal>
              <h2 className="text-[24px] font-extrabold tracking-tight text-forest">
                Gửi yêu cầu thu gom
              </h2>
              <p className="mt-1.5 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
                Người có đồ cần thanh lý, rác tái chế hoặc đồ cũ cồng kềnh — gửi một yêu cầu, cộng
                đồng thu gom của Green City sẽ nhận và ghép nhanh (mô phỏng).
              </p>
            </Reveal>

            <Reveal delay={0.08}>
              <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-5 rounded-3xl border border-border/70 bg-white p-6">
                <div>
                  <p className="mb-2.5 text-[13px] font-bold text-forest">
                    Loại vật liệu cần thu gom <span className="text-destructive">*</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {MATERIAL_OPTIONS.map((m) => {
                      const active = materials.includes(m);
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => toggleMaterial(m)}
                          className={cn(
                            "rounded-full border-[1.5px] px-3.5 py-2 text-[13px] font-semibold transition-all duration-200",
                            active
                              ? "border-primary bg-primary text-white shadow-sm shadow-primary/40"
                              : "border-[#dce7dc] bg-white text-foreground/70 hover:border-primary/50 hover:text-primary"
                          )}
                        >
                          {m}
                        </button>
                      );
                    })}
                  </div>
                  {errors.materials && <FieldError msg={errors.materials} />}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="cv-quantity" className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-forest">
                      <Weight className="h-3.5 w-3.5 text-primary/70" />
                      Khối lượng ước tính <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="cv-quantity"
                      value={quantity}
                      onChange={(e) => {
                        setQuantity(e.target.value);
                        if (errors.quantity) setErrors((er) => ({ ...er, quantity: "" }));
                      }}
                      placeholder="VD: 25kg giấy, 4 món đồ điện"
                      className={inputCls(errors.quantity)}
                    />
                    {errors.quantity && <FieldError msg={errors.quantity} />}
                  </div>
                  <div>
                    <label htmlFor="cv-area" className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-forest">
                      <MapPin className="h-3.5 w-3.5 text-primary/70" />
                      Khu vực <span className="text-destructive">*</span>
                    </label>
                    <select
                      id="cv-area"
                      value={area}
                      onChange={(e) => {
                        setArea(e.target.value);
                        if (errors.area) setErrors((er) => ({ ...er, area: "" }));
                      }}
                      className={cn(inputCls(errors.area), "cursor-pointer")}
                    >
                      <option value="">Chọn quận / khu vực</option>
                      {AREAS.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                    {errors.area && <FieldError msg={errors.area} />}
                  </div>
                </div>

                <div>
                  <p className="mb-2.5 flex items-center gap-1.5 text-[13px] font-bold text-forest">
                    <Clock className="h-3.5 w-3.5 text-primary/70" />
                    Thời gian mong muốn <span className="text-destructive">*</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {TIME_OPTIONS.map((t) => {
                      const active = time === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            setTime(t);
                            if (errors.time) setErrors((er) => ({ ...er, time: "" }));
                          }}
                          className={cn(
                            "rounded-xl border-[1.5px] px-3.5 py-2.5 text-[13px] font-semibold transition-all duration-200",
                            active
                              ? "border-primary bg-primary text-white shadow-sm shadow-primary/40"
                              : "border-[#dce7dc] bg-white text-foreground/70 hover:border-primary/50 hover:text-primary"
                          )}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                  {errors.time && <FieldError msg={errors.time} />}
                </div>

                <div>
                  <label htmlFor="cv-note" className="mb-2 block text-[13px] font-bold text-forest">
                    Ghi chú thêm
                  </label>
                  <textarea
                    id="cv-note"
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="VD: nhà có thang máy, cần gọi trước 15 phút, đồ ở tầng 3..."
                    className="w-full resize-none rounded-xl border-[1.5px] border-[#dce7dc] bg-white px-4 py-3.5 text-[14px] font-medium outline-none transition-all duration-200 placeholder:text-muted-foreground/60 hover:border-[#a8c9ae] focus:border-primary focus:shadow-[0_0_0_3px_rgba(36,139,82,0.14)]"
                  />
                </div>

                <SubmitButton status={status} loadingText="Đang gửi yêu cầu..." successText="Yêu cầu đã được ghi nhận!">
                  <span className="flex items-center gap-2">
                    <Send className="h-[18px] w-[18px]" />
                    Gửi yêu cầu thu gom
                  </span>
                </SubmitButton>
              </form>
            </Reveal>
          </div>

          {/* Cột phải: minh họa + danh sách */}
          <div className="flex flex-col gap-6">
            <Reveal delay={0.1}>
              <div className="relative overflow-hidden rounded-[28px]">
                <SmartImage
                  src={IMAGES.serviceTruckAlt}
                  alt="Xe thu gom rác thải tại đô thị"
                  className="aspect-[16/9] w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/25 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="flex items-center gap-2 text-[16px] font-bold text-white">
                    <Truck className="h-5 w-5 text-mint" />
                    Mạng lưới thu gom demo
                  </p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-mint/85">
                    24 điểm xe chờ sẵn khắp thành phố — trung bình 2,4 giờ từ lúc gửi yêu cầu đến lúc
                    có người nhận (mô phỏng).
                  </p>
                </div>
              </div>
            </Reveal>

            <section>
              <h3 className="text-[18px] font-bold tracking-tight text-forest">
                Yêu cầu trong phiên demo
              </h3>
              <div className="nice-scroll mt-4 flex max-h-[520px] flex-col gap-3 overflow-y-auto pr-1">
                {state.requests.map((r, i) => {
                  const st = REQUEST_STATUS[r.status];
                  return (
                    <Reveal key={r.id} delay={Math.min(i * 0.05, 0.25)}>
                      <div
                        className={cn(
                          "rounded-2xl border bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                          r.isMine ? "border-primary/40 border-l-4" : "border-border/70"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[14.5px] font-bold text-forest">
                              {r.materials.join(" + ")}
                            </p>
                            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[12.5px] text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Weight className="h-3 w-3" />
                                {r.quantity}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {r.area}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {r.time}
                              </span>
                            </div>
                          </div>
                          <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold", st.cls)}>
                            {st.label}
                          </span>
                        </div>
                        {r.note && (
                          <p className="mt-2.5 rounded-xl bg-muted/70 px-3 py-2 text-[12.5px] leading-relaxed text-muted-foreground">
                            “{r.note}”
                          </p>
                        )}
                        <p className="mt-2.5 flex items-center gap-2 text-[11.5px] text-muted-foreground/70">
                          {r.isMine && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 font-bold text-primary">
                              Yêu cầu của bạn
                            </span>
                          )}
                          {formatHoursAgo(r.hoursAgo)}
                        </p>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldError({ msg }: { msg: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: -3 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mt-1.5 flex items-center gap-1.5 pl-1 text-[12.5px] font-medium text-destructive"
    >
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {msg}
    </motion.p>
  );
}
