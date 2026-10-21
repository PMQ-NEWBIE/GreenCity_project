import Link from "next/link";
import { Wordmark } from "@/components/greencity/Logo";
import { ROUTES } from "@/lib/routes";

export function LobbyFooter() {
  return (
    <footer className="border-t border-gc-900 bg-gc-950 dark:border-border dark:bg-surface px-5 py-10 text-gc-100 dark:text-text-secondary sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Wordmark fontSize={20} variant="white" />
          <p className="mt-3 text-[14px] text-gc-200/90 dark:text-text-muted">
            © {new Date().getFullYear()} Green City · Nền tảng kết nối người bán ve chai, thu mua và tái chế vì kinh tế tuần hoàn.
          </p>
        </div>
        <nav aria-label="Liên kết cuối trang">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[14px] font-semibold text-gc-100 dark:text-text-secondary">
            <li>
              <Link href={ROUTES.login} className="inline-block py-2 transition-colors hover:text-white dark:hover:text-foreground">
                Đăng nhập
              </Link>
            </li>
            <li>
              <Link href={ROUTES.register} className="inline-block py-2 transition-colors hover:text-white dark:hover:text-foreground">
                Đăng ký
              </Link>
            </li>
            <li>
              <a href="mailto:hello@greencity.vn" className="inline-block py-2 text-brown-100 dark:text-brown transition-colors hover:text-white dark:hover:text-primary">
                hello@greencity.vn
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
