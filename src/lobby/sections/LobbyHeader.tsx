"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/greencity/Logo";
import { useApp } from "@/store/app-store";
import { ROUTES } from "@/lib/routes";

/**
 * Header cố định. Trạng thái cuộn (.is-scrolled / .is-hidden) do animations/header.ts gắn trực tiếp
 * lên DOM — không setState mỗi lần cuộn nên không render lại React.
 */
export function LobbyHeader() {
  const { state } = useApp();
  const loggedIn = state.ready && !!state.user;

  return (
    <header data-header data-intro className="lobby-header fixed inset-x-0 top-0 z-50">
      <div className="lobby-header__bg absolute inset-0" aria-hidden="true" />
      <div className="lobby-header__bar relative mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
        <Link href={ROUTES.home} aria-label="Green City — về đầu trang" className="lobby-header__logo shrink-0 rounded-xl">
          {/* Điện thoại hẹp: chỉ biểu tượng để đủ chỗ cho 2 nút */}
          <Logo size={42} withText={false} className="sm:hidden" />
          <Logo size={44} className="hidden sm:inline-flex" />
        </Link>

        <nav aria-label="Tài khoản" className="flex items-center gap-2 sm:gap-3">
          {loggedIn ? (
            <Link
              href={ROUTES.dashboard}
              className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-xl bg-gc-700 px-3.5 sm:px-4 text-[15px] font-semibold text-white transition-colors hover:bg-gc-800"
            >
              Vào trang của tôi
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : (
            <>
              <Link
                href={ROUTES.login}
                className="inline-flex min-h-11 items-center whitespace-nowrap rounded-xl border-[1.5px] border-gc-700/70 px-3.5 sm:px-4 text-[15px] font-semibold text-gc-800 transition-colors hover:border-gc-700 hover:bg-gc-700/5"
              >
                Đăng nhập
              </Link>
              <Link
                href={ROUTES.register}
                className="inline-flex min-h-11 items-center whitespace-nowrap rounded-xl bg-gc-700 px-3.5 sm:px-4 text-[15px] font-semibold text-white transition-colors hover:bg-gc-800"
              >
                Đăng ký
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
