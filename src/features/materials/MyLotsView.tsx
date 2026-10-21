"use client";

import { PageContainer, PageIntro } from "@/components/greencity/ui";
import { LotManage } from "./LotManage";

/** Vựa / điểm thu gom: lô đã gom đủ số lượng, bán cho doanh nghiệp tái chế và làm phân hữu cơ. */
export function MyLotsView() {
  return (
    <PageContainer>
      <PageIntro title="Lô hàng của tôi">
        Gom đủ một loại (từ 50kg) thì đăng lô kèm độ sạch, độ ẩm. Doanh nghiệp đặt giữ 48 giờ rồi cho xe tới lấy; lấy xong thì chốt đã bán.
      </PageIntro>
      <div className="mt-6">
        <LotManage scope="mine" />
      </div>
    </PageContainer>
  );
}
