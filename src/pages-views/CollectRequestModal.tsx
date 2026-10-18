"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, PackageCheck, Truck, AlertCircle } from "lucide-react";
import { GcModal } from "@/components/greencity/GcModal";
import { SubmitButton } from "@/components/greencity/SubmitButton";
import { useApp } from "@/store/app-store";
import { AREAS, MATERIAL_OPTIONS, TIME_OPTIONS, type CollectionRequest } from "@/types";
import { cn } from "@/lib/utils";

interface CollectRequestModalProps {
  open: boolean;
  onClose: () => void;
  /** Đặt true khi dùng ở landing (người dùng chưa đăng nhập). */
  embedded?: boolean;
}

export function CollectRequestModal({ open, onClose, embedded = false }: CollectRequestModalProps) {
  const { addRequest, toast, state } = useApp();
  const [materials, setMaterials] = useState<string[]>([]);
  const [quantity, setQuantity] = useState("");
  const [area, setArea] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const reset = () => {
    setMaterials([]);
    setQuantity("");
    setArea("");
    setTime("");
    setNote("");
    setErrors({});
    setStatus("idle");
  };

  const close = () => {
    onClose();
    window.setTimeout(reset, 350);
  };

  const toggleMaterial = (m: string) => {
    setMaterials((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
    setErrors((e) => ({ ...e, materials: "" }));
  };

  const submit = () => {
    const errs: Record<string, string> = {};
    if (materials.length === 0) errs.materials = "Vui lòng chọn ít nhất một loại vật liệu";
    if (!quantity.trim()) errs.quantity = "Vui lòng ước tính khối lượng hoặc số lượng";
    if (!area) errs.area = "Vui lòng chọn khu vực";
    if (!time) errs.time = "Vui lòng chọn thời gian mong muốn";
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
      toast(
        "success",
        "Đã gửi yêu cầu thu gom (demo)",
        "Người thu gom trong khu vực sẽ nhận được thông tin."
      );
      window.setTimeout(() => {
        close();
      }, 1600);
    }, 900);
  };

  const inputCls = (err?: string) =>
    cn(
      "h-12 w-full rounded-xl border-[1.5px] bg-white px-4 text-[14px] font-medium outline-none transition-all duration-200",
      err ? "border-destructive" : "border-[#dce7dc] hover:border-[#a8c9ae] focus:border-primary focus:shadow-[0_0_0_3px_rgba(36,139,82,0.14)]"
    );

  return (
    <GcModal
      open={open}
      onClose={close}
      title={status === "success" ? "Yêu cầu đã được ghi nhận" : "Tạo yêu cầu thu gom"}
      description={
        status === "success"
          ? undefined
          : "Mô tả nhanh về vật liệu — hệ thống demo sẽ ghép bạn với người thu gom gần nhất."
      }
      size="md"
    >
      {status === "success" ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-4 py-8 text-center"
        >
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-accent">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white"
            >
              <Check className="h-7 w-7" strokeWidth={2.5} />
            </motion.span>
          </span>
          <h3 className="text-[20px] font-bold text-forest">Cảm ơn bạn đã hành động xanh!</h3>
          <p className="max-w-sm text-[14px] leading-relaxed text-muted-foreground">
            Yêu cầu thu gom <strong>{materials.join(", ")}</strong> tại <strong>{area}</strong> đã
            được đưa vào danh sách chờ của phiên demo
            {embedded && !state.user ? " — đăng nhập để theo dõi lịch sử đầy đủ" : ""}.
          </p>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-5">
          <div>
            <p className="mb-2.5 text-[13px] font-bold text-forest">
              Loại vật liệu <span className="text-destructive">*</span>
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
            {errors.materials && (
              <p className="mt-2 flex items-center gap-1.5 text-[12.5px] font-medium text-destructive">
                <AlertCircle className="h-3.5 w-3.5" /> {errors.materials}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="cr-quantity" className="mb-2 block text-[13px] font-bold text-forest">
                Khối lượng / số lượng <span className="text-destructive">*</span>
              </label>
              <input
                id="cr-quantity"
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value);
                  setErrors((er) => ({ ...er, quantity: "" }));
                }}
                placeholder="VD: khoảng 25kg giấy"
                className={inputCls(errors.quantity)}
              />
              {errors.quantity && (
                <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] font-medium text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" /> {errors.quantity}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="cr-area" className="mb-2 block text-[13px] font-bold text-forest">
                Khu vực <span className="text-destructive">*</span>
              </label>
              <select
                id="cr-area"
                value={area}
                onChange={(e) => {
                  setArea(e.target.value);
                  setErrors((er) => ({ ...er, area: "" }));
                }}
                className={cn(inputCls(errors.area), "cursor-pointer appearance-none")}
              >
                <option value="">Chọn quận / khu vực</option>
                {AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              {errors.area && (
                <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] font-medium text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" /> {errors.area}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="cr-time" className="mb-2 block text-[13px] font-bold text-forest">
              Thời gian mong muốn <span className="text-destructive">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {TIME_OPTIONS.map((t) => {
                const active = time === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setTime(t);
                      setErrors((er) => ({ ...er, time: "" }));
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
            {errors.time && (
              <p className="mt-2 flex items-center gap-1.5 text-[12.5px] font-medium text-destructive">
                <AlertCircle className="h-3.5 w-3.5" /> {errors.time}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="cr-note" className="mb-2 block text-[13px] font-bold text-forest">
              Ghi chú thêm
            </label>
            <textarea
              id="cr-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="VD: nhà có thang máy, đồ ở tầng 3, gọi trước 15 phút..."
              className="w-full resize-none rounded-xl border-[1.5px] border-[#dce7dc] bg-white px-4 py-3 text-[14px] font-medium outline-none transition-all duration-200 placeholder:text-muted-foreground/60 hover:border-[#a8c9ae] focus:border-primary focus:shadow-[0_0_0_3px_rgba(36,139,82,0.14)]"
            />
          </div>

          <SubmitButton status={status} onClick={submit} loadingText="Đang gửi yêu cầu...">
            <span className="flex items-center gap-2">
              <Truck className="h-[18px] w-[18px]" strokeWidth={2.2} />
              Gửi yêu cầu thu gom
            </span>
          </SubmitButton>

          <p className="flex items-center justify-center gap-1.5 text-center text-[12px] text-muted-foreground">
            <PackageCheck className="h-3.5 w-3.5 text-primary/70" />
            Yêu cầu demo — không có dịch vụ thật được kích hoạt.
          </p>
        </div>
      )}
    </GcModal>
  );
}
