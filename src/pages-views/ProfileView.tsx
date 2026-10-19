"use client";

import { useState } from "react";
import Link from "next/link";
import { FlaskConical, LogOut, MapPin, Package, Pencil, Truck } from "lucide-react";
import { useApp } from "@/store/app-store";
import { SmartImage } from "@/components/greencity/SmartImage";
import { EmptyState } from "@/components/greencity/EmptyState";
import { ThemeToggle } from "@/components/greencity/ThemeToggle";
import { FieldError, PageContainer, buttonClass, inputClass } from "@/components/greencity/ui";
import { RequestItem } from "./CollectView";
import { ROUTES } from "@/lib/routes";
import { ROLE_LABEL } from "@/data/labels";
import type { UserRole } from "@/types";
import { formatHoursAgo, formatPrice, initialsOf, isEmailFormat } from "@/utils/format";
import { cn } from "@/lib/utils";

type Tab = "listings" | "requests";

const ROLES: { key: UserRole; desc: string }[] = [
  { key: "resident", desc: "Bán ve chai, gọi thu gom, tích điểm đổi quà." },
  { key: "collaborator", desc: "Kiểm tra lượt bỏ thùng, xác minh báo cáo điểm rác." },
  { key: "business", desc: "Xem và đặt giữ lô vật liệu đã kiểm định, xem thống kê." },
  { key: "operator", desc: "Quản lý đơn thu gom, thùng, điểm thưởng và đối tác." },
];

export function ProfileView() {
  const { state, removeProduct, updateUser, logout, setRole, toast } = useApp();
  const user = state.user!;
  const [tab, setTab] = useState<Tab>("listings");
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [editError, setEditError] = useState("");

  const myListings = state.products.filter((p) => p.isMine);
  const myRequests = state.requests.filter((r) => r.isMine);

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return setEditError("Tên cần ít nhất 2 ký tự");
    if (!isEmailFormat(email)) return setEditError("Email chưa đúng định dạng");
    setEditError("");
    updateUser(name.trim(), email.trim());
    setEditing(false);
    toast("success", "Đã lưu thông tin");
  };

  // AppShell tự đưa về trang chủ sau khi đăng xuất
  const onLogout = () => {
    logout();
    toast("info", "Đã đăng xuất", "Hẹn gặp lại bạn.");
  };

  const tabs: { key: Tab; label: string; count: number; icon: typeof Package }[] = [
    { key: "listings", label: "Tin đã đăng", count: myListings.length, icon: Package },
    { key: "requests", label: "Yêu cầu thu gom", count: myRequests.length, icon: Truck },
  ];

  return (
    <PageContainer className="max-w-4xl">
      {/* Thông tin cá nhân */}
      <section aria-label="Thông tin cá nhân" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary text-[28px] font-extrabold text-primary-foreground">
            {initialsOf(user.name)}
          </span>
          {editing ? (
            <form onSubmit={saveProfile} className="flex flex-1 flex-col gap-3">
              <div>
                <label htmlFor="pf-name" className="mb-1.5 block text-[14px] font-semibold">
                  Họ và tên
                </label>
                <input id="pf-name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass()} />
              </div>
              <div>
                <label htmlFor="pf-email" className="mb-1.5 block text-[14px] font-semibold">
                  Email
                </label>
                <input id="pf-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass()} />
              </div>
              <FieldError msg={editError} />
              <div className="flex gap-2">
                <button type="submit" className={buttonClass.primary}>
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setName(user.name);
                    setEmail(user.email);
                    setEditError("");
                  }}
                  className={buttonClass.secondary}
                >
                  Hủy
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-[24px] font-extrabold tracking-tight text-foreground">{user.name}</h2>
                <p className="mt-1 truncate text-[15px] text-muted-foreground">{user.email}</p>
                <p className="mt-1 text-[14px] text-muted-foreground">Thành viên từ {user.memberSince}</p>
              </div>
              <button type="button" onClick={() => setEditing(true)} className={buttonClass.secondary}>
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Sửa thông tin
              </button>
            </>
          )}
        </div>
      </section>

      {/* Tin đăng & yêu cầu */}
      <div className="mt-8 flex gap-2 border-b border-border" role="tablist" aria-label="Hoạt động của bạn">
        {tabs.map((t) => (
          <button
            key={t.key}
            id={`tab-${t.key}`}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            aria-controls={`panel-${t.key}`}
            onClick={() => setTab(t.key)}
            className={cn(
              "-mb-px flex min-h-12 items-center gap-2 border-b-2 px-3 text-[15px] font-semibold transition-colors",
              tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <t.icon className="h-[18px] w-[18px]" aria-hidden="true" />
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="mt-5">
        {tab === "listings" ? (
          myListings.length > 0 ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {myListings.map((p) => (
                <li key={p.id} className="flex gap-4 rounded-2xl border border-border bg-card p-3">
                  <SmartImage src={p.image} alt="" className="h-20 w-24 shrink-0 rounded-xl" sizes="96px" />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2">
                      <Link href={ROUTES.product(p.id)} className="truncate text-[15px] font-bold text-foreground hover:text-primary">
                        {p.name}
                      </Link>
                      {p.status === "draft" && (
                        <span className="shrink-0 rounded-full bg-earth/15 px-2 py-0.5 text-[11px] font-bold text-earth">Nháp</span>
                      )}
                    </p>
                    <p className="mt-0.5 text-[14px] font-bold text-primary">{formatPrice(p.price, p.unit)}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[12px] text-muted-foreground">
                      <MapPin className="h-3 w-3" aria-hidden="true" />
                      {p.area} · {formatHoursAgo(p.postedHoursAgo)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      removeProduct(p.id);
                      toast("success", "Đã xóa tin", p.name);
                    }}
                    aria-label={`Xóa tin ${p.name}`}
                    className="self-center rounded-xl px-3 py-2 text-[13px] font-semibold text-destructive hover:bg-destructive/10"
                  >
                    Xóa
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Package}
              title="Bạn chưa đăng tin nào"
              description="Nhà có giấy báo cũ, chai nhựa hay đồ điện hỏng? Đăng bán chỉ mất khoảng một phút."
              action={
                <Link href={ROUTES.sell} className={buttonClass.primary}>
                  Đăng tin đầu tiên
                </Link>
              }
            />
          )
        ) : myRequests.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {myRequests.map((r) => (
              <RequestItem key={r.id} request={r} />
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Truck}
            title="Chưa có yêu cầu thu gom"
            description="Có đồ cồng kềnh hay vài bao ve chai? Gửi yêu cầu để người thu gom tới tận nhà."
            action={
              <Link href={ROUTES.collect} className={buttonClass.primary}>
                Gọi thu gom
              </Link>
            }
          />
        )}
      </div>

      {/* Bản demo: đổi vai trò để xem các khu cộng tác viên, doanh nghiệp, vận hành */}
      <section aria-labelledby="demo-role" className="mt-10 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h3 id="demo-role" className="flex items-center gap-2 text-[16px] font-bold text-foreground">
          <FlaskConical className="h-[18px] w-[18px] text-primary" aria-hidden="true" />
          Chế độ demo: đổi vai trò
        </h3>
        <p className="mt-1 text-[14px] text-muted-foreground">
          Bản thật mỗi tài khoản có một vai trò cố định. Ở bản demo bạn đổi qua lại để xem từng khu.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-labelledby="demo-role">
          {ROLES.map((r) => (
            <label
              key={r.key}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors",
                user.role === r.key ? "border-primary bg-accent" : "border-border hover:border-primary/40"
              )}
            >
              <input
                type="radio"
                name="demo-role"
                value={r.key}
                checked={user.role === r.key}
                onChange={() => {
                  setRole(r.key);
                  toast("success", `Đã chuyển sang vai trò ${ROLE_LABEL[r.key].toLowerCase()}`);
                }}
                className="mt-0.5 h-5 w-5 accent-primary"
              />
              <span>
                <span className="block text-[15px] font-bold text-foreground">{ROLE_LABEL[r.key]}</span>
                <span className="block text-[13px] text-muted-foreground">{r.desc}</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      {/* Cài đặt */}
      <section aria-labelledby="settings" className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h3 id="settings" className="text-[16px] font-bold text-foreground">
          Giao diện
        </h3>
        <p className="mt-1 text-[14px] text-muted-foreground">Chọn nền sáng, tối hoặc theo cài đặt của máy.</p>
        <ThemeToggle variant="segmented" className="mt-4" />
      </section>

      <button type="button" onClick={onLogout} className={cn(buttonClass.secondary, "mt-6 w-full hover:border-destructive/50 hover:text-destructive sm:w-auto")}>
        <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
        Đăng xuất
      </button>
    </PageContainer>
  );
}
