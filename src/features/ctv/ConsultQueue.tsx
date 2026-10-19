"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { useToast } from "@/store/hooks";
import { useConsults } from "@/store/use-consults";
import { EmptyState } from "@/components/greencity/EmptyState";
import { SmartImage } from "@/components/greencity/SmartImage";
import { ChoiceChip, FieldError, buttonClass, inputClass } from "@/components/greencity/ui";
import { WASTE_GROUPS } from "@/data/labels";
import type { ConsultTicket, WasteGroup } from "@/types/features";
import { formatRelativeTime } from "@/utils/format";
import { cn } from "@/lib/utils";
import { GROUP_BADGE } from "@/features/consult/styles";

/** Câu hỏi phân loại chờ trả lời (III.1) — cộng tác viên hoặc vận hành trả lời. */
export function ConsultQueue() {
  const { tickets } = useConsults();
  const waiting = tickets.filter((t) => t.status === "cho-tu-van");
  if (waiting.length === 0) return <EmptyState icon={MessageCircle} title="Không còn câu hỏi chờ trả lời" description="Câu hỏi phân loại mới sẽ hiện ở đây." />;
  return (
    <ul className="grid gap-3 lg:grid-cols-2">
      {waiting.map((t) => (
        <AnswerCard key={t.id} ticket={t} />
      ))}
    </ul>
  );
}

function AnswerCard({ ticket: t }: { ticket: ConsultTicket }) {
  const { answer } = useConsults();
  const toast = useToast();
  const top = t.suggestions[0];
  const [group, setGroup] = useState<WasteGroup | "">(top?.group ?? "");
  const [guidance, setGuidance] = useState(top?.guidance ?? "");
  const [error, setError] = useState("");

  const submit = () => {
    if (!group) return setError("Chọn nhóm rác");
    if (guidance.trim().length < 10) return setError("Viết hướng dẫn cụ thể hơn (ít nhất 10 ký tự)");
    answer(t.id, group, guidance);
    toast("success", "Đã trả lời", `${t.userName} · ${t.description}`);
  };

  return (
    <li className="rounded-2xl border border-border bg-card p-4">
      <div className="flex gap-3">
        <SmartImage src={t.photo} alt={`Ảnh ${t.description}`} className="h-20 w-20 shrink-0 rounded-xl border border-border" sizes="80px" />
        <div className="min-w-0">
          <p className="text-[15px] font-bold text-foreground">{t.description}</p>
          {t.question && <p className="mt-0.5 text-[14px] text-foreground/85">“{t.question}”</p>}
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            {t.userName} · {formatRelativeTime(t.at)}
          </p>
        </div>
      </div>
      {t.suggestions.length > 0 && (
        <p className="mt-3 text-[13px] text-muted-foreground">
          Gợi ý tự động: {t.suggestions.map((s) => `${s.itemName} (${WASTE_GROUPS[s.group].label.toLowerCase()})`).join(", ")}
        </p>
      )}
      <fieldset className="mt-3">
        <legend className="mb-1.5 text-[13px] font-semibold text-foreground">Thuộc nhóm</legend>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(WASTE_GROUPS) as WasteGroup[]).map((g) => (
            <ChoiceChip key={g} selected={group === g} onClick={() => { setGroup(g); setError(""); }}>
              {WASTE_GROUPS[g].label}
            </ChoiceChip>
          ))}
        </div>
      </fieldset>
      <label htmlFor={`guide-${t.id}`} className="mb-1.5 mt-3 block text-[13px] font-semibold text-foreground">
        Hướng dẫn
      </label>
      <textarea
        id={`guide-${t.id}`}
        rows={3}
        value={guidance}
        onChange={(e) => { setGuidance(e.target.value); setError(""); }}
        placeholder="Cần làm gì trước khi bỏ, bỏ vào đâu…"
        className={cn(inputClass(), "h-auto resize-none py-3")}
      />
      <FieldError msg={error} />
      {group && <span className={cn("mt-2 inline-block rounded-full px-2 py-0.5 text-[12px] font-bold", GROUP_BADGE[group])}>{WASTE_GROUPS[group].description}</span>}
      <button type="button" onClick={submit} className={cn(buttonClass.primary, "mt-3 w-full")}>
        Gửi câu trả lời
      </button>
    </li>
  );
}
