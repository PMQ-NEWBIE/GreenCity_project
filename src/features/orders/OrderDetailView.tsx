"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarClock, Check, MapPin, MessageSquareText, Package, Phone, UserRound, X } from "lucide-react";
import { useApp } from "@/store/app-store";
import { useOrders } from "@/store/use-orders";
import { useLinks } from "@/store/use-links";
import { EmptyState } from "@/components/greencity/EmptyState";
import { GcModal } from "@/components/greencity/GcModal";
import { SmartImage } from "@/components/greencity/SmartImage";
import { ChoiceChip, FieldError, PageContainer, buttonClass } from "@/components/greencity/ui";
import { ROUTES } from "@/lib/routes";
import { CANCEL_REASONS, DECLINE_REASONS, ORDER_STATUS_LABEL, nextSteps, type OrderSide } from "@/lib/orders";
import type { Order, OrderStatus } from "@/types/features";
import { formatDateTime, formatPrice } from "@/utils/format";
import { cn } from "@/lib/utils";
import { OrderBadge } from "./OrderCard";

/** Một câu cho biết đơn đang ở đâu và bước tiếp theo là gì — theo góc nhìn của từng bên. */
function nextHint(o: Order, side: OrderSide): string {
  const seller = side === "seller";
  switch (o.status) {
    case "pending":
      return seller
        ? `${o.buyerName} muốn mua ${o.quantity.toLowerCase()}, hẹn ${o.meetTime.toLowerCase()}. Nhận đơn nếu bạn còn hàng.`
        : "Người bán sẽ xác nhận sớm. Bạn có thể hủy trước khi họ nhận đơn.";
    case "accepted":
      return seller
        ? `Hẹn ${o.buyerName} ${o.meetTime.toLowerCase()} ở ${o.product.area}. Giao xong thì bấm "Đã giao xong".`
        : `Người bán đã nhận. Hẹn ${o.meetTime.toLowerCase()} ở ${o.product.area}, nhớ cân lại trước khi trả tiền.`;
    case "done":
      return "Giao dịch đã xong. Cảm ơn bạn đã cho đồ cũ một vòng đời mới.";
    case "declined":
      return seller ? "Bạn đã từ chối đơn này." : "Người bán không nhận đơn này. Bạn có thể tìm tin khác cùng loại.";
    case "cancelled":
      return "Đơn đã hủy.";
  }
}

const STEP_BY: Record<OrderStatus, string> = {
  pending: "Đặt mua",
  accepted: "Người bán nhận đơn",
  done: "Đã giao xong",
  declined: "Người bán từ chối",
  cancelled: "Hủy đơn",
};

export function OrderDetailView({ id }: { id: string }) {
  const { state, setMode, toast } = useApp();
  const { byId, sideOf, act } = useOrders();
  const links = useLinks();
  const resident = state.user?.role === "resident";
  const [closing, setClosing] = useState<null | "declined" | "cancelled">(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const order = byId(id);
  const side = order ? sideOf(order) : null;

  // Trang đơn dùng chung cho hai bên → menu theo vai của mình trong đơn này
  useEffect(() => {
    if (resident && side) setMode(side === "seller" ? "sell" : "buy");
  }, [resident, side, setMode]);

  if (!order || !side) {
    return (
      <PageContainer>
        <EmptyState
          title="Không tìm thấy đơn"
          description="Đơn không tồn tại hoặc không phải của bạn."
          action={
            <Link href={ROUTES.dashboard} className={buttonClass.primary}>
              Về trang đầu
            </Link>
          }
        />
      </PageContainer>
    );
  }

  const steps = nextSteps(order, side);
  const listHref = side === "seller" ? ROUTES.sellerOrders : links.boughtList;
  const productExists = state.products.some((p) => p.id === order.productId);
  const other = side === "seller" ? { label: "Người mua", name: order.buyerName } : { label: "Người bán", name: order.sellerName };

  const run = (to: OrderStatus, note?: string) => {
    const done = act(order.id, to, note);
    if (!done) return toast("error", "Không đổi được trạng thái", "Đơn có thể vừa được cập nhật. Tải lại trang để xem.");
    toast("success", ORDER_STATUS_LABEL[to], order.product.name);
  };

  const openClose = (kind: "declined" | "cancelled") => {
    setReason("");
    setReasonError("");
    setClosing(kind);
  };
  const confirmClose = () => {
    if (!closing) return;
    if (!reason) return setReasonError("Chọn một lý do để bên kia biết");
    run(closing, reason);
    setClosing(null);
  };

  return (
    <PageContainer className="max-w-5xl">
      <Link href={listHref} className={cn(buttonClass.ghost, "-ml-3 text-muted-foreground hover:text-foreground")}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {side === "seller" ? "Đơn đến" : resident ? "Đơn mua của tôi" : "Đơn thu mua"}
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <OrderBadge order={order} side={side} />
          <h2 className="mt-2 text-balance text-[24px] font-extrabold leading-tight tracking-tight text-foreground sm:text-[26px]">{order.product.name}</h2>
          <p className="mt-1 text-[14px] text-muted-foreground">Đặt lúc {formatDateTime(order.createdAt)}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-4">
          {/* Bước tiếp theo + nút */}
          <section aria-label="Việc cần làm" className="rounded-2xl border border-primary/30 bg-accent p-5">
            <p className="text-[15px] leading-relaxed text-accent-foreground">{nextHint(order, side)}</p>
            {steps.length > 0 && (
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                {steps.includes("accepted") && (
                  <button type="button" onClick={() => run("accepted")} className={cn(buttonClass.primary, "sm:flex-1")}>
                    <Check className="h-[18px] w-[18px]" aria-hidden="true" />
                    Nhận đơn
                  </button>
                )}
                {steps.includes("done") && (
                  <button type="button" onClick={() => run("done")} className={cn(buttonClass.primary, "sm:flex-1")}>
                    <Check className="h-[18px] w-[18px]" aria-hidden="true" />
                    Đã giao xong
                  </button>
                )}
                {steps.includes("declined") && (
                  <button type="button" onClick={() => openClose("declined")} className={buttonClass.secondary}>
                    <X className="h-[18px] w-[18px]" aria-hidden="true" />
                    Từ chối
                  </button>
                )}
                {steps.includes("cancelled") && (
                  <button type="button" onClick={() => openClose("cancelled")} className={cn(buttonClass.secondary, "hover:border-destructive/50 hover:text-destructive")}>
                    <X className="h-[18px] w-[18px]" aria-hidden="true" />
                    Hủy đơn
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Thông tin đơn */}
          <section aria-labelledby="order-info" className="rounded-2xl border border-border bg-card p-5">
            <h3 id="order-info" className="text-[16px] font-bold text-foreground">
              Thông tin đơn
            </h3>
            <dl className="mt-3 grid gap-3 text-[15px] sm:grid-cols-2">
              <Info icon={UserRound} label={other.label} value={other.name} />
              <Info icon={Package} label="Số lượng" value={order.quantity} />
              <Info icon={CalendarClock} label="Hẹn lấy hàng" value={order.meetTime} />
              <Info icon={MapPin} label="Khu vực" value={order.product.area} />
              {order.note && <Info icon={MessageSquareText} label="Ghi chú" value={order.note} wide />}
            </dl>
            {order.status === "accepted" && (
              <p className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-border p-3 text-[14px]">
                <span className="flex items-center gap-2 font-semibold text-foreground/80">
                  <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
                  Số điện thoại {other.label.toLowerCase()}
                </span>
                <span className="font-mono font-bold text-foreground">090x xxx xxx</span>
              </p>
            )}
          </section>
        </div>

        <div className="flex flex-col gap-4">
          {/* Món hàng (chụp lại lúc đặt) */}
          <section aria-label="Món hàng" className="overflow-hidden rounded-2xl border border-border bg-card">
            <SmartImage src={order.product.image} alt={order.product.name} sizes="340px" className="aspect-[4/3] w-full" />
            <div className="p-4">
              <p className="text-[20px] font-extrabold text-primary">{formatPrice(order.product.price, order.product.unit)}</p>
              {productExists && (
                <Link href={links.product(order.productId)} className={cn(buttonClass.ghost, "-ml-3 mt-1")}>
                  Xem tin đăng
                </Link>
              )}
            </div>
          </section>

          {/* Lịch sử đơn */}
          <section aria-labelledby="order-history" className="rounded-2xl border border-border bg-card p-5">
            <h3 id="order-history" className="text-[16px] font-bold text-foreground">
              Lịch sử
            </h3>
            <ol className="mt-3 flex flex-col gap-3">
              {order.events.map((e, i) => (
                <li key={i} className="flex gap-3">
                  <span aria-hidden="true" className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", i === order.events.length - 1 ? "bg-primary" : "bg-border")} />
                  <div className="min-w-0">
                    <p className="text-[14.5px] font-semibold text-foreground">{STEP_BY[e.status]}</p>
                    <p className="text-[13px] text-muted-foreground">
                      {formatDateTime(e.at)}
                      {e.note ? ` · ${e.note}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      <GcModal
        open={closing !== null}
        onClose={() => setClosing(null)}
        title={closing === "declined" ? "Từ chối đơn này?" : "Hủy đơn này?"}
        description={side === "seller" ? `${order.buyerName} sẽ thấy lý do bạn chọn.` : `${order.sellerName} sẽ thấy lý do bạn chọn.`}
        size="sm"
      >
        <div className="flex flex-wrap gap-2" role="group" aria-label="Lý do">
          {(closing === "declined" ? DECLINE_REASONS : CANCEL_REASONS).map((r) => (
            <ChoiceChip key={r} selected={reason === r} onClick={() => setReason(r)}>
              {r}
            </ChoiceChip>
          ))}
        </div>
        <FieldError msg={reasonError} />
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={() => setClosing(null)} className={cn(buttonClass.secondary, "flex-1")}>
            Quay lại
          </button>
          <button type="button" onClick={confirmClose} className={cn(buttonClass.primary, "flex-1 bg-destructive hover:bg-destructive/90")}>
            {closing === "declined" ? "Từ chối" : "Hủy đơn"}
          </button>
        </div>
      </GcModal>
    </PageContainer>
  );
}

function Info({ icon: Icon, label, value, wide = false }: { icon: typeof Package; label: string; value: string; wide?: boolean }) {
  return (
    <div className={cn("flex gap-3", wide && "sm:col-span-2")}>
      <Icon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-primary" aria-hidden="true" />
      <div className="min-w-0">
        <dt className="text-[13px] font-medium text-muted-foreground">{label}</dt>
        <dd className="font-semibold text-foreground">{value}</dd>
      </div>
    </div>
  );
}
