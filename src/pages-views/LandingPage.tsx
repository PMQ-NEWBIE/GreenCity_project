"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Handshake,
  Leaf,
  MapPin,
  PackageCheck,
  Recycle,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  Truck,
} from "lucide-react";
import { CATEGORIES, IMAGES, IMPACT_STATS } from "@/data/mock-data";
import { useApp } from "@/store/app-store";
import { Navbar } from "@/components/greencity/Navbar";
import { Footer } from "@/components/greencity/Footer";
import { CategoryCard } from "@/components/greencity/CategoryCard";
import { ProductCard } from "@/components/greencity/ProductCard";
import { SmartImage } from "@/components/greencity/SmartImage";
import { Counter } from "@/components/greencity/Counter";
import { Reveal } from "@/components/greencity/Reveal";
import { CollectRequestModal } from "./CollectRequestModal";
import type { ReactNode } from "react";

const PRICE_TICKER = [
  "Giấy carton 4.000đ/kg",
  "Chai PET 5.000đ/kg",
  "Lon nhôm 28.000đ/kg",
  "Sắt vụn 7.000đ/kg",
  "Chai thủy tinh 1.500đ/chai",
  "Giấy báo 3.500đ/kg",
  "Nhựa HDPE 6.000đ/kg",
  "Đồng phế liệu 85.000đ/kg",
];

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <Reveal className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-xl"}>
      <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-[0.12em] text-primary">
        <Leaf className="h-3.5 w-3.5" />
        {eyebrow}
      </span>
      <h2 className="mt-4 text-[28px] font-extrabold leading-[1.15] tracking-tight text-forest sm:text-[36px]">
        {title}
      </h2>
      {description && (
        <p className="mt-3.5 text-[15px] leading-relaxed text-muted-foreground">{description}</p>
      )}
    </Reveal>
  );
}

/* ---------------------------------- HERO ---------------------------------- */

function HeroSection() {
  const reduced = useReducedMotion();
  const { goAuth, setPending, toast } = useApp();

  const stagger = (i: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 26 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.65, delay: 0.08 + i * 0.1, ease: [0.22, 1, 0.36, 1] as const },
  });

  const startSelling = () => {
    setPending({ screen: "app", page: "sell" });
    goAuth("register");
    toast("info", "Tạo tài khoản để đăng tin", "Đăng ký nhanh trong chế độ demo.");
  };

  const explore = () => {
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="top" className="relative overflow-hidden pb-16 pt-[104px] sm:pt-[120px]">
      {/* Nền trang trí */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 right-[-10%] h-[560px] w-[560px] rounded-full bg-mint/25 blur-3xl" />
        <div className="absolute bottom-[-30%] left-[-8%] h-[480px] w-[480px] rounded-full bg-accent/70 blur-3xl" />
        <svg className="absolute inset-x-0 top-0 h-full w-full opacity-[0.35]" aria-hidden="true">
          <defs>
            <pattern id="dots" width="34" height="34" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="#248B52" fillOpacity="0.16" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-8">
        {/* Cột trái: nội dung */}
        <div>
          <motion.div {...stagger(0)}>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-white/80 py-1.5 pl-1.5 pr-4 shadow-sm">
              <span className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                <Sparkles className="h-3 w-3" />
                Demo
              </span>
              <span className="text-[13px] font-semibold text-forest/80">
                Sàn ve chai & tái chế đầu tiên tại TP.HCM
              </span>
            </span>
          </motion.div>

          <motion.h1
            {...stagger(1)}
            className="mt-6 text-balance text-[38px] font-extrabold leading-[1.08] tracking-tight text-forest sm:text-[52px] lg:text-[56px]"
          >
            Rác thải hôm nay,
            <br />
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-primary to-[#1a6b3c] bg-clip-text text-transparent">
                tài nguyên ngày mai.
              </span>
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 12"
                fill="none"
                aria-hidden="true"
                preserveAspectRatio="none"
              >
                <path
                  d="M3 9C60 3 180 2 297 7"
                  stroke="#A7E8B2"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </motion.h1>

          <motion.p
            {...stagger(2)}
            className="mt-6 max-w-lg text-[16px] leading-relaxed text-muted-foreground sm:text-[17px]"
          >
            Khám phá, mua bán và trao đổi ve chai, đồ tái chế và vật dụng cũ. Kết nối với cộng đồng
            thu gom để biến những thứ không còn cần thiết thành giá trị mới.
          </motion.p>

          <motion.div {...stagger(3)} className="mt-8 flex flex-wrap items-center gap-3.5">
            <motion.button
              type="button"
              onClick={explore}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex h-[52px] items-center gap-2.5 rounded-2xl bg-gradient-to-b from-[#2a9a5d] to-primary px-7 text-[15px] font-semibold text-white shadow-[0_14px_30px_-12px_rgba(20,83,45,0.55)] transition-shadow hover:shadow-[0_18px_36px_-12px_rgba(20,83,45,0.65)]"
            >
              <Search className="h-[18px] w-[18px]" strokeWidth={2.4} />
              Khám phá sản phẩm
            </motion.button>
            <motion.button
              type="button"
              onClick={startSelling}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex h-[52px] items-center gap-2.5 rounded-2xl border-[1.5px] border-primary/30 bg-white px-7 text-[15px] font-semibold text-primary shadow-sm transition-colors hover:border-primary/60 hover:bg-accent/60"
            >
              <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.4} />
              Bắt đầu bán hàng
            </motion.button>
          </motion.div>

          <motion.div {...stagger(4)} className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {["L", "T", "M", "K"].map((c, i) => (
                  <span
                    key={c}
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-[12px] font-bold text-white"
                    style={{
                      background: ["#248B52", "#8B6848", "#2a9a5d", "#14532D"][i],
                    }}
                  >
                    {c}
                  </span>
                ))}
              </div>
              <div className="text-[13px] leading-tight">
                <p className="font-bold text-forest">2.400+ thành viên</p>
                <p className="text-muted-foreground">người bán, thu mua & thu gom</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-[13px]">
              <div className="flex items-center gap-1 rounded-xl bg-white px-3 py-2 shadow-sm border border-border">
                <Star className="h-4 w-4 fill-warn text-warn" />
                <span className="font-bold text-forest">4.9/5</span>
              </div>
              <span className="text-muted-foreground">đánh giá phiên demo</span>
            </div>
          </motion.div>
        </div>

        {/* Cột phải: hình ảnh + thẻ nổi */}
        <motion.div
          initial={{ opacity: 0, scale: reduced ? 1 : 0.94, y: reduced ? 0 : 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-[520px]"
        >
          <div className="relative">
            {/* Ảnh chính */}
            <div className="overflow-hidden rounded-[32px] border-4 border-white shadow-[0_32px_70px_-28px_rgba(20,83,45,0.45)]">
              <SmartImage
                src={IMAGES.heroMain}
                alt="Vật liệu tái chế đã phân loại: giấy, nhựa, kim loại"
                className="aspect-[4/4.4] w-full"
                priority
              />
            </div>

            {/* Ảnh phụ */}
            <motion.div
              initial={{ opacity: 0, x: reduced ? 0 : -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="absolute -bottom-8 -left-3 w-[38%] sm:-left-10"
            >
              <div className="overflow-hidden rounded-3xl border-4 border-white shadow-[0_20px_44px_-20px_rgba(20,83,45,0.5)]">
                <SmartImage
                  src={IMAGES.heroCity}
                  alt="Thành phố xanh với nhiều cây"
                  className="aspect-[4/3.2] w-full"
                />
              </div>
            </motion.div>

            {/* Thẻ nổi 1 */}
            <motion.div
              initial={{ opacity: 0, y: reduced ? 0 : -22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="absolute -right-2 top-8 sm:-right-8"
            >
              <div className="animate-leaf-float rounded-2xl border border-border/60 bg-white/95 p-3.5 shadow-[0_16px_36px_-16px_rgba(20,83,45,0.4)] backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
                    <Recycle className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[13.5px] font-bold text-forest">Tái chế mỗi ngày</p>
                    <p className="text-[11.5px] text-muted-foreground">312 lượt hôm nay (demo)</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Thẻ nổi 2 */}
            <motion.div
              initial={{ opacity: 0, y: reduced ? 0 : 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="absolute -right-1 top-[46%] sm:-right-6"
            >
              <div
                className="animate-leaf-float rounded-2xl border border-border/60 bg-white/95 p-3.5 shadow-[0_16px_36px_-16px_rgba(20,83,45,0.4)] backdrop-blur-sm"
                style={{ animationDelay: "-4s" }}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3ebe2] text-earth">
                    <Handshake className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[13.5px] font-bold text-forest">Kết nối mua — bán</p>
                    <p className="text-[11.5px] text-muted-foreground">trong 24 giờ (demo)</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Thẻ nổi 3 */}
            <motion.div
              initial={{ opacity: 0, x: reduced ? 0 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
              className="absolute -bottom-4 right-6"
            >
              <div
                className="animate-leaf-float rounded-2xl border border-border/60 bg-white/95 p-3.5 shadow-[0_16px_36px_-16px_rgba(20,83,45,0.4)] backdrop-blur-sm"
                style={{ animationDelay: "-7s" }}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
                    <Truck className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[13.5px] font-bold text-forest">Thu gom tận nơi</p>
                    <p className="text-[11.5px] text-muted-foreground">lên lịch chỉ 30 giây</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Ticker giá tham khảo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="relative mt-16 border-y border-border/80 bg-white/70 py-3.5"
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
        <div className="flex w-max animate-ticker gap-10 whitespace-nowrap">
          {[...PRICE_TICKER, ...PRICE_TICKER].map((t, i) => (
            <span key={i} className="flex items-center gap-2.5 text-[13px] font-medium text-muted-foreground">
              <Leaf className="h-3.5 w-3.5 text-primary/70" />
              {t}
            </span>
          ))}
        </div>
        <p className="mt-2 text-center text-[10.5px] text-muted-foreground/60">
          * Giá tham khảo minh họa, không phải bảng giá thị trường
        </p>
      </motion.div>
    </section>
  );
}

/* ------------------------------- CATEGORIES ------------------------------- */

function CategoriesSection() {
  return (
    <section id="categories" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Danh mục nổi bật"
        title={
          <>
            Mọi phế liệu đều có <span className="text-primary">chỗ đứng</span>
          </>
        }
        description="Sáu nhóm vật liệu giao dịch sôi động nhất trên Green City — từ giấy vụn đến đồ điện tử cũ, tất cả đều được định giá rõ ràng theo đơn vị."
      />
      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((cat, i) => (
          <CategoryCard key={cat.id} category={cat} index={i} />
        ))}
      </div>
    </section>
  );
}

/* -------------------------------- PRODUCTS -------------------------------- */

function ProductsSection() {
  const { state, goAuth, goApp, setDiscoverPreset, setPending, toast } = useApp();
  const products = state.products.slice(0, 8);

  const viewAll = () => {
    setDiscoverPreset("all");
    if (state.user) {
      goApp("discover");
    } else {
      setPending({ screen: "app", page: "discover" });
      goAuth("login");
      toast("info", "Đăng nhập để khám phá toàn bộ", "Hơn 1.200 tin đăng đang chờ bạn (demo).");
    }
  };

  return (
    <section id="products" className="scroll-mt-24 bg-white/60 py-20 [background:linear-gradient(to_bottom,#ffffff_0%,#f2f8f1_60%,#f7faf5_100%)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            align="left"
            eyebrow="Tin mới đăng"
            title="Sản phẩm vừa lên sàn"
            description="Những món ve chai và đồ cũ được cộng đồng đăng gần đây nhất."
          />
          <Reveal delay={0.15}>
            <button
              type="button"
              onClick={viewAll}
              className="group flex items-center gap-2 rounded-2xl border-[1.5px] border-primary/30 bg-white px-5 py-3 text-[14px] font-semibold text-primary transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md"
            >
              Xem tất cả
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </Reveal>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-5 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- COLLECT --------------------------------- */

function CollectSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const features = [
    {
      icon: Recycle,
      title: "Thu gom giấy, nhựa & kim loại",
      desc: "Nguyên liệu tái chế tách riêng sẵn — dễ cân, dễ tính giá.",
    },
    {
      icon: PackageCheck,
      title: "Thu gom đồ cũ tại nhà",
      desc: "Đồ gia dụng, điện tử cũ nặng bulky — có người khiêng tận cửa.",
    },
    {
      icon: MapPin,
      title: "Thu mua phế liệu theo khu vực",
      desc: "Gần đây prioritized — xe tới nhanh trong cùng quận.",
    },
    {
      icon: Truck,
      title: "Lên lịch thu gom linh hoạt",
      desc: "Chọn khung giờ sáng / chiều / cuối tuần phù hợp với bạn.",
    },
  ];

  return (
    <section id="collect" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <SectionHeading
            align="left"
            eyebrow="Dịch vụ thu gom"
            title="Bạn có đồ cần thu gom?"
            description="Gửi yêu cầu một lần — hệ thống demo kết nối bạn với người thu mua gần nhất. Không cần gọi điện đi tìm từng vựa."
          />
          <div className="mt-8 flex flex-col gap-4">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={0.08 * i}>
                <div className="group flex items-start gap-4 rounded-2xl border border-border/70 bg-white p-4.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/8 p-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary transition-transform duration-200 group-hover:scale-110">
                    <f.icon className="h-[21px] w-[21px]" />
                  </span>
                  <div>
                    <h3 className="text-[15px] font-bold text-forest">{f.title}</h3>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.3}>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="mt-8 flex h-[52px] items-center gap-2.5 rounded-2xl bg-gradient-to-b from-[#2a9a5d] to-primary px-7 text-[15px] font-semibold text-white shadow-[0_14px_30px_-12px_rgba(20,83,45,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-12px_rgba(20,83,45,0.65)]"
            >
              <Truck className="h-[18px] w-[18px]" strokeWidth={2.2} />
              Tạo yêu cầu thu gom
            </button>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="relative">
          <div className="relative">
            <div className="overflow-hidden rounded-[32px] border-4 border-white shadow-[0_32px_70px_-28px_rgba(20,83,45,0.4)]">
              <SmartImage
                src={IMAGES.serviceTruck}
                alt="Xe thu gom rác thải tái chế tại đô thị"
                className="aspect-[4/4.6] w-full"
              />
            </div>
            <div className="animate-leaf-slow absolute -left-4 bottom-10 max-w-[220px] rounded-2xl border border-border/60 bg-white/95 p-4 shadow-[0_16px_36px_-16px_rgba(20,83,45,0.4)] backdrop-blur-sm sm:-left-10">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
                  <Truck className="h-4.5 w-4.5" />
                  <span className="absolute inset-0 rounded-xl animate-pulse-ring bg-primary/40" />
                </span>
                <div>
                  <p className="text-[13px] font-bold text-forest">Xe thu gom sẵn sàng</p>
                  <p className="text-[11px] text-muted-foreground">24 điểm chờ trong thành phố</p>
                </div>
              </div>
            </div>
            <div
              className="animate-leaf-float absolute -right-3 top-8 rounded-2xl border border-border/60 bg-white/95 p-3.5 shadow-[0_16px_36px_-16px_rgba(20,83,45,0.4)] backdrop-blur-sm sm:-right-6"
              style={{ animationDelay: "-5s" }}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3ebe2] text-earth">
                  <BadgeCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[13.5px] font-bold text-forest">Miễn phí lên lịch</p>
                  <p className="text-[11.5px] text-muted-foreground">kèm báo giá nhanh (demo)</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
      <CollectRequestModal open={modalOpen} onClose={() => setModalOpen(false)} embedded />
    </section>
  );
}

/* -------------------------------- PROCESS --------------------------------- */

function ProcessSection() {
  const steps = [
    {
      icon: Search,
      step: "01",
      title: "Đăng tin hoặc gửi yêu cầu",
      desc: "Chụp ảnh, nhập khối lượng ước tính và khu vực — tin lên sàn trong dưới 1 phút.",
    },
    {
      icon: Handshake,
      step: "02",
      title: "Kết nối người mua / thu gom",
      desc: "Người thu mua gần bạn nhận thông tin và chủ động liên hệ qua kênh demo.",
    },
    {
      icon: PackageCheck,
      step: "03",
      title: "Trao đổi, bàn giao & tái sử dụng",
      desc: "Cân đo tại chỗ, thanh toán nhanh — vật liệu quay lại chu trình sản xuất.",
    },
  ];

  return (
    <section id="process" className="scroll-mt-24 bg-forest py-20 text-white relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 right-[-8%] h-96 w-96 rounded-full bg-leaf/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-[-6%] h-96 w-96 rounded-full bg-mint/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-[0.12em] text-mint">
            <TrendingUp className="h-3.5 w-3.5" />
            Quy trình hoạt động
          </span>
          <h2 className="mt-4 text-[28px] font-extrabold leading-[1.15] tracking-tight text-white sm:text-[36px]">
            Ba bước để biến rác thành <span className="text-mint">tài nguyên</span>
          </h2>
          <p className="mt-3.5 text-[15px] leading-relaxed text-mint/70">
            Green City chuẩn hóa toàn bộ hành trình từ lúc đồ nằm góc nhà đến lúc nó trở lại vòng
            tuần hoàn của thành phố.
          </p>
        </Reveal>

        <div className="relative mt-14">
          <svg
            className="absolute left-0 right-0 top-10 hidden h-1 w-full lg:block"
            aria-hidden="true"
            preserveAspectRatio="none"
          >
            <line
              x1="8%"
              y1="4"
              x2="92%"
              y2="4"
              stroke="#A7E8B2"
              strokeWidth="2"
              strokeDasharray="8 8"
              opacity="0.4"
            />
          </svg>
          <div className="grid gap-10 lg:grid-cols-3 lg:gap-8">
            {steps.map((s, i) => (
              <Reveal key={s.step} delay={0.12 * i}>
                <div className="group relative flex flex-col items-center text-center">
                  <div className="relative">
                    <span className="flex h-20 w-20 items-center justify-center rounded-[26px] bg-gradient-to-b from-[#2a9a5d] to-primary text-white shadow-[0_16px_36px_-14px_rgba(0,0,0,0.5)] ring-4 ring-forest transition-transform duration-300 group-hover:-translate-y-1.5">
                      <s.icon className="h-9 w-9" strokeWidth={1.8} />
                    </span>
                    <span className="absolute -right-2 -top-2 flex h-7 min-w-7 items-center justify-center rounded-full bg-mint px-1.5 text-[12px] font-extrabold text-forest shadow-md">
                      {s.step}
                    </span>
                  </div>
                  <h3 className="mt-6 text-[18px] font-bold text-white">{s.title}</h3>
                  <p className="mt-2.5 max-w-xs text-[14px] leading-relaxed text-mint/70">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- IMPACT --------------------------------- */

function ImpactSection() {
  const icons = [Leaf, Handshake, Recycle, Truck];
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Tác động môi trường"
        title={
          <>
            Mỗi giao dịch là một <span className="text-primary">hành động xanh</span>
          </>
        }
        description="Con số do hệ thống demo mô phỏng nhằm minh họa tiềm năng của nền tảng — không phải số liệu thực tế."
      />
      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {IMPACT_STATS.map((s, i) => {
          const Icon = icons[i % icons.length];
          return (
            <Reveal key={s.id} delay={0.08 * i}>
              <div className="group relative overflow-hidden rounded-3xl border border-border/70 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10">
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent/70 transition-transform duration-300 group-hover:scale-[1.8]" />
                <div className="relative">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-b from-[#2a9a5d] to-primary text-white shadow-lg shadow-primary/25">
                    <Icon className="h-6 w-6" strokeWidth={1.9} />
                  </span>
                  <p className="mt-5 text-[34px] font-extrabold leading-none tracking-tight text-forest">
                    <Counter value={s.value} suffix={s.suffix} />
                  </p>
                  <p className="mt-2 text-[14px] font-medium text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
      <Reveal delay={0.2}>
        <p className="mt-6 text-center text-[12.5px] text-muted-foreground/80">
          * Toàn bộ chỉ số là dữ liệu demo minh họa, được khởi tạo lại khi xóa phiên trình diễn.
        </p>
      </Reveal>
    </section>
  );
}

/* --------------------------------- CTA BAND --------------------------------- */

function CtaBand() {
  const { goAuth, setPending, toast } = useApp();
  return (
    <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
      <Reveal>
        <div className="brand-gradient-deep relative overflow-hidden rounded-[36px] px-6 py-14 text-center text-white sm:px-12">
          <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-mint/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-leaf/25 blur-2xl" />
          <div className="pointer-events-none absolute right-[18%] top-8 opacity-20">
            <Leaf className="h-16 w-16 animate-leaf-slow text-mint" />
          </div>
          <h2 className="relative text-balance text-[28px] font-extrabold leading-tight sm:text-[36px]">
            Sẵn sàng biến đồ cũ thành giá trị?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-mint/80">
            Tham gia phiên demo Green City ngay hôm nay — trải nghiệm trọn vòng: đăng tin, kết nối
            thu gom và xem tác động môi trường bạn tạo ra.
          </p>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={() => goAuth("register")}
              className="flex h-[52px] items-center gap-2.5 rounded-2xl bg-white px-7 text-[15px] font-bold text-forest shadow-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              Tạo tài khoản miễn phí
              <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={() => {
                setPending({ screen: "app", page: "collect" });
                goAuth("login");
                toast("info", "Đăng nhập để gửi yêu cầu", "Chế độ demo — nhanh và miễn phí.");
              }}
              className="flex h-[52px] items-center gap-2.5 rounded-2xl border-[1.5px] border-white/40 bg-white/10 px-7 text-[15px] font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/20"
            >
              <Truck className="h-[18px] w-[18px]" strokeWidth={2.2} />
              Gửi yêu cầu thu gom
            </button>
          </div>
          <p className="relative mt-6 text-[12px] text-mint/50">
            Website demo — không cần thông tin thật, mọi thao tác đều được mô phỏng.
          </p>
        </div>
      </Reveal>
    </section>
  );
}

/* --------------------------------- LANDING --------------------------------- */

export function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <CategoriesSection />
        <ProductsSection />
        <CollectSection />
        <ProcessSection />
        <ImpactSection />
        <CtaBand />
      </main>
      <Footer />
    </div>
  );
}
