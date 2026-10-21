"use client";

import { PageContainer, PageIntro } from "@/components/greencity/ui";
import { GiftHandover } from "./GiftHandover";

/** Trả thưởng tại điểm thu gom: người dân đổi điểm lấy quà trên web, tới điểm đọc mã để nhận. */
export function GiftHandoverView() {
  return (
    <PageContainer className="max-w-4xl">
      <PageIntro title="Trao quà đổi điểm">Người dân đổi điểm lấy quà trên web rồi tới điểm thu gom nhận. Nhập mã họ đọc, đúng món thì trao và bấm đã trao.</PageIntro>
      <div className="mt-6">
        <GiftHandover />
      </div>
    </PageContainer>
  );
}
