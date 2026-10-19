"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  Repeat,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import {
  ROUTES,
  SWAP_CATEGORY_LABEL,
  SWAP_CONDITION_LABEL,
  SWAP_STATUS_LABEL,
  formatRelativeTime,
  useSwap,
  useToast,
  type SwapStatus,
  type SwapItem,
} from "@/features/contracts";
import { SmartImage } from "@/components/greencity/SmartImage";
import { GcModal } from "@/components/greencity/GcModal";
import { EmptyState } from "@/components/greencity/EmptyState";
import { PageContainer, buttonClass } from "@/components/greencity/ui";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: { id: SwapStatus; label: string }[] = [
  { id: "open", label: SWAP_STATUS_LABEL.open },
  { id: "reserved", label: SWAP_STATUS_LABEL.reserved },
  { id: "done", label: SWAP_STATUS_LABEL.done },
];

export function SwapDetailView({ id }: { id: string }) {
  const router = useRouter();
  const { items, setStatus, removeItem } = useSwap();
  const toast = useToast();

  const [contactOpen, setContactOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const item = items.find((i: SwapItem) => i.id === id);

  if (!item) {
    return (
      <PageContainer>
        <EmptyState
          title="Không tìm thấy món đồ"
          description="Món đồ bạn đang tìm không tồn tại hoặc người đăng đã gỡ khỏi hệ thống."
          action={
            <Link href={ROUTES.swap} className={buttonClass.primary}>
              Về khu trao đổi
            </Link>
          }
        />
      </PageContainer>
    );
  }

  const isMine = item.isMine;

  const onStatusChange = (newStatus: SwapStatus) => {
    setStatus(item.id, newStatus);
    toast("info", "Đã cập nhật trạng thái", SWAP_STATUS_LABEL[newStatus]);
  };

  const confirmDelete = () => {
    removeItem(item.id);
    setDeleteOpen(false);
    toast("success", "Đã xóa tin trao đổi", item.title);
    router.replace(ROUTES.swap);
  };

  return (
    <PageContainer className="max-w-4xl">
      {/* Nút quay lại */}
      <div className="mb-4">
        <Link
          href={ROUTES.swap}
          className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Tất cả đồ trao đổi
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Ảnh món đồ */}
        <div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border shadow-sm">
            <SmartImage
              src={item.image}
              alt={item.title}
              className="h-full w-full"
              eager
              sizes="(max-width: 768px) 100vw, 448px"
            />
            {item.status !== "open" && (
              <span
                className={cn(
                  "absolute left-3 top-3 rounded-full px-3 py-1 text-[12px] font-bold text-white shadow-md",
                  item.status === "reserved" ? "bg-warn" : "bg-black/75"
                )}
              >
                {SWAP_STATUS_LABEL[item.status]}
              </span>
            )}
          </div>
        </div>

        {/* Thông tin chi tiết */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-bold text-primary">
                {SWAP_CONDITION_LABEL[item.condition]}
              </span>
              <span className="rounded-full bg-muted px-2.5 py-0.5 font-medium text-foreground">
                {SWAP_CATEGORY_LABEL[item.category]}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                {item.area}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" aria-hidden="true" />
                {formatRelativeTime(item.postedAt)}
              </span>
            </div>

            {/* Tiêu đề món đồ: Đúng duy nhất 1 thẻ h2 */}
            <h2 className="mt-3 text-[22px] font-extrabold tracking-tight text-foreground sm:text-[26px]">
              {item.title}
            </h2>

            {/* Khối hình thức: Tặng hoặc Đổi */}
            <div className="mt-4 rounded-2xl border border-border bg-card p-4">
              {item.giveaway ? (
                <div className="flex items-center gap-2.5 text-primary">
                  <Heart className="h-5 w-5 fill-current" aria-hidden="true" />
                  <div>
                    <span className="text-[15px] font-bold">Món đồ này tặng miễn phí</span>
                    <p className="text-[12px] text-muted-foreground">
                      Người đăng muốn tặng cho ai thật sự có nhu cầu sử dụng.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2.5 text-foreground">
                  <Repeat className="mt-0.5 h-5 w-5 text-primary shrink-0" aria-hidden="true" />
                  <div>
                    <span className="text-[14px] font-bold text-muted-foreground">Muốn đổi lấy:</span>
                    <p className="text-[15px] font-bold text-primary">{item.wants}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Mô tả */}
            <section className="mt-4 rounded-2xl border border-border bg-card p-4">
              <h3 className="text-[14px] font-bold text-foreground">Mô tả món đồ</h3>
              <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-foreground/85">
                {item.description}
              </p>
            </section>

            {/* Người đăng */}
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-[15px] font-bold text-primary-foreground">
                {item.owner.initials}
              </span>
              <div>
                <p className="text-[14px] font-bold text-foreground">{item.owner.name}</p>
                <p className="text-[12px] text-muted-foreground">Người đăng tin</p>
              </div>
            </div>
          </div>

          {/* Khu vực hành động */}
          <div className="mt-6 border-t border-border pt-5">
            {isMine ? (
              <div className="flex flex-col gap-4">
                <div>
                  <label htmlFor="status-select" className="mb-1.5 block text-[13px] font-bold text-foreground">
                    Trạng thái món đồ của bạn:
                  </label>
                  <select
                    id="status-select"
                    value={item.status}
                    onChange={(e) => onStatusChange(e.target.value as SwapStatus)}
                    className={cn(
                      "h-11 w-full rounded-xl border border-input bg-card px-4 text-[14px] font-semibold text-foreground outline-none select-chevron cursor-pointer appearance-none"
                    )}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setDeleteOpen(true)}
                  className={cn(buttonClass.secondary, "w-full min-h-11 text-destructive hover:border-destructive/40")}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Xóa món đồ này
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setContactOpen(true)}
                disabled={item.status === "done"}
                className={cn(buttonClass.primary, "w-full min-h-12 text-[15px]")}
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                {item.status === "done" ? "Món đồ đã trao đổi" : "Nhắn người đăng"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal liên hệ người đăng */}
      <GcModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        title={`Liên hệ ${item.owner.name}`}
        description="Trao đổi thông tin hẹn giờ và địa điểm nhận hoặc đổi đồ."
        size="sm"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-2xl border border-border p-4">
            <span className="flex items-center gap-3 text-[14px] font-semibold text-foreground/80">
              <Phone className="h-[18px] w-[18px] text-primary" aria-hidden="true" />
              Số điện thoại
            </span>
            <span className="font-mono text-[15px] font-bold text-foreground">09xx xxx 892</span>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-border p-4">
            <span className="flex items-center gap-3 text-[14px] font-semibold text-foreground/80">
              <MapPin className="h-[18px] w-[18px] text-primary" aria-hidden="true" />
              Khu vực
            </span>
            <span className="text-[14px] font-bold text-foreground">{item.area}</span>
          </div>

          <p className="mt-1 text-center text-[13px] text-muted-foreground">
            Bản demo nên số điện thoại được che. Hãy hẹn gặp ở nơi đông người, an toàn khi trao đổi đồ.
          </p>
        </div>
      </GcModal>

      {/* Modal xác nhận xóa tin */}
      <GcModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Xóa tin trao đổi"
        description="Bạn có chắc chắn muốn gỡ món đồ này khỏi khu trao đổi?"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <p className="text-[14px] leading-relaxed text-muted-foreground">
            Sau khi gỡ, mọi người sẽ không còn tìm thấy hoặc liên hệ trao đổi món đồ này nữa.
          </p>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setDeleteOpen(false)}
              className={buttonClass.secondary}
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className={cn(buttonClass.primary, "bg-destructive text-destructive-foreground hover:bg-destructive/90")}
            >
              Xác nhận xóa
            </button>
          </div>
        </div>
      </GcModal>
    </PageContainer>
  );
}
