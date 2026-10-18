"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Chrome,
  Leaf,
  Lock,
  Mail,
  Recycle,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Truck,
  User,
} from "lucide-react";
import { useApp } from "@/store/app-store";
import { IMAGES } from "@/data/mock-data";
import { Logo, LogoMark } from "@/components/greencity/Logo";
import { SmartImage } from "@/components/greencity/SmartImage";
import { AuthField } from "@/components/greencity/AuthField";
import { SubmitButton } from "@/components/greencity/SubmitButton";
import { isEmailFormat } from "@/utils/format";
import { cn } from "@/lib/utils";
import type { DemoUser } from "@/types";

type AuthMode = "login" | "register" | "forgot";

/* ------------------------- Panel thương hiệu (trái) ------------------------ */

function BrandPanel({ mode }: { mode: AuthMode }) {
  const { goLanding } = useApp();

  return (
    <div className="brand-gradient-deep gradient-drift relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
      {/* Hình khối trang trí */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-mint/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-[420px] w-[420px] rounded-full bg-leaf/20 blur-3xl" />
      <div className="pointer-events-none absolute right-[12%] top-[38%] h-40 w-40 rounded-full border border-mint/20" />
      <div className="pointer-events-none absolute right-[16%] top-[42%] h-40 w-40 rounded-full border border-mint/12" />

      <div className="animate-leaf-slow pointer-events-none absolute bottom-[18%] left-[8%] text-mint/25">
        <Leaf className="h-20 w-20 -scale-x-100" strokeWidth={1.2} />
      </div>
      <div
        className="animate-leaf-float pointer-events-none absolute right-[24%] top-[14%] text-mint/30"
        style={{ animationDelay: "-5s" }}
      >
        <Recycle className="h-11 w-11" strokeWidth={1.4} />
      </div>

      {/* Top bar */}
      <div className="relative flex items-center justify-between">
        <Logo size={44} variant="white" />
        <button
          type="button"
          onClick={goLanding}
          className="flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-4 py-2.5 text-[13px] font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/20"
        >
          <ArrowLeft className="h-4 w-4" />
          Về trang chủ
        </button>
      </div>

      {/* Nội dung trung tâm */}
      <div className="relative z-10 flex flex-col items-start gap-8">
        <div className="max-w-md">
          <motion.h2
            key={`h-${mode}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="text-balance text-[34px] font-extrabold leading-[1.14] tracking-tight text-white xl:text-[38px]"
          >
            Cùng nhau kiến tạo <span className="text-mint">thành phố xanh.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 text-[15px] leading-relaxed text-mint/75"
          >
            Mỗi chai nhựa, mỗi tờ giấy cũ đều là một tài nguyên đang chờ được tái sinh. Green City
            kết nối bạn với cộng đồng thu gom — biến hành động nhỏ thành tác động lớn cho môi trường
            đô thị.
          </motion.p>
        </div>

        {/* Ảnh minh họa + thẻ nổi */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md"
        >
          <div className="overflow-hidden rounded-[28px] border-[3px] border-white/25 shadow-2xl">
            <SmartImage
              src={IMAGES.authLeaves}
              alt="Lá cây xanh mọc mầm — biểu tượng tái sinh"
              className="aspect-[16/9] w-full"
              priority
            />
          </div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="animate-leaf-float absolute -right-4 -top-7"
          >
            <div className="flex items-center gap-3 rounded-2xl border border-white/30 bg-white/95 p-3.5 shadow-xl backdrop-blur-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
                <TrendingUp className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[13px] font-bold text-forest">18,7 tấn tái chế</p>
                <p className="text-[11px] text-muted-foreground">qua nền tảng (demo)</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="animate-leaf-slow absolute -bottom-7 -left-4"
          >
            <div className="flex items-center gap-3 rounded-2xl border border-white/30 bg-white/95 p-3.5 shadow-xl backdrop-blur-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3ebe2] text-earth">
                <Truck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[13px] font-bold text-forest">Thu gom tận nơi</p>
                <p className="text-[11px] text-muted-foreground">trong 24 giờ (demo)</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom */}
      <div className="relative z-10 flex items-center justify-between text-mint/60">
        <span className="flex items-center gap-2 text-[12.5px] font-semibold uppercase tracking-[0.22em]">
          <Sparkles className="h-3.5 w-3.5" />
          Turn Waste Into Value
        </span>
        <span className="flex items-center gap-1.5 text-[12px]">
          <ShieldCheck className="h-4 w-4" />
          Website demo — không thu thập dữ liệu thật
        </span>
      </div>
    </div>
  );
}

/* --------------------------- Mobile brand band ---------------------------- */

function MobileBrandBand() {
  const { goLanding } = useApp();
  return (
    <div className="brand-gradient-deep gradient-drift relative overflow-hidden px-5 pb-7 pt-5 lg:hidden">
      <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-mint/15 blur-2xl" />
      <div className="animate-leaf-float pointer-events-none absolute bottom-3 right-6 text-mint/25">
        <Leaf className="h-10 w-10 -scale-x-100" strokeWidth={1.3} />
      </div>
      <div className="relative flex items-center justify-between">
        <Logo size={38} variant="white" />
        <button
          type="button"
          onClick={goLanding}
          aria-label="Quay lại trang chủ"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/25 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
      </div>
      <h1 className="relative mt-6 text-balance text-[24px] font-extrabold leading-[1.18] text-white">
        Cùng nhau kiến tạo <span className="text-mint">thành phố xanh.</span>
      </h1>
      <p className="relative mt-2 text-[13px] leading-relaxed text-mint/70">
        Biến rác thải hôm nay thành tài nguyên ngày mai cùng Green City.
      </p>
    </div>
  );
}

/* ------------------------------ Checkbox nhớ tôi --------------------------- */

function RememberCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group flex items-center gap-2.5 rounded-lg py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <span
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-[7px] border-[1.5px] transition-all duration-200",
          checked
            ? "border-primary bg-primary text-white"
            : "border-[#c4d4c6] bg-white group-hover:border-primary/60"
        )}
      >
        <AnimatePresence>
          {checked && (
            <motion.svg
              key="check"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.16 }}
              viewBox="0 0 24 24"
              fill="none"
              className="h-3.5 w-3.5"
            >
              <path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </span>
      <span className="text-[13.5px] font-medium text-muted-foreground">{label}</span>
    </button>
  );
}

/* --------------------------------- Màn hình -------------------------------- */

export function AuthScreen() {
  const { state, goAuth, login, toast } = useApp();
  const mode = (state.route as { screen: "auth"; mode: AuthMode }).mode;
  const reduced = useReducedMotion();

  const [direction, setDirection] = useState(1);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shakeKey, setShakeKey] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [forgotSent, setForgotSent] = useState(false);

  const switchMode = (m: AuthMode) => {
    if (status === "loading") return;
    const order: AuthMode[] = ["login", "register", "forgot"];
    setDirection(order.indexOf(m) > order.indexOf(mode) ? 1 : -1);
    setErrors({});
    setStatus("idle");
    setForgotSent(false);
    goAuth(m);
  };

  const fillDemo = () => {
    if (status === "loading") return;
    setErrors({});
    if (mode === "register") {
      setName("Nguyễn Thị Xanh");
      setEmail("xanh@greencity.demo");
      setPassword("12345678");
      setConfirm("12345678");
    } else if (mode === "login") {
      setEmail("xanh@greencity.demo");
      setPassword("12345678");
    } else {
      setEmail("xanh@greencity.demo");
    }
    toast("info", "Đã điền dữ liệu mẫu", "Bạn có thể chỉnh sửa trước khi gửi.");
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (mode === "register" && name.trim().length < 2) {
      errs.name = "Vui lòng nhập họ tên (tối thiểu 2 ký tự)";
    }
    if (!email.trim()) {
      errs.email = "Vui lòng nhập email hoặc tên đăng nhập";
    } else if (mode !== "login" && !isEmailFormat(email)) {
      errs.email = "Email chưa đúng định dạng (VD: ten@email.com)";
    }
    if (mode !== "forgot") {
      if (!password) {
        errs.password = "Vui lòng nhập mật khẩu";
      } else if (password.length < 6) {
        errs.password = "Mật khẩu cần tối thiểu 6 ký tự";
      }
    }
    if (mode === "register") {
      if (!confirm) {
        errs.confirm = "Vui lòng nhập lại mật khẩu";
      } else if (confirm !== password) {
        errs.confirm = "Mật khẩu nhập lại chưa khớp";
      }
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      setShakeKey((k) => k + 1);
      return false;
    }
    return true;
  };

  const displayName = () => {
    if (name.trim()) return name.trim();
    return email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (status === "loading" || status === "success") return;
    if (!validate()) return;

    setStatus("loading");
    const delay = mode === "forgot" ? 1000 : 1200;

    window.setTimeout(() => {
      if (mode === "forgot") {
        setStatus("idle");
        setForgotSent(true);
        toast("success", "Đã gửi yêu cầu khôi phục (demo)", "Kiểm tra hộp thư ảo trong phiên demo.");
        return;
      }
      setStatus("success");
      window.setTimeout(() => {
        const user: DemoUser = {
          name: displayName(),
          email: email.trim(),
          memberSince: mode === "register" ? "Hôm nay" : "10/2025",
        };
        login(user);
        toast(
          "success",
          mode === "register" ? "Tài khoản demo đã sẵn sàng!" : "Đăng nhập thành công!",
          `Chào mừng ${user.name} đến với Green City.`
        );
      }, 850);
    }, delay);
  };

  const googleLogin = () => {
    toast("info", "Đăng nhập Google (minh họa)", "Tính năng OAuth chưa được kết nối trong bản demo.");
  };

  const fieldAnim = (i: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay: 0.05 + i * 0.075, ease: [0.22, 1, 0.36, 1] as const },
  });

  const panelVariants = {
    enter: (dir: number) => ({ opacity: 0, x: reduced ? 0 : dir * 46 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: reduced ? 0 : -dir * 46 }),
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[#fafcf9] lg:block">
      <MobileBrandBand />
      <div className="grid min-h-dvh flex-1 lg:grid-cols-[52fr_48fr] lg:min-h-dvh">
        <BrandPanel mode={mode} />

        {/* Cột phải: form */}
        <div className="relative flex flex-col items-center justify-center px-5 py-10 sm:px-10 lg:overflow-y-auto">
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-40">
            <div className="absolute right-[10%] top-[12%] h-40 w-40 rounded-full bg-mint/20 blur-3xl" />
            <div className="absolute bottom-[10%] left-[8%] h-52 w-52 rounded-full bg-accent/60 blur-3xl" />
          </div>

          <div className="flex w-full max-w-[420px] flex-col">
            <AnimatePresence mode="wait" custom={direction}>
              {mode === "login" && (
                <motion.div
                  key="login"
                  custom={direction}
                  variants={panelVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.div {...fieldAnim(0)} className="flex flex-col items-center text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-gradient-to-b from-[#2a9a5d] to-primary text-white shadow-lg shadow-primary/30">
                      <LogoMark size={30} id="auth-mark-login" />
                    </span>
                    <h1 className="mt-5 text-[26px] font-extrabold tracking-tight text-forest">
                      Chào mừng trở lại
                    </h1>
                    <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                      Đăng nhập để tiếp tục hành trình xanh cùng Green City.
                    </p>
                  </motion.div>

                  <form onSubmit={submit} noValidate className="mt-8 flex flex-col gap-4">
                    <motion.div {...fieldAnim(1)}>
                      <AuthField
                        label="Email hoặc tên đăng nhập"
                        type="email"
                        autoComplete="email"
                        value={email}
                        error={errors.email}
                        shake={shakeKey > 0 && !!errors.email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors((er) => ({ ...er, email: "" }));
                        }}
                      />
                    </motion.div>
                    <motion.div {...fieldAnim(2)}>
                      <AuthField
                        label="Mật khẩu"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        error={errors.password}
                        shake={shakeKey > 0 && !!errors.password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) setErrors((er) => ({ ...er, password: "" }));
                        }}
                      />
                    </motion.div>

                    <motion.div
                      {...fieldAnim(3)}
                      className="flex items-center justify-between gap-3 pt-1"
                    >
                      <RememberCheckbox checked={remember} onChange={setRemember} label="Ghi nhớ đăng nhập" />
                      <button
                        type="button"
                        onClick={() => switchMode("forgot")}
                        className="text-[13.5px] font-semibold text-primary underline-offset-4 transition-colors hover:text-forest hover:underline"
                      >
                        Quên mật khẩu?
                      </button>
                    </motion.div>

                    <motion.div {...fieldAnim(4)} className="pt-2">
                      <SubmitButton
                        status={status}
                        loadingText="Đang xử lý..."
                        successText="Đăng nhập thành công!"
                      >
                        Đăng nhập
                      </SubmitButton>
                      <button
                        type="button"
                        onClick={fillDemo}
                        className="mx-auto mt-3 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-primary"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Điền nhanh dữ liệu demo
                      </button>
                    </motion.div>
                  </form>

                  <motion.div {...fieldAnim(5)} className="mt-6">
                    <div className="flex items-center gap-4">
                      <span className="h-px flex-1 bg-border" />
                      <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
                        Hoặc
                      </span>
                      <span className="h-px flex-1 bg-border" />
                    </div>
                    <button
                      type="button"
                      onClick={googleLogin}
                      className="mt-4 flex h-[50px] w-full items-center justify-center gap-3 rounded-2xl border-[1.5px] border-[#dce7dc] bg-white text-[14px] font-semibold text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-[#a8c9ae] hover:shadow-md"
                    >
                      <Chrome className="h-5 w-5 text-[#5f6368]" />
                      Tiếp tục với Google
                    </button>
                    <p className="mt-3 text-center text-[12px] text-muted-foreground/70">
                      Nút mạng xã hội chỉ mang tính minh họa trong bản demo.
                    </p>
                  </motion.div>

                  <motion.p {...fieldAnim(6)} className="mt-7 text-center text-[14px] text-muted-foreground">
                    Chưa có tài khoản?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("register")}
                      className="font-bold text-primary underline-offset-4 transition-colors hover:text-forest hover:underline"
                    >
                      Đăng ký ngay
                    </button>
                  </motion.p>
                </motion.div>
              )}

              {mode === "register" && (
                <motion.div
                  key="register"
                  custom={direction}
                  variants={panelVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.div {...fieldAnim(0)} className="flex flex-col items-center text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-gradient-to-b from-[#2a9a5d] to-primary text-white shadow-lg shadow-primary/30">
                      <User className="h-7 w-7" strokeWidth={2} />
                    </span>
                    <h1 className="mt-5 text-[26px] font-extrabold tracking-tight text-forest">
                      Tạo tài khoản Green City
                    </h1>
                    <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                      Tham gia cộng đồng mua bán ve chai & tái chế — miễn phí trong 30 giây.
                    </p>
                  </motion.div>

                  <form onSubmit={submit} noValidate className="mt-8 flex flex-col gap-4">
                    <motion.div {...fieldAnim(1)}>
                      <AuthField
                        label="Họ và tên"
                        type="text"
                        autoComplete="name"
                        value={name}
                        error={errors.name}
                        shake={shakeKey > 0 && !!errors.name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (errors.name) setErrors((er) => ({ ...er, name: "" }));
                        }}
                      />
                    </motion.div>
                    <motion.div {...fieldAnim(2)}>
                      <AuthField
                        label="Email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        error={errors.email}
                        shake={shakeKey > 0 && !!errors.email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors((er) => ({ ...er, email: "" }));
                        }}
                      />
                    </motion.div>
                    <motion.div {...fieldAnim(3)}>
                      <AuthField
                        label="Mật khẩu"
                        type="password"
                        autoComplete="new-password"
                        value={password}
                        error={errors.password}
                        shake={shakeKey > 0 && !!errors.password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) setErrors((er) => ({ ...er, password: "" }));
                        }}
                      />
                    </motion.div>
                    <motion.div {...fieldAnim(4)}>
                      <AuthField
                        label="Xác nhận mật khẩu"
                        type="password"
                        autoComplete="new-password"
                        value={confirm}
                        error={errors.confirm}
                        shake={shakeKey > 0 && !!errors.confirm}
                        onChange={(e) => {
                          setConfirm(e.target.value);
                          if (errors.confirm) setErrors((er) => ({ ...er, confirm: "" }));
                        }}
                      />
                    </motion.div>

                    <motion.div {...fieldAnim(5)} className="pt-2">
                      <SubmitButton
                        status={status}
                        loadingText="Đang tạo tài khoản..."
                        successText="Tài khoản đã sẵn sàng!"
                      >
                        Tạo tài khoản miễn phí
                      </SubmitButton>
                      <button
                        type="button"
                        onClick={fillDemo}
                        className="mx-auto mt-3 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-primary"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Điền nhanh dữ liệu demo
                      </button>
                    </motion.div>
                  </form>

                  <motion.p {...fieldAnim(6)} className="mt-7 text-center text-[14px] text-muted-foreground">
                    Đã có tài khoản?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      className="font-bold text-primary underline-offset-4 transition-colors hover:text-forest hover:underline"
                    >
                      Đăng nhập
                    </button>
                  </motion.p>
                </motion.div>
              )}

              {mode === "forgot" && (
                <motion.div
                  key="forgot"
                  custom={direction}
                  variants={panelVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.div {...fieldAnim(0)} className="flex flex-col items-center text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-gradient-to-b from-[#d97706] to-[#b45309] text-white shadow-lg shadow-warn/30">
                      <Lock className="h-7 w-7" strokeWidth={2} />
                    </span>
                    <h1 className="mt-5 text-[26px] font-extrabold tracking-tight text-forest">
                      Khôi phục mật khẩu
                    </h1>
                    <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                      Nhập email đăng ký — hệ thống demo sẽ mô phỏng việc gửi hướng dẫn đặt lại.
                    </p>
                  </motion.div>

                  {forgotSent ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="mt-8 flex flex-col items-center gap-4 rounded-3xl border border-[#bfe6c8] bg-[#f2faf3] p-7 text-center"
                    >
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 280, damping: 16, delay: 0.1 }}
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30"
                      >
                        <Mail className="h-7 w-7" />
                      </motion.span>
                      <div>
                        <h3 className="text-[17px] font-bold text-forest">Đã gửi hướng dẫn (demo)</h3>
                        <p className="mt-1.5 max-w-xs text-[13.5px] leading-relaxed text-muted-foreground">
                          Nếu <strong>{email}</strong> tồn tại trong hệ thống demo, một email khôi
                          phục sẽ được gửi trong vài phút. Việc gửi email thật không diễn ra.
                        </p>
                      </div>
                      <SubmitButton
                        status="idle"
                        type="button"
                        onClick={() => switchMode("login")}
                        className="mt-1"
                      >
                        <span className="flex items-center gap-2">
                          <ArrowLeft className="h-[18px] w-[18px]" />
                          Quay lại đăng nhập
                        </span>
                      </SubmitButton>
                    </motion.div>
                  ) : (
                    <form onSubmit={submit} noValidate className="mt-8 flex flex-col gap-4">
                      <motion.div {...fieldAnim(1)}>
                        <AuthField
                          label="Email đăng ký"
                          type="email"
                          autoComplete="email"
                          value={email}
                          error={errors.email}
                          shake={shakeKey > 0 && !!errors.email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email) setErrors((er) => ({ ...er, email: "" }));
                          }}
                        />
                      </motion.div>
                      <motion.div {...fieldAnim(2)} className="pt-2">
                        <SubmitButton
                          status={status}
                          loadingText="Đang gửi yêu cầu..."
                        >
                          <span className="flex items-center gap-2">
                            Gửi yêu cầu khôi phục
                            <ArrowRight className="h-[18px] w-[18px]" />
                          </span>
                        </SubmitButton>
                      </motion.div>
                      <motion.button
                        {...fieldAnim(3)}
                        type="button"
                        onClick={() => switchMode("login")}
                        className="mx-auto flex items-center gap-2 rounded-lg px-4 py-2 text-[13.5px] font-semibold text-muted-foreground transition-colors hover:bg-accent/60 hover:text-primary"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại đăng nhập
                      </motion.button>
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <p className="mt-9 flex items-center justify-center gap-1.5 text-center text-[11.5px] leading-relaxed text-muted-foreground/60">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              Chế độ demo — đăng nhập được mô phỏng, không xác thực thật.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
