"use client";

import { Facebook, Instagram, Mail, MapPin, Leaf, Youtube, Twitter } from "lucide-react";
import { useApp } from "@/store/app-store";
import { CATEGORIES } from "@/data/mock-data";
import { Logo } from "./Logo";
import type { CategoryId } from "@/types";

export function Footer() {
  const { state, goAuth, setPending, setDiscoverPreset, toast } = useApp();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openCategory = (id: CategoryId) => {
    setDiscoverPreset(id);
    setPending({ screen: "app", page: "discover" });
    goAuth("login");
    if (!state.user) {
      toast("info", "Đăng nhập để khám phá danh mục", "Chế độ demo — nhanh và miễn phí.");
    }
  };

  const goFlow = (page: "sell" | "collect", label: string) => {
    setPending({ screen: "app", page });
    goAuth("register");
    toast("info", "Tạo tài khoản để tiếp tục", label);
  };

  const demoInfo = (label: string) => {
    toast("info", "Nội dung minh họa", `${label} — trang chi tiết chưa nằm trong phạm vi bản demo.`);
  };

  const guideLinks: { label: string; action: () => void }[] = [
    { label: "Cách đăng tin bán ve chai", action: () => goFlow("sell", "Hướng dẫn đăng tin ve chai") },
    { label: "Gửi yêu cầu thu gom", action: () => scrollTo("collect") },
    { label: "Bảng giá tham khảo (demo)", action: () => scrollTo("products") },
    { label: "Quy định cộng đồng", action: () => demoInfo("Quy định cộng đồng") },
    { label: "Câu hỏi thường gặp", action: () => demoInfo("Câu hỏi thường gặp") },
  ];

  const aboutLinks: { label: string; action: () => void }[] = [
    { label: "Về Green City", action: () => scrollTo("process") },
    { label: "Sứ mệnh kinh tế tuần hoàn", action: () => scrollTo("impact") },
    { label: "Câu chuyện dự án demo", action: () => demoInfo("Câu chuyện dự án") },
    { label: "Điều khoản sử dụng demo", action: () => demoInfo("Điều khoản demo") },
    { label: "Chính sách môi trường", action: () => demoInfo("Chính sách môi trường") },
  ];

  return (
    <footer className="relative mt-24 overflow-hidden bg-forest text-white">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-leaf/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-10 h-80 w-80 rounded-full bg-mint/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <button type="button" onClick={() => scrollTo("top")} aria-label="Về đầu trang">
              <Logo size={44} variant="white" subtitle />
            </button>
            <p className="mt-5 text-sm leading-relaxed text-mint/75">
              Nền tảng kết nối người bán ve chai, người thu mua phế liệu và cộng đồng thu gom rác
              tái chế — cùng kiến tạo thành phố xanh hơn, giá trị sống tốt hơn.
            </p>
            <div className="mt-6 flex flex-col gap-2.5 text-[13px] text-mint/65">
              <span className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 shrink-0" />
                Địa chỉ giả lập — TP. Hồ Chí Minh
              </span>
              <button
                type="button"
                onClick={() => demoInfo("Liên hệ")}
                className="flex items-center gap-2.5 text-left transition-colors hover:text-mint"
              >
                <Mail className="h-4 w-4 shrink-0" />
                hello@greencity.demo
              </button>
            </div>
            <div className="mt-6 flex gap-2.5">
              {[
                { icon: Facebook, label: "Facebook" },
                { icon: Instagram, label: "Instagram" },
                { icon: Youtube, label: "Youtube" },
                { icon: Twitter, label: "X" },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  type="button"
                  aria-label={label}
                  onClick={() => demoInfo(`Kênh ${label}`)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-mint/80 transition-all duration-200 hover:-translate-y-0.5 hover:bg-mint/20 hover:text-white"
                >
                  <Icon className="h-[18px] w-[18px]" />
                </button>
              ))}
            </div>
          </div>

          <nav aria-label="Danh mục">
            <h4 className="text-[13px] font-bold uppercase tracking-[0.14em] text-mint/60">
              Danh mục
            </h4>
            <ul className="mt-4 flex flex-col gap-2.5">
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => openCategory(cat.id)}
                    className="group flex items-center gap-2 text-left text-[13.5px] text-mint/70 transition-colors duration-200 hover:text-white"
                  >
                    <Leaf className="h-3 w-3 text-leaf/70 transition-transform duration-200 group-hover:scale-125" />
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Hướng dẫn">
            <h4 className="text-[13px] font-bold uppercase tracking-[0.14em] text-mint/60">
              Hướng dẫn
            </h4>
            <ul className="mt-4 flex flex-col gap-2.5">
              {guideLinks.map((link) => (
                <li key={link.label}>
                  <button
                    type="button"
                    onClick={link.action}
                    className="group flex items-center gap-2 text-left text-[13.5px] text-mint/70 transition-colors duration-200 hover:text-white"
                  >
                    <Leaf className="h-3 w-3 text-leaf/70 transition-transform duration-200 group-hover:scale-125" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Giới thiệu">
            <h4 className="text-[13px] font-bold uppercase tracking-[0.14em] text-mint/60">
              Giới thiệu
            </h4>
            <ul className="mt-4 flex flex-col gap-2.5">
              {aboutLinks.map((link) => (
                <li key={link.label}>
                  <button
                    type="button"
                    onClick={link.action}
                    className="group flex items-center gap-2 text-left text-[13.5px] text-mint/70 transition-colors duration-200 hover:text-white"
                  >
                    <Leaf className="h-3 w-3 text-leaf/70 transition-transform duration-200 group-hover:scale-125" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/12 pt-7 text-[12.5px] text-mint/55 sm:flex-row">
          <p>© 2026 Green City — Website demo phục vụ trình diễn đồ án.</p>
          <p className="flex items-center gap-1.5">
            <Leaf className="h-3.5 w-3.5 text-leaf" />
            Dữ liệu trên trang là dữ liệu minh họa, không phải số liệu thực tế.
          </p>
        </div>
      </div>
    </footer>
  );
}
