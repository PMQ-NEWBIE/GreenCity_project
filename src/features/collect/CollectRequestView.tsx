"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarClock, Coins, FlaskConical, MapPin, Phone, Scale, Truck, XCircle } from "lucide-react";
import { buyerTeamId, useCollect, useCurrentUser, usePartners, useToast } from "@/store/hooks";
import { EmptyState } from "@/components/greencity/EmptyState";
import { GcModal } from "@/components/greencity/GcModal";
import { SmartImage } from "@/components/greencity/SmartImage";
import { ChoiceChip, FieldError, PageContainer, buttonClass, inputClass } from "@/components/greencity/ui";
import { CANCEL_REASONS, MATERIAL_PRICE_PER_KG, PAYOUT_LABEL } from "@/data/pickup";
import { POINT_RULES } from "@/data/point-rules";
import { canCancel, isFinal, pickupPoints, totalAmount, totalKg } from "@/lib/pickup";
import { ROUTES } from "@/lib/routes";
import type { PayoutMethod, PickupRequest } from "@/types/features";
import { formatDateTime, formatPrice } from "@/utils/format";
import { cn } from "@/lib/utils";
import { PickupBadge } from "./RequestItem";
import { PickupTimeline } from "./PickupTimeline";
import { PayoutChoice, PickupOpsPanel, tomorrowNine } from "./PickupOpsPanel";

export function CollectRequestView({ id }: { id: string }) {
  const { requests } = useCollect();
  const user = useCurrentUser();
  const r = requests.find((x) => x.id === id);
  const isOwner = !!r && !!user && r.ownerId === user.email;
  // Ban điều hành chỉ theo dõi; người mua (vựa, ve chai dạo) nhận đơn còn chờ và làm tiếp đơn mình đã nhận
  const isOps = user?.role === "operator";
  const isBuyer = user?.role === "partner";
  const isTaker = !!r && !!user && r.team?.id === buyerTeamId(user.email);
  const buyerCanAct = !!r && isBuyer && (r.status === "cho-nhan" || isTaker);
  const back = isOwner
    ? { href: ROUTES.collect, label: "Yêu cầu của bạn" }
    : isBuyer
      ? { href: ROUTES.partnerPickups, label: "Người dân gọi tới lấy" }
      : { href: `${ROUTES.admin}?tab=don-thu-gom`, label: "Giám sát thu gom" };

  if (!r || (!isOwner && !isOps && !buyerCanAct)) {
    return (
      <PageContainer>
        <EmptyState
          title="Không tìm thấy yêu cầu"
          description={isBuyer ? "Yêu cầu không còn hoặc đã có người mua khác nhận." : "Yêu cầu không tồn tại hoặc không phải của bạn."}
          action={
            <Link href={back.href} className={buttonClass.primary}>
              {back.label}
            </Link>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-5xl">
      <Link href={back.href} className={cn(buttonClass.ghost, "-ml-3 text-muted-foreground hover:text-foreground")}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {back.label}
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-balance text-[24px] font-extrabold leading-tight tracking-tight text-foreground sm:text-[26px]">
            {r.materials.join(", ")}
          </h2>
          <p className="mt-1 text-[14px] text-muted-foreground">
            {!isOwner && <>{r.ownerName} · </>}Gửi lúc {formatDateTime(r.createdAt)}
          </p>
        </div>
        <PickupBadge status={r.status} className="px-3 py-1.5 text-[13px]" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="flex flex-col gap-6">
          <section aria-labelledby="timeline" className="rounded-2xl border border-border bg-card p-5">
            <h3 id="timeline" className="mb-4 text-[16px] font-bold text-foreground">
              Tiến độ
            </h3>
            <PickupTimeline request={r} />
          </section>
          <RequestInfo request={r} />
        </div>

        <div className="flex flex-col gap-6">
          {r.team && <TeamCard request={r} />}
          {r.weighLines && <WeighCard request={r} />}
          {buyerCanAct && !isFinal(r.status) && <PickupOpsPanel request={r} />}
          {isOps && !isFinal(r.status) && (
            <p className="rounded-2xl border border-border bg-muted/50 p-4 text-[14px] text-muted-foreground">
              Người mua (vựa, ve chai) tự nhận và làm đơn. Ban điều hành chỉ theo dõi; đơn chờ lâu thì liên hệ người mua ở {r.area}.
            </p>
          )}
          {isOwner && !isFinal(r.status) && <DemoBox request={r} />}
          {isOwner && canCancel(r.status) && <CancelBox request={r} />}
        </div>
      </div>
    </PageContainer>
  );
}

function RequestInfo({ request: r }: { request: PickupRequest }) {
  return (
    <section aria-labelledby="info" className="rounded-2xl border border-border bg-card p-5">
      <h3 id="info" className="text-[16px] font-bold text-foreground">
        Thông tin đã gửi
      </h3>
      <dl className="mt-3 grid gap-x-4 gap-y-3 text-[14px] sm:grid-cols-[auto_minmax(0,1fr)]">
        <dt className="text-muted-foreground">Khối lượng ước tính</dt>
        <dd className="font-semibold text-foreground">{r.quantity}</dd>
        <dt className="text-muted-foreground">Địa chỉ</dt>
        <dd className="font-semibold text-foreground">{[r.address, r.area].filter(Boolean).join(", ")}</dd>
        <dt className="text-muted-foreground">Giờ có nhà</dt>
        <dd className="font-semibold text-foreground">{r.time}</dd>
        <dt className="text-muted-foreground">Phân loại sẵn</dt>
        <dd className="font-semibold text-foreground">{r.presorted ? "Có" : "Chưa"}</dd>
        {r.note && (
          <>
            <dt className="text-muted-foreground">Ghi chú</dt>
            <dd className="text-foreground">“{r.note}”</dd>
          </>
        )}
      </dl>
      {r.photos.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {r.photos.map((src, i) => (
            <SmartImage key={i} src={src} alt={`Ảnh ${i + 1} người gửi chụp`} className="aspect-square rounded-xl border border-border" sizes="160px" />
          ))}
        </div>
      )}
    </section>
  );
}

function TeamCard({ request: r }: { request: PickupRequest }) {
  return (
    <section aria-labelledby="team" className="rounded-2xl border border-border bg-card p-5">
      <h3 id="team" className="flex items-center gap-2 text-[16px] font-bold text-foreground">
        <Truck className="h-[18px] w-[18px] text-primary" aria-hidden="true" />
        {r.team!.name}
      </h3>
      <ul className="mt-3 flex flex-col gap-2 text-[14px] text-foreground">
        {r.appointment && (
          <li className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            Hẹn tới lúc <strong>{formatDateTime(r.appointment)}</strong>
          </li>
        )}
        <li className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <span className="font-mono">{r.team!.phoneMasked}</span>
          <span className="text-[12px] text-muted-foreground">(bản demo che số)</span>
        </li>
        <li className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          {r.area}
        </li>
      </ul>
    </section>
  );
}

function WeighCard({ request: r }: { request: PickupRequest }) {
  const lines = r.weighLines ?? [];
  return (
    <section aria-labelledby="weigh" className="rounded-2xl border border-border bg-card p-5">
      <h3 id="weigh" className="flex items-center gap-2 text-[16px] font-bold text-foreground">
        <Scale className="h-[18px] w-[18px] text-primary" aria-hidden="true" />
        Kết quả cân
      </h3>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[320px] text-[14px]">
          <thead>
            <tr className="border-b border-border text-left text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
              <th scope="col" className="py-2 pr-2 font-semibold">Loại</th>
              <th scope="col" className="py-2 pr-2 text-right font-semibold">Kg</th>
              <th scope="col" className="py-2 pr-2 text-right font-semibold">Đơn giá</th>
              <th scope="col" className="py-2 text-right font-semibold">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.material} className="border-b border-border/60">
                <td className="py-2 pr-2 text-foreground">{l.material}</td>
                <td className="py-2 pr-2 text-right tabular-nums">{l.kg.toLocaleString("vi-VN")}</td>
                <td className="py-2 pr-2 text-right tabular-nums text-muted-foreground">{formatPrice(l.pricePerKg)}</td>
                <td className="py-2 text-right font-semibold tabular-nums">{formatPrice(Math.round(l.kg * l.pricePerKg))}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold text-foreground">
              <td className="pt-2">Tổng</td>
              <td className="pt-2 text-right tabular-nums">{totalKg(lines).toLocaleString("vi-VN")}</td>
              <td />
              <td className="pt-2 text-right tabular-nums">{formatPrice(totalAmount(lines))}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="mt-3 text-[13px] text-muted-foreground">
        Người mua {r.sortedConfirmed ? "xác nhận đồ đã được phân loại đúng." : "ghi nhận đồ chưa được phân loại."}
      </p>
      {r.payout && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-accent px-4 py-3">
          <p className="text-[14px] text-foreground">
            {PAYOUT_LABEL[r.payout.method]}
            {r.payout.method !== "quy-diem" && <> · <strong>{formatPrice(r.payout.amount)}</strong></>}
          </p>
          <Link href={ROUTES.points} className="flex items-center gap-1.5 text-[14px] font-bold text-primary hover:underline">
            <Coins className="h-4 w-4" aria-hidden="true" />+{r.payout.points} điểm
          </Link>
        </div>
      )}
    </section>
  );
}

/** Người gửi tự xem hết vòng mà không cần đổi sang vai trò vận hành. */
function DemoBox({ request: r }: { request: PickupRequest }) {
  const { assign, depart, weigh, finish } = useCollect();
  const { partners } = usePartners();
  const toast = useToast();
  const [method, setMethod] = useState<PayoutMethod>("tien-mat");

  const next = () => {
    if (r.status === "cho-nhan") {
      const teams = partners.filter((p) => p.kind === "thu-gom" && p.active);
      const team = teams.find((p) => p.areas.includes(r.area)) ?? teams[0];
      if (!team) return toast("error", "Chưa có người mua nào đang hoạt động");
      assign(r.id, { id: team.id, name: team.name, phoneMasked: team.phoneMasked }, tomorrowNine().toISOString());
      toast("success", `${team.name} đã nhận đơn`, "Hẹn 9 giờ sáng mai.");
    } else if (r.status === "da-nhan") {
      depart(r.id);
      toast("info", "Người mua đang trên đường tới");
    } else if (r.status === "dang-den") {
      // Giả lập: mỗi loại 5kg theo giá tham khảo
      weigh(
        r.id,
        r.materials.map((m) => ({ material: m, kg: 5, pricePerKg: MATERIAL_PRICE_PER_KG[m] ?? 2000 })),
        r.presorted
      );
      toast("success", "Đã cân xong", "Chọn cách nhận tiền để hoàn tất.");
    } else if (r.status === "da-can") {
      const pts = pickupPoints(r.weighLines ?? [], !!r.sortedConfirmed, method, POINT_RULES);
      finish(r.id, method);
      toast("success", "Hoàn tất", `+${pts.kg + pts.sorted + pts.cash} điểm đã vào tài khoản của bạn.`);
    }
  };

  return (
    <section aria-labelledby="demo" className="rounded-2xl border border-dashed border-primary/40 bg-accent/50 p-5">
      <h3 id="demo" className="flex items-center gap-2 text-[16px] font-bold text-foreground">
        <FlaskConical className="h-[18px] w-[18px] text-primary" aria-hidden="true" />
        Chế độ demo
      </h3>
      <p className="mt-1 text-[14px] text-muted-foreground">
        Bản thật, các bước này do người mua (vựa, ve chai) bấm. Ở bản demo bạn tự chuyển để xem hết quy trình.
      </p>
      {r.status === "da-can" && (
        <div className="mt-4">
          <p className="mb-2 text-[14px] font-semibold text-foreground">Bạn muốn nhận tiền thế nào?</p>
          <PayoutChoice request={r} method={method} onChange={setMethod} name={`demo-pay-${r.id}`} />
        </div>
      )}
      <button type="button" onClick={next} className={cn(buttonClass.primary, "mt-4 w-full sm:w-auto")}>
        {r.status === "da-can" ? "Nhận tiền và hoàn tất" : "Chuyển sang bước tiếp theo"}
      </button>
    </section>
  );
}

function CancelBox({ request: r }: { request: PickupRequest }) {
  const { cancel } = useCollect();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [other, setOther] = useState("");
  const [error, setError] = useState("");

  const confirm = () => {
    const text = reason === "khac" ? other.trim() : reason;
    if (!text) return setError(reason === "khac" ? "Ghi lý do giúp người mua" : "Chọn một lý do");
    cancel(r.id, text);
    setOpen(false);
    toast("info", "Đã hủy yêu cầu", text);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(buttonClass.secondary, "w-full hover:border-destructive/50 hover:text-destructive sm:w-auto sm:self-start")}
      >
        <XCircle className="h-[18px] w-[18px]" aria-hidden="true" />
        Hủy yêu cầu
      </button>
      <GcModal open={open} onClose={() => setOpen(false)} title="Hủy yêu cầu thu gom?" description="Đội thu gom sẽ nhận được thông báo hủy." size="sm">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Lý do hủy">
          {[...CANCEL_REASONS, "khac"].map((c) => (
            <ChoiceChip
              key={c}
              selected={reason === c}
              onClick={() => {
                setReason(c);
                setError("");
              }}
            >
              {c === "khac" ? "Lý do khác" : c}
            </ChoiceChip>
          ))}
        </div>
        {reason === "khac" && (
          <>
            <label htmlFor="cancel-other" className="sr-only">
              Lý do khác
            </label>
            <textarea
              id="cancel-other"
              rows={2}
              value={other}
              onChange={(e) => setOther(e.target.value)}
              placeholder="Ghi ngắn lý do…"
              className={cn(inputClass(), "mt-3 h-auto resize-none py-3")}
            />
          </>
        )}
        <FieldError msg={error} />
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => setOpen(false)} className={buttonClass.secondary}>
            Giữ yêu cầu
          </button>
          <button
            type="button"
            onClick={confirm}
            className={cn(buttonClass.primary, "bg-destructive text-destructive-foreground hover:bg-destructive/90")}
          >
            Hủy yêu cầu
          </button>
        </div>
      </GcModal>
    </>
  );
}
