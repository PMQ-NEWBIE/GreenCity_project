"use client";

import Link from "next/link";
import {
  Award,
  CheckCircle2,
  Clock,
  Gift,
  HelpCircle,
  XCircle,
  ArrowRight,
} from "lucide-react";
import {
  ROUTES,
  POINT_RULES,
  POINT_STATUS_LABEL,
  type PointRule,
} from "@/features/contracts";
import {
  PageContainer,
  PageIntro,
  buttonClass,
} from "@/components/greencity/ui";

export function PointRulesView() {
  const welcomeRule = POINT_RULES.find((r) => r.id === "welcome");
  const pickupKgRule = POINT_RULES.find((r) => r.id === "pickup-kg");
  const pickupSortedRule = POINT_RULES.find((r) => r.id === "pickup-sorted");
  const litterRule = POINT_RULES.find((r) => r.id === "litter-report");
  const binRecycleRule = POINT_RULES.find((r) => r.id === "bin-recycle");

  const faqs = [
    {
      q: "Điểm thưởng Green City có hạn sử dụng không?",
      a: "Điểm thưởng trong tài khoản của bạn được tích lũy liên tục và hiện tại không có thời hạn hết hạn. Bạn có thể gom góp điểm qua nhiều tháng để đổi lấy các món quà yêu thích.",
    },
    {
      q: "Làm thế nào để nhận điểm chào mừng?",
      a: `Ngay khi đăng ký tài khoản và đăng nhập lần đầu tiên trên Green City, hệ thống sẽ tự động cộng ngay ${welcomeRule ? welcomeRule.points : 50} điểm chào mừng vào tài khoản của bạn.`,
    },
    {
      q: "Tại sao điểm thu gom tận nhà của tôi chưa thấy cộng?",
      a: `Sau khi nhân viên thu gom hoàn tất cân ve chai tại nhà, bạn sẽ nhận được ${pickupKgRule ? pickupKgRule.points : 2} điểm cho mỗi kg ve chai và cộng thêm ${pickupSortedRule ? pickupSortedRule.points : 10} điểm nếu đã phân loại sẵn. Điểm sẽ ở trạng thái Chờ xác minh và được hệ thống ghi nhận chính thức trong vòng 24 giờ.`,
    },
    {
      q: "Mỗi ngày tôi có thể nhận tối đa bao nhiêu điểm từ thùng rác và báo cáo?",
      a: `Để đảm bảo công bằng, việc bỏ đồ vào thùng thu gom được cộng tối đa ${binRecycleRule?.dailyCap ?? 3} lần mỗi ngày. Mỗi lượt báo điểm rác hợp lệ được xác minh sẽ nhận ${litterRule ? litterRule.points : 20} điểm.`,
    },
    {
      q: "Tôi có thể chuyển nhượng điểm cho người dùng khác không?",
      a: "Hiện tại điểm thưởng gắn liền với tài khoản của từng cá nhân nhằm khuyến khích lối sống xanh của mỗi gia đình. Bạn có thể dùng điểm của mình để đổi quà và đem tặng món quà đó cho người thân, bạn bè.",
    },
  ];

  return (
    <PageContainer>
      <PageIntro title="Quy tắc tính điểm">
        Mọi đóng góp bảo vệ môi trường của bạn đều được ghi nhận minh bạch và quy đổi thành điểm thưởng để nhận những món quà xanh ý nghĩa.
      </PageIntro>

      {/* Bảng quy tắc tính điểm */}
      <section aria-labelledby="rules-table-heading" className="mt-8">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" aria-hidden="true" />
          <h3 id="rules-table-heading" className="text-[18px] font-bold text-foreground">
            Bảng quy tắc điểm thưởng
          </h3>
        </div>

        {/* Dạng table trên màn hình md trở lên */}
        <div className="mt-4 hidden overflow-hidden rounded-2xl border border-border bg-card shadow-sm md:block">
          <table className="w-full border-collapse text-left text-[14px]">
            <thead>
              <tr className="border-b border-border bg-muted/50 font-semibold text-muted-foreground">
                <th scope="col" className="px-5 py-3.5">
                  Hoạt động
                </th>
                <th scope="col" className="px-5 py-3.5 w-44">
                  Điểm thưởng
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Điều kiện ghi nhận
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {POINT_RULES.map((rule: PointRule) => (
                <tr key={rule.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-5 py-4 font-medium text-foreground">
                    {rule.activity}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center rounded-lg bg-primary/10 px-2.5 py-1 text-[13px] font-bold text-primary">
                      +{rule.points} điểm / {rule.unit}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {rule.condition}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Dạng thẻ xếp dọc trên màn hình nhỏ dưới md */}
        <div className="mt-4 flex flex-col gap-3 md:hidden">
          {POINT_RULES.map((rule: PointRule) => (
            <article
              key={rule.id}
              className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-[15px] font-bold text-foreground">
                  {rule.activity}
                </h4>
                <span className="shrink-0 rounded-lg bg-primary/10 px-2.5 py-1 text-[13px] font-bold text-primary">
                  +{rule.points} đ / {rule.unit}
                </span>
              </div>
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {rule.condition}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Mục "Khi nào điểm được cộng?" */}
      <section aria-labelledby="status-flow-heading" className="mt-10 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
        <h3 id="status-flow-heading" className="text-[18px] font-bold text-foreground">
          Khi nào điểm được cộng vào tài khoản?
        </h3>
        <p className="mt-1 text-[14px] text-muted-foreground">
          Mỗi lượt tích điểm đều trải qua quy trình xác minh rõ ràng nhằm bảo đảm tính chính xác.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/40 p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <span className="text-[14px] font-bold text-foreground">
                {POINT_STATUS_LABEL.pending}
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Lúc mới ghi nhận hoạt động (gửi yêu cầu thu gom, bỏ đồ thùng, gửi báo cáo), điểm được đưa vào trạng thái chờ xác minh.
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-primary/25 bg-primary/5 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden="true" />
              <span className="text-[14px] font-bold text-primary">
                {POINT_STATUS_LABEL.confirmed}
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Cộng tác viên hoặc đội ngũ vận hành kiểm tra xong đúng tiêu chuẩn, điểm sẽ được cộng chính thức vào số dư khả dụng.
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-destructive/25 bg-destructive/5 p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" aria-hidden="true" />
              <span className="text-[14px] font-bold text-destructive">
                {POINT_STATUS_LABEL.rejected}
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Nếu hoạt động không đạt yêu cầu (ví dụ đồ lẫn rác bẩn, báo cáo trùng lặp), lượt điểm sẽ bị từ chối kèm lý do cụ thể.
            </p>
          </div>
        </div>
      </section>

      {/* Mục "Dùng điểm để làm gì?" */}
      <section className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Gift className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-foreground">
                Dùng điểm để làm gì?
              </h3>
              <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">
                Đổi điểm lấy phân bón hữu cơ ủ hoai, túi vải đi chợ, ống hút inox hoặc chậu cây giống xanh mát từ các đối tác thân thiện.
              </p>
            </div>
          </div>
          <Link
            href={ROUTES.rewards}
            className={cn(buttonClass.primary, "shrink-0 min-h-12 px-5")}
          >
            <span>Khám phá kho quà tặng</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* 5 câu hỏi thường gặp dạng details/summary với min-height 44px */}
      <section aria-labelledby="faq-heading" className="mt-10 mb-8">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" aria-hidden="true" />
          <h3 id="faq-heading" className="text-[18px] font-bold text-foreground">
            Câu hỏi thường gặp về điểm thưởng
          </h3>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {faqs.map((faq, idx) => (
            <details
              key={idx}
              className="group rounded-2xl border border-border bg-card transition-colors duration-150 open:bg-accent/40"
            >
              <summary className="flex min-h-[48px] cursor-pointer items-center justify-between px-5 py-3.5 text-[15px] font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl">
                <span>{faq.q}</span>
                <span className="ml-3 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180">
                  ↓
                </span>
              </summary>
              <div className="border-t border-border/50 px-5 pb-4 pt-3 text-[14px] leading-relaxed text-muted-foreground">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
