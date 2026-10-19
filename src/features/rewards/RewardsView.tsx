"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Award, Ticket } from "lucide-react";
import {
  ROUTES,
  REWARD_CATEGORY_LABEL,
  REDEMPTION_STATUS_LABEL,
  formatDate,
  usePoints,
  useRewards,
  useToast,
  type Reward,
  type RewardCategory,
  type Redemption,
} from "@/features/contracts";
import {
  PageContainer,
  PageIntro,
  buttonClass,
} from "@/components/greencity/ui";
import { cn } from "@/lib/utils";
import { RewardCard } from "./components/RewardCard";
import { RedeemModal } from "./components/RedeemModal";

const CATEGORIES: { id: RewardCategory | "all"; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "phan-bon", label: REWARD_CATEGORY_LABEL["phan-bon"] },
  { id: "tui-vai", label: REWARD_CATEGORY_LABEL["tui-vai"] },
  { id: "do-dung", label: REWARD_CATEGORY_LABEL["do-dung"] },
  { id: "cay-giong", label: REWARD_CATEGORY_LABEL["cay-giong"] },
];

export function RewardsView() {
  const { balance } = usePoints();
  const { rewards, redemptions, redeem } = useRewards();
  const toast = useToast();

  const [category, setCategory] = useState<RewardCategory | "all">("all");
  const [activeReward, setActiveReward] = useState<Reward | null>(null);
  const [successRedemption, setSuccessRedemption] = useState<Redemption | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const filteredRewards = useMemo(() => {
    return rewards.filter((r) => {
      if (category === "all") return true;
      return r.category === category;
    });
  }, [rewards, category]);

  const openRedeemModal = (reward: Reward) => {
    setActiveReward(reward);
    setSuccessRedemption(null);
    setRedeemError(null);
  };

  const closeModal = () => {
    setActiveReward(null);
    setSuccessRedemption(null);
    setRedeemError(null);
    setSubmitting(false);
  };

  const confirmRedeem = () => {
    if (!activeReward || submitting) return;
    setSubmitting(true);
    setRedeemError(null);

    const res = redeem(activeReward.id);
    setSubmitting(false);

    if (res.ok) {
      setSuccessRedemption(res.redemption);
      toast("success", "Đã đổi quà", activeReward.name);
    } else {
      switch (res.reason) {
        case "not_enough_points":
          setRedeemError("Bạn chưa đủ điểm cho món này.");
          break;
        case "out_of_stock":
          setRedeemError("Quà vừa hết, bạn chọn món khác nhé.");
          break;
        case "not_logged_in":
          setRedeemError("Phiên đăng nhập đã hết, bạn đăng nhập lại nhé.");
          break;
      }
    }
  };

  return (
    <PageContainer>
      <PageIntro title="Đổi điểm lấy quà xanh">
        Dùng điểm thưởng tích lũy từ các hoạt động phân loại rác để nhận các sản phẩm hữu cơ, đồ dùng tái sử dụng và cây giống thân thiện môi trường.
      </PageIntro>

      {/* Thẻ số dư đầu trang */}
      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Award className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
              Số dư điểm của bạn
            </p>
            <p className="text-[24px] font-extrabold text-foreground sm:text-[28px]">
              <strong className="text-primary">{balance}</strong> điểm
            </p>
          </div>
        </div>

        <Link
          href={ROUTES.points}
          className={cn(buttonClass.secondary, "min-h-11 px-4 text-[14px]")}
        >
          Xem lịch sử điểm
        </Link>
      </div>

      {/* Chip lọc loại quà */}
      <div
        className="hide-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
        role="group"
        aria-label="Lọc theo nhóm quà"
      >
        {CATEGORIES.map((cat) => {
          const selected = category === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setCategory(cat.id)}
              className={cn(
                "min-h-11 shrink-0 rounded-full border px-4 text-[14px] font-semibold transition-colors duration-150",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground/80 hover:border-primary/50 hover:text-primary"
              )}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Lưới thẻ quà */}
      <section aria-label="Danh sách quà tặng" className="mt-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
          {filteredRewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              balance={balance}
              onRedeem={openRedeemModal}
            />
          ))}
        </div>
      </section>

      {/* Mục "Quà bạn đã đổi" */}
      <section aria-labelledby="redeemed-heading" className="mt-12 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-primary" aria-hidden="true" />
          <h3 id="redeemed-heading" className="text-[18px] font-bold text-foreground">
            Quà bạn đã đổi
          </h3>
        </div>

        {redemptions.length === 0 ? (
          <p className="mt-3 text-[14px] text-muted-foreground">
            Bạn chưa đổi món quà nào.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-background">
            {redemptions.map((r: Redemption) => (
              <div
                key={r.id}
                className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-[15px] font-bold text-foreground">
                    {r.rewardName}
                  </p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    Đổi ngày {formatDate(r.at)} · Tiêu tốn {r.pointsSpent} điểm
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border border-border bg-card px-3 py-1 font-mono text-[14px] font-bold text-primary">
                    {r.code}
                  </div>
                  <span className="rounded-full bg-accent px-2.5 py-0.5 text-[12px] font-semibold text-accent-foreground">
                    {REDEMPTION_STATUS_LABEL[r.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal xác nhận & kết quả đổi quà */}
      <RedeemModal
        activeReward={activeReward}
        successRedemption={successRedemption}
        redeemError={redeemError}
        submitting={submitting}
        balance={balance}
        onClose={closeModal}
        onConfirm={confirmRedeem}
      />
    </PageContainer>
  );
}
