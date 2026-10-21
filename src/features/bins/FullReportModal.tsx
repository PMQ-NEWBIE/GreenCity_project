"use client";

import { useState } from "react";
import { GcModal } from "@/components/greencity/GcModal";
import { SubmitButton } from "@/components/greencity/SubmitButton";
import { useToast } from "@/store/hooks";
import { useBins } from "@/store/use-bins";
import { BIN_TYPE_LABEL } from "@/data/bins";
import { ruleById } from "@/data/point-rules";
import type { Bin } from "@/types/features";
import { cn } from "@/lib/utils";

const LEVELS = [
  { key: "sap-day", label: "Sắp đầy", desc: "Còn khoảng một phần tư thùng" },
  { key: "day", label: "Đã đầy", desc: "Không bỏ thêm được, đồ tràn ra ngoài" },
] as const;

/** Báo thùng đầy để cộng tác viên của điểm thu gom xử lý sớm. */
export function FullReportModal({ bin, onClose }: { bin: Bin | null; onClose: () => void }) {
  return (
    <GcModal open={!!bin} onClose={onClose} title="Báo thùng đầy" description={bin ? `${bin.code} · ${bin.name}` : undefined} size="sm">
      {bin && <FullReportForm key={bin.id} bin={bin} onDone={onClose} />}
    </GcModal>
  );
}

function FullReportForm({ bin, onDone }: { bin: Bin; onDone: () => void }) {
  const { reportFull } = useBins();
  const toast = useToast();
  const [level, setLevel] = useState<"sap-day" | "day">("day");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const rule = ruleById("bin-full");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "idle") return;
    setStatus("loading");
    window.setTimeout(() => {
      const res = reportFull(bin.id, level);
      setStatus("success");
      if (res.merged) toast("info", "Đã có người báo thùng này", "Cảm ơn bạn, báo cáo được gộp vào để điểm thu gom ưu tiên.");
      else if (res.points > 0) toast("success", "Đã báo thùng đầy", `+${res.points} điểm khi cộng tác viên xác nhận.`);
      else toast("success", "Đã báo thùng đầy", "Hôm nay bạn đã được tính điểm cho thùng này rồi.");
      onDone();
    }, 400);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <p className="text-[14px] text-muted-foreground">
        Thùng {BIN_TYPE_LABEL[bin.type].toLowerCase()} ở {bin.address}, {bin.area}.
      </p>
      <div className="grid gap-2" role="radiogroup" aria-label="Mức đầy">
        {LEVELS.map((l) => (
          <label
            key={l.key}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors",
              level === l.key ? "border-primary bg-accent" : "border-border hover:border-primary/40"
            )}
          >
            <input type="radio" name="full-level" checked={level === l.key} onChange={() => setLevel(l.key)} className="mt-0.5 h-5 w-5 accent-primary" />
            <span>
              <span className="block text-[15px] font-bold text-foreground">{l.label}</span>
              <span className="block text-[13px] text-muted-foreground">{l.desc}</span>
            </span>
          </label>
        ))}
      </div>
      <p className="text-[13px] text-muted-foreground">
        Báo đúng được +{rule.points} điểm khi cộng tác viên xác nhận. {rule.condition}
      </p>
      <SubmitButton status={status} loadingText="Đang gửi…" successText="Đã báo">
        Gửi báo cáo
      </SubmitButton>
    </form>
  );
}
