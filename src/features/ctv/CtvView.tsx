"use client";

import { PageContainer, PageIntro } from "@/components/greencity/ui";
import { UrlTabs } from "@/features/_shared/UrlTabs";
import { useBins } from "@/store/use-bins";
import { BinReportQueue } from "./BinReportQueue";
import { DropoffQueue } from "./DropoffQueue";

/** Khu cộng tác viên: kiểm tra lượt bỏ thùng, xác nhận thùng đầy. */
export function CtvView() {
  const { bins, dropoffs, reports } = useBins();
  const waitingDropoffs = dropoffs.filter((d) => d.status === "cho-kiem-tra").length;
  const fullBins = bins.filter(
    (b) => b.level !== "binh-thuong" || reports.some((r) => r.binId === b.id && (r.status === "moi" || r.status === "da-xac-nhan"))
  ).length;

  return (
    <PageContainer>
      <PageIntro title="Khu cộng tác viên">
        Kiểm tra đồ người dân bỏ vào thùng và xác nhận thùng đầy. Mỗi lần bạn duyệt, điểm của người dân được ghi nhận ngay.
      </PageIntro>
      <div className="mt-6">
        <UrlTabs
          label="Việc cần làm"
          tabs={[
            { key: "bo-do", label: "Lượt bỏ đồ", count: waitingDropoffs, content: <DropoffQueue /> },
            { key: "thung-day", label: "Thùng báo đầy", count: fullBins, content: <BinReportQueue /> },
          ]}
        />
      </div>
    </PageContainer>
  );
}
