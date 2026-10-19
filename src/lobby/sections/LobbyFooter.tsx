import Link from "next/link";
import { Wordmark } from "@/components/greencity/Logo";
import { ROUTES } from "@/lib/routes";

export function LobbyFooter() {
  return (
    <footer className="bg-gc-950 px-5 py-10 text-gc-200 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Wordmark fontSize={20} variant="white" />
          <p className="mt-3 text-[14px]">
            © {new Date().getFullYear()} Green City · Dự án demo cho đồ án, dữ liệu trên trang là minh họa.
          </p>
        </div>
        <nav aria-label="Liên kết cuối trang">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[14px] font-semibold">
            <li>
              <Link href={ROUTES.login} className="inline-block py-2 hover:text-white">
                Đăng nhập
              </Link>
            </li>
            <li>
              <Link href={ROUTES.register} className="inline-block py-2 hover:text-white">
                Đăng ký
              </Link>
            </li>
            <li>
              <a href="mailto:hello@greencity.vn" className="inline-block py-2 hover:text-white">
                hello@greencity.vn
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
