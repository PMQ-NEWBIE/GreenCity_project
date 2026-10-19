"use client";

import { BinReportQueue } from "@/features/ctv/BinReportQueue";
import { LitterQueue } from "@/features/ctv/LitterQueue";

/** IV.1 — báo thùng đầy và báo điểm rác, kèm phần "đã xác minh, chờ dọn" của nhóm vận hành. */
export function ReportsTab() {
  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="rp-bins">
        <h3 id="rp-bins" className="mb-3 text-[18px] font-bold text-foreground">
          Thùng báo đầy
        </h3>
        <BinReportQueue />
      </section>
      <section aria-labelledby="rp-litter">
        <h3 id="rp-litter" className="mb-3 text-[18px] font-bold text-foreground">
          Điểm rác tự phát
        </h3>
        <LitterQueue showCleanup />
      </section>
    </div>
  );
}
