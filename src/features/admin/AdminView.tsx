"use client";

import { PageContainer, PageIntro } from "@/components/greencity/ui";
import { UrlTabs } from "@/features/_shared/UrlTabs";
import { useCollect } from "@/store/hooks";
import { useBins } from "@/store/use-bins";
import { useLitter } from "@/store/use-litter";
import { useLedger } from "@/store/use-admin";
import { useConsults } from "@/store/use-consults";
import { isFinal } from "@/lib/pickup";
import { BinsTab } from "./BinsTab";
import { PartnersTab } from "./PartnersTab";
import { PickupsTab } from "./PickupsTab";
import { PointsTab } from "./PointsTab";
import { ReportsTab } from "./ReportsTab";

/** Khu quản trị cho nhóm vận hành (IV.1–4). */
export function AdminView() {
  const { requests } = useCollect();
  const { bins, reports } = useBins();
  const { reports: litter } = useLitter();
  const { redemptions } = useLedger();
  const { tickets } = useConsults();

  const openPickups = requests.filter((r) => !isFinal(r.status)).length;
  const openReports =
    reports.filter((r) => r.status === "moi").length +
    litter.filter((r) => r.status === "cho-xac-minh" || r.status === "da-xac-minh").length +
    tickets.filter((t) => t.status === "cho-tu-van").length;
  const fullBins = bins.filter((b) => b.level === "day").length;
  const giftsToHand = redemptions.filter((r) => r.status === "ready").length;

  return (
    <PageContainer>
      <PageIntro title="Quản trị vận hành">
        Nhận đơn thu gom, xử lý báo cáo, theo dõi thùng, chỉnh điểm thưởng và quản lý đối tác. Số liệu là dữ liệu minh họa.
      </PageIntro>
      <div className="mt-6">
        <UrlTabs
          label="Khu quản trị"
          tabs={[
            { key: "don-thu-gom", label: "Đơn thu gom", count: openPickups, content: <PickupsTab /> },
            { key: "bao-cao", label: "Báo cáo", count: openReports, content: <ReportsTab /> },
            { key: "thung", label: "Thùng", count: fullBins, content: <BinsTab /> },
            { key: "diem-thuong", label: "Điểm thưởng", count: giftsToHand, content: <PointsTab /> },
            { key: "doi-tac", label: "Đối tác", content: <PartnersTab /> },
          ]}
        />
      </div>
    </PageContainer>
  );
}
