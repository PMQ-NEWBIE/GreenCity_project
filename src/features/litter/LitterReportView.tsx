"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Crosshair, Loader2, MapPin, Send } from "lucide-react";
import { useToast } from "@/store/hooks";
import { useLitter } from "@/store/use-litter";
import { SmartImage } from "@/components/greencity/SmartImage";
import { SubmitButton } from "@/components/greencity/SubmitButton";
import { ChoiceChip, FieldError, PageContainer, PageIntro, StepHeading, inputClass } from "@/components/greencity/ui";
import { PhotoPicker } from "@/features/_shared/PhotoPicker";
import { LITTER_SIZE, LITTER_STATUS_LABEL } from "@/data/litter";
import { inHcmc, nearestArea } from "@/data/geo";
import { ruleById } from "@/data/point-rules";
import { ROUTES } from "@/lib/routes";
import { AREAS, type Area } from "@/types";
import type { LitterSize } from "@/types/features";
import { formatRelativeTime } from "@/utils/format";
import { cn } from "@/lib/utils";
import { LITTER_BADGE } from "./styles";

type GeoState = "idle" | "loading" | "ok" | "denied" | "far" | "unsupported";

const GEO_MSG: Partial<Record<GeoState, string>> = {
  denied: "Không lấy được vị trí (bạn chưa cho phép hoặc máy tắt định vị). Chọn quận và ghi chỗ ở dưới nhé.",
  far: "Vị trí của bạn nằm ngoài TP.HCM. Chọn quận và ghi chỗ ở dưới nhé.",
  unsupported: "Trình duyệt này không hỗ trợ lấy vị trí. Chọn quận và ghi chỗ ở dưới nhé.",
};

export function LitterReportView() {
  const { mine, submit, duplicateOf } = useLitter();
  const toast = useToast();
  const rule = ruleById("litter-report");
  const [photos, setPhotos] = useState<string[]>([]);
  const [geo, setGeo] = useState<GeoState>("idle");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [area, setArea] = useState<Area | "">("");
  const [address, setAddress] = useState("");
  const [size, setSize] = useState<LitterSize | "">("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dupConfirmed, setDupConfirmed] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const clearError = (k: string) => setErrors((e) => (e[k] ? { ...e, [k]: "" } : e));
  const dup = area ? duplicateOf({ ...coords, area, address }) : null;

  const locate = () => {
    if (!("geolocation" in navigator)) return setGeo("unsupported");
    setGeo("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (!inHcmc(p)) return setGeo("far");
        setCoords(p);
        setArea(nearestArea(p));
        setGeo("ok");
        clearError("area");
      },
      () => setGeo("denied"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const reset = () => {
    setPhotos([]);
    setCoords(null);
    setGeo("idle");
    setArea("");
    setAddress("");
    setSize("");
    setDescription("");
    setDupConfirmed(false);
    setStatus("idle");
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "idle") return;
    const errs: Record<string, string> = {};
    if (photos.length === 0) errs.photos = "Cần ít nhất một ảnh chụp điểm rác";
    if (!area) errs.area = "Chọn quận";
    if (!coords && address.trim().length < 5) errs.address = "Ghi tên đường hoặc chỗ dễ nhận ra";
    if (!size) errs.size = "Chọn quy mô";
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      document.getElementById(`litter-${first}`)?.focus();
      return;
    }
    // Trùng: lần bấm đầu chỉ hiện cảnh báo, bấm lần nữa mới gửi
    if (dup && !dupConfirmed) {
      setDupConfirmed(true);
      return;
    }
    setStatus("loading");
    window.setTimeout(() => {
      const r = submit({ photos, ...coords, area: area as Area, address: address.trim(), size: size as LitterSize, description: description.trim() });
      setStatus("success");
      toast("success", "Đã gửi báo cáo", r.points > 0 ? `+${r.points} điểm khi ban điều hành xác minh.` : "Báo cáo trùng nên không tính điểm, nhưng vẫn giúp đội ưu tiên.");
      window.setTimeout(reset, 900);
    }, 500);
  };

  return (
    <PageContainer>
      <PageIntro title="Báo chỗ đổ rác bừa">
        Thấy rác đổ bừa ở góc đường, chân cầu, bãi đất trống? Chụp ảnh và gửi vị trí. Ban điều hành xác minh, cho người tới
        dọn, và bạn được +{rule.points} điểm.
      </PageIntro>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div>
            <StepHeading step={1} title="Chụp ảnh điểm rác" hint="Chụp rõ đống rác và cảnh xung quanh để dễ tìm." />
            <div className="mt-4">
              <PhotoPicker id="litter-photos" photos={photos} onChange={(p) => { setPhotos(p); clearError("photos"); }} error={errors.photos} />
            </div>
          </div>

          <fieldset>
            <legend className="w-full">
              <StepHeading step={2} title="Ở đâu?" />
            </legend>
            <button
              type="button"
              onClick={locate}
              disabled={geo === "loading"}
              className={cn(
                "mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border px-4 text-[15px] font-semibold transition-colors",
                geo === "ok" ? "border-primary bg-accent text-primary" : "border-border text-foreground hover:border-primary/50 hover:text-primary"
              )}
            >
              {geo === "loading" ? <Loader2 className="h-[18px] w-[18px] animate-spin" aria-hidden="true" /> : <Crosshair className="h-[18px] w-[18px]" aria-hidden="true" />}
              {geo === "ok" ? `Đã lấy vị trí, gần ${area}` : geo === "loading" ? "Đang lấy vị trí…" : "Lấy vị trí hiện tại"}
            </button>
            {GEO_MSG[geo] && (
              <p className="mt-2 text-[13px] text-muted-foreground" role="status">
                {GEO_MSG[geo]}
              </p>
            )}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="litter-area" className="mb-1.5 block text-[14px] font-semibold text-foreground">
                  Quận
                </label>
                <select
                  id="litter-area"
                  value={area}
                  onChange={(e) => { setArea(e.target.value as Area); clearError("area"); setDupConfirmed(false); }}
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
                <label htmlFor="litter-address" className="mb-1.5 block text-[14px] font-semibold text-foreground">
                  Chỗ cụ thể {coords && <span className="font-normal text-muted-foreground">(không bắt buộc)</span>}
                </label>
                <input
                  id="litter-address"
                  value={address}
                  onChange={(e) => { setAddress(e.target.value); clearError("address"); setDupConfirmed(false); }}
                  placeholder="VD: Chân cầu, bờ kênh Nhiêu Lộc"
                  aria-invalid={!!errors.address}
                  className={inputClass(errors.address)}
                />
                <FieldError msg={errors.address} />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="w-full">
              <StepHeading step={3} title="Nhiều cỡ nào?" />
            </legend>
            <div id="litter-size" tabIndex={-1} className="mt-4 grid gap-2 outline-none sm:grid-cols-3">
              {(Object.keys(LITTER_SIZE) as LitterSize[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={size === k}
                  onClick={() => { setSize(k); clearError("size"); }}
                  className={cn(
                    "min-h-11 rounded-xl border p-3 text-left transition-colors",
                    size === k ? "border-primary bg-accent" : "border-border hover:border-primary/40"
                  )}
                >
                  <span className="block text-[15px] font-bold text-foreground">{LITTER_SIZE[k].label}</span>
                  <span className="block text-[13px] text-muted-foreground">{LITTER_SIZE[k].desc}</span>
                </button>
              ))}
            </div>
            <FieldError msg={errors.size} />
          </fieldset>

          <div>
            <StepHeading step={4} title="Mô tả thêm" hint="Không bắt buộc." />
            <label htmlFor="litter-description" className="sr-only">
              Mô tả
            </label>
            <textarea
              id="litter-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: rác xây dựng lẫn rác sinh hoạt, có mùi, đổ ban đêm…"
              className={cn(inputClass(), "mt-4 h-auto resize-none py-3")}
            />
          </div>

          {dup && dupConfirmed && (
            <div className="flex gap-3 rounded-xl border border-warn/40 bg-warn/10 p-4 text-[14px] text-foreground" role="alert">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warn" aria-hidden="true" />
              <p>
                Đã có người báo điểm rác {dup.meters != null ? `cách đây khoảng ${dup.meters}m` : "ở đúng chỗ này"},{" "}
                {formatRelativeTime(dup.report.at).toLowerCase()}. Bạn vẫn gửi được để đội ưu tiên, nhưng báo cáo trùng không
                tính điểm.
              </p>
            </div>
          )}

          <SubmitButton status={status} loadingText="Đang gửi…" successText="Đã gửi">
            <Send className="h-[18px] w-[18px]" aria-hidden="true" />
            {dup && dupConfirmed ? "Vẫn gửi báo cáo" : "Gửi báo cáo"}
          </SubmitButton>
        </form>

        <div className="flex flex-col gap-6">
          <section aria-labelledby="my-litter">
            <h3 id="my-litter" className="text-[18px] font-bold text-foreground">
              Báo cáo của bạn
            </h3>
            {mine.length === 0 ? (
              <p className="mt-3 rounded-2xl border border-dashed border-border p-5 text-[14px] text-muted-foreground">
                Bạn chưa gửi báo cáo nào. Báo cáo sẽ hiện ở đây cùng trạng thái xác minh.
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-3">
                {mine.map((r) => (
                  <li key={r.id} className="flex gap-3 rounded-2xl border border-border bg-card p-3">
                    {r.photos[0] && <SmartImage src={r.photos[0]} alt="" className="h-16 w-16 shrink-0 rounded-xl" sizes="64px" />}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="flex items-center gap-1 text-[14px] font-bold text-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                          <span className="line-clamp-1">{r.address || r.area}</span>
                        </p>
                        <span className={cn("inline-flex shrink-0 rounded-full px-2.5 py-1 text-[12px] font-bold", LITTER_BADGE[r.status])}>
                          {LITTER_STATUS_LABEL[r.status]}
                        </span>
                      </div>
                      <p className="mt-1 text-[13px] text-muted-foreground">
                        {r.area} · {LITTER_SIZE[r.size].label.toLowerCase()} · {formatRelativeTime(r.at).toLowerCase()}
                        {r.rejectReason && <> · {r.rejectReason}</>}
                      </p>
                      <p className={cn("mt-1 text-[13px] font-bold", r.points > 0 && r.status !== "khong-hop-le" ? "text-primary" : "text-muted-foreground")}>
                        {r.duplicateOf ? "Trùng báo cáo khác, không tính điểm" : `+${r.points} điểm`}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="how-litter" className="rounded-2xl bg-accent p-5">
            <h3 id="how-litter" className="text-[16px] font-bold text-foreground">
              Sau khi gửi
            </h3>
            <ol className="mt-3 flex flex-col gap-2.5 text-[14px] leading-relaxed text-foreground/85">
              <li>
                <strong>1.</strong> Ban điều hành xem ảnh và vị trí bạn gửi.
              </li>
              <li>
                <strong>2.</strong> Đúng như ảnh thì báo cáo được xác minh và bạn được +{rule.points} điểm.
              </li>
              <li>
                <strong>3.</strong> Ban điều hành cho người tới dọn, điểm rác hiện trên{" "}
                <Link href={ROUTES.map} className="font-semibold text-primary hover:underline">
                  bản đồ xanh
                </Link>{" "}
                cho tới khi dọn xong.
              </li>
            </ol>
          </section>
        </div>
      </div>
    </PageContainer>
  );
}
