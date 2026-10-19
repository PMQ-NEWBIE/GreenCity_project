"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Award, CheckCircle2, Gift, Ticket, AlertCircle } from "lucide-react";
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
import { SmartImage } from "@/components/greencity/SmartImage";
import { GcModal } from "@/components/greencity/GcModal";
import {
  PageContainer,
  PageIntro,
  buttonClass,
} from "@/components/greencity/ui";
import { cn } from "@/lib/utils";

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
          {filteredRewards.map((reward) => {
            const isOutOfStock = reward.stock <= 0;
            const notEnoughPoints = balance < reward.pointsCost;
            const pointsNeeded = reward.pointsCost - balance;

            return (
              <article
                key={reward.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card transition-[border-color,box-shadow] duration-200 hover:border-primary/40 hover:shadow-md"
              >
                <div>
                  <div className="relative aspect-square w-full overflow-hidden">
                    <SmartImage
                      src={reward.image}
                      alt={reward.name}
                      className="h-full w-full"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
                      imgClassName={cn(
                        "transition-transform duration-300 group-hover:scale-[1.03]",
                        isOutOfStock && "grayscale"
                      )}
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-card/90 px-2.5 py-0.5 text-[12px] font-semibold text-primary backdrop-blur-sm">
                      {REWARD_CATEGORY_LABEL[reward.category]}
                    </span>
                  </div>

                  <div className="p-4 sm:p-5">
                    <p className="text-[12px] font-medium text-muted-foreground">
                      {reward.partnerName}
                    </p>
                    <h3 className="mt-1 line-clamp-2 text-[16px] font-bold text-foreground">
                      {reward.name}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
                      {reward.description}
                    </p>

                    <div className="mt-4 flex items-baseline justify-between border-t border-border pt-3">
                      <div>
                        <span className="text-[18px] font-extrabold text-primary">
                          {reward.pointsCost}
                        </span>
                        <span className="ml-1 text-[13px] font-semibold text-muted-foreground">
                          điểm
                        </span>
                      </div>
                      <span className="text-[12px] text-muted-foreground">
                        {isOutOfStock ? "Tạm hết hàng" : `Còn ${reward.stock} phần`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 sm:p-5 sm:pt-0">
                  {isOutOfStock ? (
                    <button
                      type="button"
                      disabled
                      className={cn(buttonClass.secondary, "w-full min-h-11 text-[14px] cursor-not-allowed opacity-60")}
                    >
                      Tạm hết
                    </button>
                  ) : notEnoughPoints ? (
                    <button
                      type="button"
                      disabled
                      className={cn(buttonClass.secondary, "w-full min-h-11 text-[13px] cursor-not-allowed opacity-60")}
                    >
                      Cần thêm {pointsNeeded} điểm
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openRedeemModal(reward)}
                      className={cn(buttonClass.primary, "w-full min-h-11 text-[14px]")}
                    >
                      <Gift className="h-4 w-4" aria-hidden="true" />
                      Đổi quà
                    </button>
                  )}
                </div>
              </article>
            );
          })}
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
      <GcModal
        open={!!activeReward}
        onClose={closeModal}
        title={successRedemption ? "Đổi quà thành công" : "Xác nhận đổi quà"}
        description={
          successRedemption
            ? "Mã nhận quà của bạn đã sẵn sàng."
            : "Vui lòng kiểm tra lại thông tin trước khi dùng điểm."
        }
        size="sm"
      >
        {activeReward && (
          <div>
            {successRedemption ? (
              /* Màn hình thành công ngay trong modal */
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
                </div>

                <div>
                  <p className="text-[15px] font-semibold text-foreground">
                    {successRedemption.rewardName}
                  </p>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    Hạn sử dụng mã tới ngày: {formatDate(successRedemption.expiresAt)}
                  </p>
                </div>

                <div className="w-full rounded-2xl border-2 border-dashed border-primary/40 bg-accent p-4">
                  <span className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Mã nhận quà
                  </span>
                  <p className="mt-1 font-mono text-[24px] font-extrabold tracking-wider text-primary">
                    {successRedemption.code}
                  </p>
                </div>

                <div className="w-full rounded-xl bg-muted/60 p-3 text-left">
                  <p className="text-[12px] font-bold text-foreground">Nơi nhận quà:</p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
                    {activeReward.pickupNote}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className={cn(buttonClass.primary, "w-full min-h-12 mt-2")}
                >
                  Xong
                </button>
              </div>
            ) : (
              /* Màn hình xác nhận đổi quà */
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 rounded-2xl border border-border p-3.5">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border">
                    <SmartImage
                      src={activeReward.image}
                      alt={activeReward.name}
                      className="h-full w-full"
                      sizes="56px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-bold text-foreground">
                      {activeReward.name}
                    </p>
                    <p className="text-[12px] text-muted-foreground">
                      Đối tác: {activeReward.partnerName}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 rounded-xl bg-muted/50 p-4 text-[14px]">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Giá quà:</span>
                    <strong className="text-foreground">{activeReward.pointsCost} điểm</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Số dư hiện tại:</span>
                    <span className="font-semibold text-foreground">{balance} điểm</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2">
                    <span className="font-semibold text-foreground">Số dư sau khi đổi:</span>
                    <strong className="text-primary">{balance - activeReward.pointsCost} điểm</strong>
                  </div>
                </div>

                <div className="rounded-xl border border-border p-3 text-[13px] text-muted-foreground">
                  <strong className="text-foreground">Lưu ý nhận quà: </strong>
                  {activeReward.pickupNote}
                </div>

                {redeemError && (
                  <p className="flex items-center gap-1.5 text-[13px] font-semibold text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {redeemError}
                  </p>
                )}

                <div className="mt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className={cn(buttonClass.secondary, "min-h-11 px-4 text-[14px]")}
                  >
                    Để sau
                  </button>
                  <button
                    type="button"
                    onClick={confirmRedeem}
                    disabled={submitting}
                    className={cn(buttonClass.primary, "min-h-11 px-5 text-[14px]")}
                  >
                    Xác nhận đổi
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </GcModal>
    </PageContainer>
  );
}
