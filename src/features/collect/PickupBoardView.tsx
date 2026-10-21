"use client";

import { useState } from "react";
import { Truck } from "lucide-react";
import { buyerTeamId, useCollect, useCurrentUser } from "@/store/hooks";
import { EmptyState } from "@/components/greencity/EmptyState";
import { ChoiceChip, PageContainer, PageIntro } from "@/components/greencity/ui";
import { isFinal } from "@/lib/pickup";
import { AREAS } from "@/types";
import { RequestItem } from "./RequestItem";

/**
 * Khu người mua: người dân bấm "gọi người tới lấy" → yêu cầu hiện ở đây cho mọi vựa / ve chai dạo.
 * Ai nhận trước thì giữ đơn, tới cân và trả tiền ngay tại nhà.
 */
export function PickupBoardView() {
  const user = useCurrentUser();
  const { requests } = useCollect();
  const [area, setArea] = useState<string>("all");
  const me = user ? buyerTeamId(user.email) : "";

  const mine = requests.filter((r) => r.team?.id === me && !isFinal(r.status));
  const waiting = requests.filter((r) => r.status === "cho-nhan" && (area === "all" || r.area === area));
  const areasWithJobs = AREAS.filter((a) => requests.some((r) => r.status === "cho-nhan" && r.area === a));

  return (
    <PageContainer className="max-w-4xl">
      <PageIntro title="Người dân gọi tới lấy">
        Người dân có ve chai muốn bán nhưng không đăng giá, chỉ cần người tới cân. Nhận đơn hợp tuyến của bạn, tới đúng hẹn, cân trước mặt chủ nhà rồi trả tiền.
      </PageIntro>

      {mine.length > 0 && (
        <section aria-labelledby="my-jobs" className="mt-6">
          <h3 id="my-jobs" className="text-[18px] font-bold text-foreground">
            Việc bạn đã nhận ({mine.length})
          </h3>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {mine.map((r) => (
              <RequestItem key={r.id} request={r} showOwner />
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="waiting" className="mt-8">
        <h3 id="waiting" className="text-[18px] font-bold text-foreground">
          Đang chờ người nhận
        </h3>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Lọc theo quận">
          <ChoiceChip selected={area === "all"} onClick={() => setArea("all")}>
            Mọi quận
          </ChoiceChip>
          {areasWithJobs.map((a) => (
            <ChoiceChip key={a} selected={area === a} onClick={() => setArea(a)}>
              {a}
            </ChoiceChip>
          ))}
        </div>
        {waiting.length > 0 ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {waiting.map((r) => (
              <RequestItem key={r.id} request={r} showOwner />
            ))}
          </ul>
        ) : (
          <EmptyState
            className="mt-4"
            icon={Truck}
            title="Chưa có yêu cầu nào đang chờ"
            description="Khi người dân bấm gọi người tới lấy ve chai, yêu cầu sẽ hiện ở đây."
          />
        )}
      </section>
    </PageContainer>
  );
}
