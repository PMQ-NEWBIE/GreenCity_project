"use client";

import { Gift } from "lucide-react";
import {
  REWARD_CATEGORY_LABEL,
  type Reward,
} from "@/features/contracts";
import { SmartImage } from "@/components/greencity/SmartImage";
import { buttonClass } from "@/components/greencity/ui";
import { cn } from "@/lib/utils";

interface RewardCardProps {
  reward: Reward;
  balance: number;
  onRedeem: (reward: Reward) => void;
}

export function RewardCard({ reward, balance, onRedeem }: RewardCardProps) {
  const isOutOfStock = reward.stock <= 0;
  const notEnoughPoints = balance < reward.pointsCost;
  const pointsNeeded = reward.pointsCost - balance;

  return (
    <article className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card transition-[border-color,box-shadow] duration-200 hover:border-primary/40 hover:shadow-md">
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
            onClick={() => onRedeem(reward)}
            className={cn(buttonClass.primary, "w-full min-h-11 text-[14px]")}
          >
            <Gift className="h-4 w-4" aria-hidden="true" />
            Đổi quà
          </button>
        )}
      </div>
    </article>
  );
}
