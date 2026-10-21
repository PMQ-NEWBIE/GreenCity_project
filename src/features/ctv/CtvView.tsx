"use client";

import { PageContainer, PageIntro } from "@/components/greencity/ui";
import { UrlTabs } from "@/features/_shared/UrlTabs";
import { useBins } from "@/store/use-bins";
import { BinReportQueue } from "./BinReportQueue";
import { DropoffQueue } from "./DropoffQueue";

/**
 * Cộng tác viên = người trực điểm thu gom: xác nhận người dân bỏ đồ đúng loại (cộng điểm cho họ),
 * xử lý thùng báo đầy. Trao quà và bán lô cho doanh nghiệp ở các mục riêng trong menu.
 * Xác minh điểm rác và trả lời câu hỏi phân loại thuộc ban điều hành.
 */
export function CtvView() {
  const { bins, dropoffs, reports } = useBins();
  const waitingDropoffs = dropoffs.filter((d) => d.status === "cho-kiem-tra").length;
  const fullBins = bins.filter(
    (b) => b.level !== "binh-thuong" || reports.some((r) => r.binId === b.id && (r.status === "moi" || r.status === "da-xac-nhan"))
  ).length;

  return (
    <PageContainer>
      <PageIntro title="Việc ở điểm thu gom">
        Kiểm tra đồ người dân bỏ vào thùng và xác nhận thùng đầy. Mỗi lượt bạn duyệt, điểm thưởng của người dân được ghi nhận ngay.
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
