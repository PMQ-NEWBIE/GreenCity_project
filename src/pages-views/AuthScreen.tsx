"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MailCheck } from "lucide-react";
import { useApp } from "@/store/app-store";
import { Logo } from "@/components/greencity/Logo";
import { AuthField } from "@/components/greencity/AuthField";
import { SubmitButton } from "@/components/greencity/SubmitButton";
import { ThemeToggle } from "@/components/greencity/ThemeToggle";
import { LOBBY_ASSETS } from "@/lobby/assets";
import { NEXT_PARAM, ROUTES } from "@/lib/routes";
import { roleFromEmail } from "@/lib/access";
import { ROLE_LABEL } from "@/data/labels";
import { isEmailFormat } from "@/utils/format";
import type { DemoUser, UserRole } from "@/types";

export type AuthMode = "login" | "register" | "forgot";

const COPY: Record<AuthMode, { title: string; lead: string }> = {
  login: {
    title: "Đăng nhập",
    lead: "Vào lại tài khoản để xem tin đăng, yêu cầu thu gom và những món bạn đã lưu.",
  },
  register: {
    title: "Tạo tài khoản",
    lead: "Miễn phí, chưa tới một phút. Xong là bạn đăng bán hoặc gọi thu gom được ngay.",
  },
  forgot: {
    title: "Quên mật khẩu",
    lead: "Nhập email bạn đã dùng để đăng ký, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.",
  },
};

/** "quan.tran" → "Quan Tran" (tên tạm lấy từ email khi đăng nhập) */
function nameFromEmail(email: string) {
  return email
    .split("@")[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Tài khoản demo cho từng vai trò (email quyết định vai trò — xem roleFromEmail). */
const DEMO_ACCOUNTS: Record<UserRole, { email: string; name: string }> = {
  resident: { email: "demo@greencity.vn", name: "Demo" },
  collaborator: { email: "ctv@greencity.vn", name: "Cộng tác viên Hòa" },
  business: { email: "doanhnghiep@greencity.vn", name: "Tái chế Phương Nam" },
  operator: { email: "vanhanh@greencity.vn", name: "Tổ vận hành" },
};

function demoNameFor(email: string): string | null {
  const hit = Object.values(DEMO_ACCOUNTS).find((a) => a.email === email.trim().toLowerCase());
  return hit && hit.name !== "Demo" ? hit.name : null;
}

function memberSinceLabel() {
  const d = new Date();
  return `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`;
}

/* ------------------------------ Ảnh bên trái ------------------------------ */

function SidePanel() {
  return (
    <div className="relative hidden overflow-hidden bg-gc-800 lg:block">
      {/* Ảnh minh họa — thay file tại public/lobby (xem src/lobby/assets.ts) */}
      <Image
        src={LOBBY_ASSETS.authPanel.src}
        alt={LOBBY_ASSETS.authPanel.alt}
        fill
        sizes="(min-width: 1280px) calc(100vw - 640px), (min-width: 1024px) calc(100vw - 560px), 0px"
        quality={70}
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-gc-950/90 via-gc-950/30 to-transparent" />
      <div className="relative flex h-full flex-col justify-between p-12">
        <Link href={ROUTES.home} aria-label="Về trang chủ Green City" className="w-fit rounded-full">
          <Logo size={44} variant="white" />
        </Link>
        <figure className="max-w-md text-white">
          <blockquote className="text-[26px] font-bold leading-snug">
            “Một chồng báo cũ, vài túi lon nhôm — đủ cho một chuyến xe thu gom ghé qua.”
          </blockquote>
          <figcaption className="mt-4 text-[15px] text-gc-200">
            Green City nối bạn với người thu gom ve chai ngay trong khu phố.
          </figcaption>
        </figure>
      </div>
    </div>
  );
}

/* --------------------------------- Màn hình -------------------------------- */

/** next: trang cần quay lại sau khi đăng nhập (đã được kiểm tra an toàn ở page server). */
export function AuthScreen({ mode, next }: { mode: AuthMode; next: string | null }) {
  const { state, login, toast } = useApp();
  const router = useRouter();
  const withNext = (path: string) => (next ? `${path}?${NEXT_PARAM}=${encodeURIComponent(next)}` : path);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [forgotSent, setForgotSent] = useState(false);

  // Đã đăng nhập rồi thì không ở lại trang đăng nhập
  useEffect(() => {
    if (state.ready && state.user && mode !== "forgot") router.replace(next ?? ROUTES.dashboard);
  }, [state.ready, state.user, mode, next, router]);

  const clearError = (key: string) => setErrors((er) => (er[key] ? { ...er, [key]: "" } : er));

  const fillDemo = (role: UserRole = "resident") => {
    if (mode === "register") {
      setName("Trần Minh Quân");
      setEmail("quan.tran@example.vn");
      setPassword("xanh2026");
      setConfirm("xanh2026");
    } else {
      setEmail(DEMO_ACCOUNTS[role].email);
      setPassword("matkhau123");
    }
    setErrors({});
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (mode === "register" && name.trim().length < 2) errs.name = "Họ và tên cần ít nhất 2 ký tự";
    if (!email.trim()) errs.email = "Vui lòng nhập email";
    else if (!isEmailFormat(email)) errs.email = "Email chưa đúng định dạng, ví dụ: ten@gmail.com";
    if (mode !== "forgot") {
      if (!password) errs.password = "Vui lòng nhập mật khẩu";
      else if (password.length < 6) errs.password = "Mật khẩu cần ít nhất 6 ký tự";
    }
    if (mode === "register" && confirm !== password) errs.confirm = "Hai mật khẩu chưa giống nhau";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "idle" || !validate()) return;

    setStatus("loading");
    window.setTimeout(() => {
      if (mode === "forgot") {
        setStatus("idle");
        setForgotSent(true);
        return;
      }
      const user: DemoUser = {
        name: mode === "register" ? name.trim() : (demoNameFor(email) ?? nameFromEmail(email)),
        email: email.trim(),
        memberSince: memberSinceLabel(),
        role: roleFromEmail(email),
      };
      setStatus("success");
      // "Ghi nhớ đăng nhập" chỉ có ở màn đăng nhập; đăng ký luôn ghi nhớ
      login(user, mode === "login" ? remember : true);
      toast("success", mode === "register" ? "Tạo tài khoản xong" : "Đăng nhập thành công", `Chào ${user.name}!`);
      router.replace(next ?? ROUTES.dashboard);
    }, 600);
  };

  const copy = COPY[mode];

  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] xl:grid-cols-[minmax(0,1fr)_640px]">
      <SidePanel />

      <div className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between gap-3">
          <Link href={ROUTES.home} className="flex items-center gap-1.5 rounded-lg py-2 text-[14px] font-semibold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Trang chủ
          </Link>
          <ThemeToggle />
        </div>

        <main className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-10">
          <Link href={ROUTES.home} aria-label="Về trang chủ Green City" className="mb-8 w-fit rounded-xl lg:hidden">
            <Logo size={44} />
          </Link>

          <h1 className="text-[28px] font-extrabold tracking-tight text-foreground">{copy.title}</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{copy.lead}</p>

          {mode === "forgot" && forgotSent ? (
            <div className="mt-8 rounded-2xl border border-primary/30 bg-accent p-6" role="status">
              <MailCheck className="h-8 w-8 text-primary" aria-hidden="true" />
              <p className="mt-3 text-[16px] font-bold text-foreground">Đã gửi hướng dẫn</p>
              <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">
                Nếu <strong className="text-foreground">{email}</strong> có trong hệ thống, bạn sẽ nhận được email
                trong vài phút. (Bản demo không gửi email thật.)
              </p>
              <Link
                href={withNext(ROUTES.login)}
                className="mt-5 flex h-12 items-center justify-center rounded-xl bg-primary text-[15px] font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Quay lại đăng nhập
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="mt-8 flex flex-col gap-5">
              {mode === "register" && (
                <AuthField
                  label="Họ và tên"
                  autoComplete="name"
                  value={name}
                  error={errors.name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearError("name");
                  }}
                />
              )}
              <AuthField
                label="Email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="ten@gmail.com"
                value={email}
                error={errors.email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError("email");
                }}
              />
              {mode !== "forgot" && (
                <AuthField
                  label="Mật khẩu"
                  type="password"
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                  hint={mode === "register" ? "Ít nhất 6 ký tự" : undefined}
                  value={password}
                  error={errors.password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError("password");
                  }}
                />
              )}
              {mode === "register" && (
                <AuthField
                  label="Nhập lại mật khẩu"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  error={errors.confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    clearError("confirm");
                  }}
                />
              )}

              {mode === "login" && (
                <div className="flex items-center justify-between gap-3">
                  <label className="flex cursor-pointer items-center gap-2.5 py-1 text-[14px] text-foreground">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-5 w-5 accent-primary"
                    />
                    Ghi nhớ đăng nhập
                  </label>
                  <Link href={withNext(ROUTES.forgot)} className="rounded py-1 text-[14px] font-semibold text-primary hover:underline">
                    Quên mật khẩu?
                  </Link>
                </div>
              )}

              <SubmitButton
                status={status}
                loadingText={mode === "forgot" ? "Đang gửi..." : "Đang xử lý..."}
                successText={mode === "register" ? "Đã tạo tài khoản" : "Đã đăng nhập"}
                className="mt-1"
              >
                {mode === "login" ? "Đăng nhập" : mode === "register" ? "Tạo tài khoản" : "Gửi hướng dẫn"}
              </SubmitButton>

              {mode !== "forgot" && (
                <button
                  type="button"
                  onClick={() => fillDemo()}
                  className="rounded-lg py-1 text-[14px] font-medium text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                >
                  Chỉ xem thử? Điền sẵn tài khoản demo
                </button>
              )}
              {mode === "login" && (
                <p className="-mt-3 flex flex-wrap items-center justify-center gap-x-1 text-[13px] text-muted-foreground">
                  <span>Hoặc thử vai trò:</span>
                  {(["collaborator", "business", "operator"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => fillDemo(r)}
                      className="min-h-11 rounded-lg px-1.5 font-semibold text-primary underline-offset-4 hover:underline"
                    >
                      {ROLE_LABEL[r]}
                    </button>
                  ))}
                </p>
              )}
            </form>
          )}

          <p className="mt-8 border-t border-border pt-6 text-center text-[15px] text-muted-foreground">
            {mode === "register" ? (
              <>
                Đã có tài khoản?{" "}
                <Link href={withNext(ROUTES.login)} className="font-bold text-primary hover:underline">
                  Đăng nhập
                </Link>
              </>
            ) : (
              <>
                Chưa có tài khoản?{" "}
                <Link href={withNext(ROUTES.register)} className="font-bold text-primary hover:underline">
                  Đăng ký miễn phí
                </Link>
              </>
            )}
          </p>
        </main>

        <p className="text-center text-[12px] text-muted-foreground">
          Bản demo cho đồ án — đăng nhập được mô phỏng, dữ liệu chỉ lưu trên trình duyệt này.
        </p>
      </div>
    </div>
  );
}
