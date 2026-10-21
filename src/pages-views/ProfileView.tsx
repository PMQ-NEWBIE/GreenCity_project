"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Inbox, LogOut, Package, Pencil, ShoppingBag, Truck } from "lucide-react";
import { useApp } from "@/store/app-store";
import { useOrders } from "@/store/use-orders";
import { ThemeToggle } from "@/components/greencity/ThemeToggle";
import { FieldError, PageContainer, buttonClass, inputClass } from "@/components/greencity/ui";
import { useCollect } from "@/store/hooks";
import { homeFor } from "@/lib/access";
import { DemoRolePicker } from "./shell-parts";
import { ROUTES } from "@/lib/routes";
import { ROLE_LABEL } from "@/data/labels";
import type { UserRole } from "@/types";
import { initialsOf, isEmailFormat } from "@/utils/format";
import { cn } from "@/lib/utils";

export function ProfileView() {
  const { state, updateUser, logout, setRole, toast } = useApp();
  const router = useRouter();
  const user = state.user!;
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [editError, setEditError] = useState("");

  const myListings = state.products.filter((p) => p.isMine).length;
  const { mine: myRequests } = useCollect();
  const { incoming, bought } = useOrders();

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

  // Bản demo: vai trò khác làm việc ở khu riêng → chuyển luôn sang đó
  const pickRole = (r: UserRole) => {
    setRole(r);
    toast("success", `Đã chuyển sang vai trò ${ROLE_LABEL[r].toLowerCase()}`);
    if (r !== "resident") router.replace(homeFor(r));
  };

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

      {/* Lối tắt tới hoạt động — mỗi thứ nằm ở chế độ của nó */}
      <nav aria-label="Hoạt động của bạn" className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { href: ROUTES.myListings, icon: Package, label: "Tin đăng của tôi", value: myListings },
          { href: ROUTES.sellerOrders, icon: Inbox, label: "Đơn đến", value: incoming.length },
          { href: ROUTES.buyerOrders, icon: ShoppingBag, label: "Đơn mua", value: bought.length },
          { href: ROUTES.collect, icon: Truck, label: "Yêu cầu thu gom", value: myRequests.length },
        ].map((l) => (
          <Link key={l.href} href={l.href} className="rounded-2xl border border-border bg-card p-4 hover:border-primary/50">
            <l.icon className="h-5 w-5 text-primary" aria-hidden="true" />
            <span className="mt-2 block text-[13px] font-medium text-muted-foreground">{l.label}</span>
            <span className="mt-0.5 block text-[22px] font-extrabold leading-none text-foreground">{l.value}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-6">
        <DemoRolePicker role={user.role} onPick={pickRole} />
      </div>

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
