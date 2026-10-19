"use client";

import { useState } from "react";
import { GcModal } from "@/components/greencity/GcModal";
import { SubmitButton } from "@/components/greencity/SubmitButton";
import { ChoiceChip, FieldError, inputClass } from "@/components/greencity/ui";
import { PhotoPicker } from "@/features/_shared/PhotoPicker";
import { useApp } from "@/store/app-store";
import { useToast } from "@/store/hooks";
import { useBins } from "@/store/use-bins";
import { BIN_MATERIALS, BIN_TYPE_LABEL, WEIGHT_BANDS } from "@/data/bins";
import { POINT_RULES } from "@/data/point-rules";
import { dropoffPoints } from "@/lib/bins";
import { cn } from "@/lib/utils";

/** Ghi nhận một lần bỏ đồ vào thùng: mã thùng → loại đồ → khối lượng → (ảnh). */
export function DropoffModal({ open, onClose, initialBinId }: { open: boolean; onClose: () => void; initialBinId?: string }) {
  return (
    <GcModal open={open} onClose={onClose} title="Ghi nhận lần bỏ đồ" description="Cộng tác viên kiểm tra thùng xong, điểm sẽ vào tài khoản của bạn.">
      {/* key: mở lại thì form bắt đầu từ đầu, đúng thùng vừa bấm */}
      {open && <DropoffForm key={initialBinId ?? "trong"} initialBinId={initialBinId} onDone={onClose} />}
    </GcModal>
  );
}

function DropoffForm({ initialBinId, onDone }: { initialBinId?: string; onDone: () => void }) {
  const { state } = useApp();
  const { bins, recordDropoff } = useBins();
  const toast = useToast();
  const [code, setCode] = useState(() => bins.find((b) => b.id === initialBinId)?.code ?? "");
  const [material, setMaterial] = useState("");
  const [kg, setKg] = useState<number | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const bin = bins.find((b) => b.code.toLowerCase() === code.trim().toLowerCase());
  const preview = bin && kg != null
    ? dropoffPoints(bin.type, kg, POINT_RULES, { dropoffs: state.bins.dropoffs, userId: state.user?.email, now: new Date() })
    : null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "idle") return;
    const errs: Record<string, string> = {};
    if (!bin) errs.code = code.trim() ? "Không có thùng nào mang mã này" : "Nhập mã in trên thùng";
    if (!material) errs.material = "Chọn loại đồ";
    if (kg == null) errs.kg = "Chọn khoảng khối lượng";
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      document.getElementById(`dropoff-${first}`)?.focus();
      return;
    }
    setStatus("loading");
    window.setTimeout(() => {
      const d = recordDropoff({ binId: bin!.id, material, estKg: kg!, photos });
      setStatus("success");
      if (d?.capped) toast("info", "Đã ghi nhận", "Hôm nay bạn đã đủ số lượt được tính điểm cho loại thùng này.");
      else toast("success", "Đã ghi nhận", `+${d?.points ?? 0} điểm đang chờ cộng tác viên kiểm tra.`);
      onDone();
    }, 400);
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <div>
        <label htmlFor="dropoff-code" className="mb-1.5 block text-[14px] font-semibold text-foreground">
          Mã in trên thùng
        </label>
        <input
          id="dropoff-code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setMaterial("");
            setErrors((er) => ({ ...er, code: "" }));
          }}
          placeholder="VD: TC-003"
          autoComplete="off"
          aria-invalid={!!errors.code}
          aria-describedby="dropoff-code-hint"
          className={cn(inputClass(errors.code), "font-mono uppercase")}
        />
        {errors.code ? (
          <FieldError msg={errors.code} />
        ) : (
          <p id="dropoff-code-hint" className="mt-1.5 text-[13px] text-muted-foreground" aria-live="polite">
            {bin ? (
              <>
                <strong className="text-foreground">Thùng {BIN_TYPE_LABEL[bin.type].toLowerCase()}</strong> · {bin.name}, {bin.area}
              </>
            ) : (
              "Mã nằm trên nắp thùng, ví dụ TC-003 (tái chế), QA-016 (quần áo), HC-018 (hữu cơ)."
            )}
          </p>
        )}
      </div>

      {bin && (
        <fieldset>
          <legend className="mb-1.5 text-[14px] font-semibold text-foreground">Bạn bỏ gì?</legend>
          <div id="dropoff-material" tabIndex={-1} className="flex flex-wrap gap-2 outline-none">
            {BIN_MATERIALS[bin.type].map((m) => (
              <ChoiceChip key={m} selected={material === m} onClick={() => { setMaterial(m); setErrors((er) => ({ ...er, material: "" })); }}>
                {m}
              </ChoiceChip>
            ))}
          </div>
          <FieldError msg={errors.material} />
        </fieldset>
      )}

      <fieldset>
        <legend className="mb-1.5 text-[14px] font-semibold text-foreground">Khoảng bao nhiêu?</legend>
        <div id="dropoff-kg" tabIndex={-1} className="flex flex-wrap gap-2 outline-none">
          {WEIGHT_BANDS.map((w) => (
            <ChoiceChip key={w.label} selected={kg === w.kg} onClick={() => { setKg(w.kg); setErrors((er) => ({ ...er, kg: "" })); }}>
              {w.label}
            </ChoiceChip>
          ))}
        </div>
        <FieldError msg={errors.kg} />
      </fieldset>

      <div>
        <p className="mb-1.5 text-[14px] font-semibold text-foreground">
          Ảnh <span className="font-normal text-muted-foreground">(không bắt buộc, giúp kiểm tra nhanh hơn)</span>
        </p>
        <PhotoPicker id="dropoff-photos" photos={photos} onChange={setPhotos} max={2} />
      </div>

      {preview && (
        <p className={cn("rounded-xl px-4 py-3 text-[14px]", preview.capped ? "bg-muted text-muted-foreground" : "bg-accent text-accent-foreground")} aria-live="polite">
          {preview.capped
            ? `Hôm nay bạn đã đủ ${preview.rule?.dailyCap} lượt được tính điểm cho thùng ${BIN_TYPE_LABEL[bin!.type].toLowerCase()}. Lượt này vẫn được ghi nhận nhưng không cộng điểm.`
            : `Dự kiến +${preview.points} điểm, cộng khi cộng tác viên xác nhận đúng loại.`}
        </p>
      )}

      <SubmitButton status={status} loadingText="Đang ghi nhận…" successText="Đã ghi nhận">
        Ghi nhận
      </SubmitButton>
    </form>
  );
}
