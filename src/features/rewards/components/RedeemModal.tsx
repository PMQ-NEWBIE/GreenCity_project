"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";
import {
  formatDate,
  type Reward,
  type Redemption,
} from "@/features/contracts";
import { SmartImage } from "@/components/greencity/SmartImage";
import { GcModal } from "@/components/greencity/GcModal";
import { buttonClass } from "@/components/greencity/ui";
import { cn } from "@/lib/utils";

interface RedeemModalProps {
  activeReward: Reward | null;
  successRedemption: Redemption | null;
  redeemError: string | null;
  submitting: boolean;
  balance: number;
  onClose: () => void;
  onConfirm: () => void;
}

export function RedeemModal({
  activeReward,
  successRedemption,
  redeemError,
  submitting,
  balance,
  onClose,
  onConfirm,
}: RedeemModalProps) {
  return (
    <GcModal
      open={!!activeReward}
      onClose={onClose}
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
                onClick={onClose}
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
                  onClick={onClose}
                  className={cn(buttonClass.secondary, "min-h-11 px-4 text-[14px]")}
                >
                  Để sau
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
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
  );
}
