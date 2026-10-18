"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Check,
  Clock,
  Mail,
  MapPin,
  Package,
  Pencil,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import { useApp } from "@/store/app-store";
import { SmartImage } from "@/components/greencity/SmartImage";
import { EmptyState } from "@/components/greencity/EmptyState";
import { Reveal } from "@/components/greencity/Reveal";
import { formatHoursAgo, formatPrice, initialsOf, isEmailFormat } from "@/utils/format";
import { cn } from "@/lib/utils";

export function ProfileView() {
  const { state, goApp, removeProduct, updateUser, toast } = useApp();
  const user = state.user!;
  const [tab, setTab] = useState<"listings" | "requests">("listings");
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [editError, setEditError] = useState("");

  const myListings = state.products.filter((p) => p.isMine);
  const myRequests = state.requests.filter((r) => r.isMine);

  const saveProfile = () => {
    if (name.trim().length < 2) {
      setEditError("Tên cần tối thiểu 2 ký tự");
      return;
    }
    if (!isEmailFormat(email)) {
      setEditError("Email chưa đúng định dạng");
      return;
    }
    setEditError("");
    updateUser(name.trim(), email.trim());
    setEditing(false);
    toast("success", "Đã cập nhật hồ sơ (demo)", "Thay đổi áp dụng cho phiên trình duyệt này.");
  };

  return (
    <div className="nice-scroll h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Thẻ hồ sơ */}
        <Reveal>
          <div className="relative overflow-hidden rounded-[28px] border border-border/70 bg-white p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-mint/20 blur-2xl" />
            <div className="pointer-events-none absolute -left-10 -bottom-14 h-36 w-36 rounded-full bg-accent/70 blur-2xl" />
            <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[26px] bg-gradient-to-b from-[#2a9a5d] to-primary text-[32px] font-extrabold text-white shadow-xl shadow-primary/25">
                {initialsOf(user.name)}
              </span>
              <div className="min-w-0 flex-1">
                {editing ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2.5 rounded-2xl border-[1.5px] border-primary/50 bg-white px-4">
                      <UserRound className="h-4.5 w-4.5 text-primary/70" />
                      <input
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setEditError("");
                        }}
                        aria-label="Họ và tên"
                        className="h-11 w-full bg-transparent text-[15px] font-bold text-forest outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2.5 rounded-2xl border-[1.5px] border-primary/50 bg-white px-4">
                      <Mail className="h-4.5 w-4.5 text-primary/70" />
                      <input
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setEditError("");
                        }}
                        aria-label="Email"
                        className="h-11 w-full bg-transparent text-[14px] font-semibold text-forest outline-none"
                      />
                    </div>
                    {editError && (
                      <p className="pl-1 text-[12.5px] font-medium text-destructive">{editError}</p>
                    )}
                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={saveProfile}
                        className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-md shadow-primary/25 transition-all hover:-translate-y-0.5"
                      >
                        <Check className="h-4 w-4" />
                        Lưu thay đổi
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(false);
                          setName(user.name);
                          setEmail(user.email);
                          setEditError("");
                        }}
                        className="flex items-center gap-2 rounded-2xl border border-border bg-white px-5 py-2.5 text-[13.5px] font-semibold text-muted-foreground transition-colors hover:bg-muted"
                      >
                        <X className="h-4 w-4" />
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="flex items-center gap-2.5 text-[24px] font-extrabold tracking-tight text-forest">
                      <span className="truncate">{user.name}</span>
                      <BadgeCheck className="h-6 w-6 shrink-0 text-primary" />
                    </h2>
                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-[13.5px] text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary/70" />
                        {user.email}
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary/70" />
                        TP. Hồ Chí Minh (giả lập)
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary/70" />
                        Thành viên {user.memberSince}
                      </span>
                    </div>
                  </>
                )}
              </div>
              {!editing && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="flex h-11 shrink-0 items-center gap-2 rounded-2xl border-[1.5px] border-primary/30 bg-accent/50 px-4 text-[13.5px] font-semibold text-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent"
                >
                  <Pencil className="h-4 w-4" />
                  Chỉnh sửa hồ sơ
                </button>
              )}
            </div>
          </div>
        </Reveal>

        {/* Tabs */}
        <div className="mt-8 flex gap-2.5">
          {(
            [
              { key: "listings", label: `Tin đã đăng (${myListings.length})`, icon: Package },
              { key: "requests", label: `Yêu cầu thu gom (${myRequests.length})`, icon: Truck },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "relative flex items-center gap-2 rounded-2xl px-4 py-3 text-[14px] font-semibold transition-colors duration-200",
                tab === t.key ? "text-primary" : "text-muted-foreground hover:bg-muted"
              )}
            >
              <t.icon className="h-4.5 w-4.5" />
              {t.label}
              {tab === t.key && (
                <motion.span
                  layoutId="profile-tab"
                  className="absolute inset-x-3 -bottom-[9px] h-[3px] rounded-full bg-primary"
                />
              )}
            </button>
          ))}
        </div>
        <div className="h-px bg-border" />

        {/* Nội dung tab */}
        <div className="mt-6">
          {tab === "listings" ? (
            myListings.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {myListings.map((p, i) => (
                  <Reveal key={p.id} delay={Math.min(i * 0.06, 0.3)}>
                    <div className="group flex gap-4 rounded-2xl border border-border/70 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                      <SmartImage
                        src={p.image}
                        alt={p.name}
                        className="h-20 w-24 shrink-0 rounded-xl"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14.5px] font-bold text-forest">{p.name}</p>
                        <p className="mt-1 text-[13.5px] font-extrabold text-primary">
                          {formatPrice(p.price, p.unit)}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {p.area} • {formatHoursAgo(p.postedHoursAgo)}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => goApp("product", p.id)}
                          className="rounded-xl bg-accent px-3 py-1.5 text-[12px] font-bold text-primary transition-colors hover:bg-accent/70"
                        >
                          Xem tin
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            removeProduct(p.id);
                            toast("success", "Đã xóa tin đăng (demo)", p.name);
                          }}
                          className="flex items-center gap-1 rounded-xl bg-[#fdeeee] px-3 py-1.5 text-[12px] font-bold text-destructive transition-colors hover:bg-[#fbdcdc]"
                        >
                          <X className="h-3 w-3" />
                          Xóa
                        </button>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Package}
                title="Bạn chưa đăng tin nào"
                description="Biến món đồ cũ thành giá trị — đăng tin đầu tiên của bạn trong phiên demo này."
                action={
                  <button
                    type="button"
                    onClick={() => goApp("sell")}
                    className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-[14px] font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <Package className="h-4 w-4" />
                    Đăng tin đầu tiên
                  </button>
                }
              />
            )
          ) : myRequests.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {myRequests.map((r, i) => (
                <Reveal key={r.id} delay={Math.min(i * 0.06, 0.3)}>
                  <div className="rounded-2xl border border-primary/35 border-l-4 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[14.5px] font-bold text-forest">{r.materials.join(" + ")}</p>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold",
                          r.status === "pending" && "bg-[#fdf3e3] text-warn",
                          r.status === "matched" && "bg-accent text-primary",
                          r.status === "done" && "bg-[#eef4ee] text-muted-foreground"
                        )}
                      >
                        {r.status === "pending" ? "Đang chờ" : r.status === "matched" ? "Đã ghép" : "Hoàn tất"}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[12.5px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {r.area}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {r.time}
                      </span>
                    </div>
                    {r.note && (
                      <p className="mt-2.5 rounded-xl bg-muted/70 px-3 py-2 text-[12.5px] italic leading-relaxed text-muted-foreground">
                        “{r.note}”
                      </p>
                    )}
                    <p className="mt-2.5 text-[11.5px] text-muted-foreground/70">
                      {formatHoursAgo(r.hoursAgo)}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Truck}
              title="Chưa có yêu cầu thu gom"
              description="Gửi yêu cầu để cộng đồng thu gom demo ghép với bạn — thử với vài kilogram giấy vụn."
              action={
                <button
                  type="button"
                  onClick={() => goApp("collect")}
                  className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-[14px] font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5"
                >
                  <Truck className="h-4 w-4" />
                  Gửi yêu cầu đầu tiên
                </button>
              }
            />
          )}
        </div>

        <p className="mt-10 text-center text-[12px] leading-relaxed text-muted-foreground/60">
          Hồ sơ demo — dữ liệu chỉ tồn tại trong trình duyệt của bạn và có thể reset bất cứ lúc nào.
        </p>
      </div>
    </div>
  );
}
