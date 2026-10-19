"use client";

import { MapPin, Send } from "lucide-react";
import {
  SWAP_CATEGORY_LABEL,
  SWAP_CONDITION_LABEL,
  type SwapCategory,
  type SwapCondition,
} from "@/features/contracts";
import { SmartImage } from "@/components/greencity/SmartImage";
import { SubmitButton } from "@/components/greencity/SubmitButton";
import { cn } from "@/lib/utils";

interface SwapPreviewCardProps {
  image: string;
  title: string;
  category: SwapCategory | "";
  condition: SwapCondition | "";
  giveaway: boolean;
  wants: string;
  area: string;
  status: "idle" | "loading" | "success";
}

export function SwapPreviewCard({
  image,
  title,
  category,
  condition,
  giveaway,
  wants,
  area,
  status,
}: SwapPreviewCardProps) {
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <p className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
        Tin trao đổi xem trước
      </p>
      <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {image ? (
          <SmartImage src={image} alt="" className="aspect-[4/3] w-full" sizes="320px" />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center bg-muted text-[13px] text-muted-foreground">
            Chưa có ảnh
          </div>
        )}
        <div className="p-4">
          <div className="flex items-center gap-2">
            {condition && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                {SWAP_CONDITION_LABEL[condition]}
              </span>
            )}
            {category && (
              <span className="text-[12px] text-muted-foreground">
                {SWAP_CATEGORY_LABEL[category]}
              </span>
            )}
          </div>

          <p className={cn("mt-2 line-clamp-2 text-[15px] font-bold", title.trim() ? "text-foreground" : "text-muted-foreground")}>
            {title.trim() || "Tiêu đề món đồ"}
          </p>

          <div className="mt-2 text-[13px]">
            {giveaway ? (
              <span className="font-bold text-primary">Tặng miễn phí</span>
            ) : (
              <span className="text-muted-foreground">
                <strong className="text-foreground">Đổi:</strong> {wants.trim() || "Chưa nhập"}
              </span>
            )}
          </div>

          <p className="mt-3 flex items-center gap-1 border-t border-border pt-2.5 text-[12px] text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            {area || "Chọn quận"}
          </p>
        </div>
      </div>

      <SubmitButton
        status={status}
        loadingText="Đang đăng tin..."
        successText="Đã đăng thành công!"
        className="mt-4"
      >
        <Send className="h-4 w-4" aria-hidden="true" />
        Đăng đồ trao đổi
      </SubmitButton>
    </aside>
  );
}
