import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LOBBY_ASSETS } from "../assets";
import { ROUTES } from "@/lib/routes";

export function LobbyCta() {
  return (
    <section aria-labelledby="cta-title" className="relative overflow-hidden bg-gc-800 px-5 py-24 sm:px-6 md:py-32 lg:px-10">
      <Image
        src={LOBBY_ASSETS.ctaBackground.src}
        alt={LOBBY_ASSETS.ctaBackground.alt}
        fill
        sizes="100vw"
        quality={75}
        loading="lazy"
        className="object-cover opacity-50"
      />
      {/* Lớp tối giúp chữ trắng đạt tương phản ≥ 4.5:1 dù ảnh nền thế nào */}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-gc-950/92 via-gc-900/80 to-gc-900/50" />

      <div className="relative mx-auto max-w-6xl">
        <h2 id="cta-title" className="max-w-[18ch] text-[clamp(2rem,4.6vw,4rem)] font-extrabold leading-[1.05] tracking-[-0.02em] text-white">
          Nhà bạn đang có gì cần dọn?
        </h2>
        <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-gc-100">
          Tạo tài khoản miễn phí, chưa tới một phút. Đã có tài khoản thì đăng nhập để tiếp tục.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <div data-magnetic className="inline-block">
            <Link
              href={ROUTES.register}
              className="group inline-flex min-h-[54px] items-center gap-2.5 rounded-2xl bg-gc-300 px-7 text-[16px] font-bold text-gc-950 transition-colors hover:bg-gc-200"
            >
              Đăng ký
              <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>
          <Link
            href={ROUTES.login}
            className="inline-flex min-h-[54px] items-center rounded-2xl border-[1.5px] border-white/50 px-7 text-[16px] font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </section>
  );
}
