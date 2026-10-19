"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bot, Send } from "lucide-react";
import { useToast } from "@/store/hooks";
import { useConsults } from "@/store/use-consults";
import { SmartImage } from "@/components/greencity/SmartImage";
import { SubmitButton } from "@/components/greencity/SubmitButton";
import { FieldError, PageContainer, PageIntro, StepHeading, inputClass } from "@/components/greencity/ui";
import { PhotoPicker } from "@/features/_shared/PhotoPicker";
import { CONSULT_STATUS_LABEL } from "@/data/consults";
import { WASTE_GROUPS } from "@/data/labels";
import { CONSULT_AI_ENABLED, classifyAll } from "@/lib/consult/classify";
import { ROUTES } from "@/lib/routes";
import type { ClassifyResult } from "@/types/features";
import { formatRelativeTime } from "@/utils/format";
import { cn } from "@/lib/utils";
import { GROUP_BADGE } from "./styles";

/** III.1 — gửi ảnh rác, nhận gợi ý tức thì từ sổ tay và câu trả lời của người tư vấn. */
export function ConsultView() {
  const { mine, ask } = useConsults();
  const toast = useToast();
  const [photos, setPhotos] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [question, setQuestion] = useState("");
  const [suggestions, setSuggestions] = useState<ClassifyResult[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  // Gợi ý tức thì khi người dùng gõ mô tả (đợi 300ms sau lần gõ cuối)
  useEffect(() => {
    let alive = true;
    const t = window.setTimeout(() => {
      classifyAll({ imageDataUrl: photos[0] ?? "", description }).then((r) => {
        if (alive) setSuggestions(r);
      });
    }, 300);
    return () => {
      alive = false;
      window.clearTimeout(t);
    };
  }, [description, photos]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "idle") return;
    const errs: Record<string, string> = {};
    if (photos.length === 0) errs.photos = "Chụp một tấm ảnh món đồ";
    if (description.trim().length < 2) errs.description = "Ghi ngắn món đồ là gì, ví dụ: hộp sữa giấy";
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      document.getElementById(`consult-${first}`)?.focus();
      return;
    }
    setStatus("loading");
    window.setTimeout(() => {
      ask({ photo: photos[0], description: description.trim(), question: question.trim(), suggestions });
      setStatus("success");
      toast("success", "Đã gửi câu hỏi", "Người tư vấn sẽ trả lời ở mục Câu hỏi của bạn.");
      window.setTimeout(() => {
        setPhotos([]);
        setDescription("");
        setQuestion("");
        setStatus("idle");
      }, 900);
    }, 400);
  };

  return (
    <PageContainer>
      <PageIntro title="Hỏi cách phân loại">
        Không chắc món đồ bỏ vào đâu? Chụp ảnh, ghi tên món. Bạn có gợi ý ngay từ sổ tay, và người tư vấn sẽ trả lời kỹ hơn.
      </PageIntro>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <form onSubmit={submit} noValidate className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div>
            <StepHeading step={1} title="Chụp ảnh món đồ" />
            <div className="mt-4">
              <PhotoPicker id="consult-photos" photos={photos} onChange={(p) => { setPhotos(p); setErrors((e) => ({ ...e, photos: "" })); }} max={1} error={errors.photos} />
            </div>
          </div>
          <div>
            <StepHeading step={2} title="Món này là gì?" hint="Gõ tên món để xem gợi ý ngay." />
            <label htmlFor="consult-description" className="sr-only">
              Tên món đồ
            </label>
            <input
              id="consult-description"
              value={description}
              onChange={(e) => { setDescription(e.target.value); setErrors((er) => ({ ...er, description: "" })); }}
              placeholder="VD: hộp sữa giấy, pin tiểu, áo mưa rách"
              aria-invalid={!!errors.description}
              className={cn(inputClass(errors.description), "mt-4")}
            />
            <FieldError msg={errors.description} />
          </div>

          {/* Gợi ý tức thì */}
          <section aria-labelledby="suggest" aria-live="polite" className="rounded-xl bg-muted/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 id="suggest" className="text-[15px] font-bold text-foreground">
                Gợi ý từ sổ tay
              </h3>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 text-[12px] font-semibold text-muted-foreground">
                <Bot className="h-3.5 w-3.5" aria-hidden="true" />
                Nhận diện ảnh tự động: {CONSULT_AI_ENABLED ? "đang bật" : "chưa bật"}
              </span>
            </div>
            {suggestions.length === 0 ? (
              <p className="mt-2 text-[14px] text-muted-foreground">
                {description.trim().length < 2 ? "Gõ tên món ở trên để xem gợi ý." : "Sổ tay chưa có món này. Gửi câu hỏi để người tư vấn trả lời."}
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {suggestions.map((s) => (
                  <li key={s.itemName} className="rounded-xl border border-border bg-card p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[14px] font-bold text-foreground">{s.itemName}</span>
                      <span className={cn("rounded-full px-2 py-0.5 text-[12px] font-bold", GROUP_BADGE[s.group])}>{WASTE_GROUPS[s.group].label}</span>
                    </div>
                    <p className="mt-1 text-[13px] text-foreground/85">{s.guidance}</p>
                  </li>
                ))}
              </ul>
            )}
            <Link href={ROUTES.sortingGuide} className="mt-3 inline-flex min-h-9 items-center text-[13px] font-semibold text-primary hover:underline">
              Mở Sổ tay phân loại →
            </Link>
          </section>

          <div>
            <StepHeading step={3} title="Bạn muốn hỏi thêm gì?" hint="Không bắt buộc." />
            <label htmlFor="consult-question" className="sr-only">
              Câu hỏi
            </label>
            <textarea
              id="consult-question"
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="VD: còn dính dầu ăn thì có tái chế được không?"
              className={cn(inputClass(), "mt-4 h-auto resize-none py-3")}
            />
          </div>

          <SubmitButton status={status} loadingText="Đang gửi…" successText="Đã gửi">
            <Send className="h-[18px] w-[18px]" aria-hidden="true" />
            Gửi cho người tư vấn
          </SubmitButton>
        </form>

        <section aria-labelledby="my-consults">
          <h3 id="my-consults" className="text-[18px] font-bold text-foreground">
            Câu hỏi của bạn
          </h3>
          {mine.length === 0 ? (
            <p className="mt-3 rounded-2xl border border-dashed border-border p-5 text-[14px] text-muted-foreground">
              Bạn chưa gửi câu hỏi nào. Câu trả lời sẽ hiện ở đây.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-3">
              {mine.map((t) => (
                <li key={t.id} className="rounded-2xl border border-border bg-card p-3">
                  <div className="flex gap-3">
                    <SmartImage src={t.photo} alt="" className="h-16 w-16 shrink-0 rounded-xl" sizes="64px" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[14px] font-bold text-foreground">{t.description}</p>
                        <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[12px] font-bold", t.status === "da-tra-loi" ? "bg-accent text-primary" : "bg-warn/15 text-warn")}>
                          {CONSULT_STATUS_LABEL[t.status]}
                        </span>
                      </div>
                      {t.question && <p className="mt-0.5 text-[13px] text-muted-foreground">“{t.question}”</p>}
                      <p className="mt-0.5 text-[12px] text-muted-foreground">{formatRelativeTime(t.at)}</p>
                    </div>
                  </div>
                  {t.answer && (
                    <div className="mt-3 rounded-xl bg-accent p-3">
                      <span className={cn("rounded-full px-2 py-0.5 text-[12px] font-bold", GROUP_BADGE[t.answer.group])}>{WASTE_GROUPS[t.answer.group].label}</span>
                      <p className="mt-1.5 text-[14px] text-foreground">{t.answer.guidance}</p>
                      <p className="mt-1 text-[12px] text-muted-foreground">
                        {t.answer.by} trả lời {formatRelativeTime(t.answer.at).toLowerCase()}
                      </p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </PageContainer>
  );
}
