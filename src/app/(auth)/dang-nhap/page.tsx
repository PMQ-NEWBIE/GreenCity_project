import type { Metadata } from "next";
import { AuthScreen } from "@/pages-views/AuthScreen";
import { NEXT_PARAM, safeNextPath } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập vào Green City để quản lý tin đăng và yêu cầu thu gom.",
};

// Đọc ?tiep= ở server (thay vì useSearchParams) để HTML có sẵn nội dung form ngay từ lần tải đầu
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = (await searchParams)[NEXT_PARAM];
  return <AuthScreen mode="login" next={safeNextPath(typeof raw === "string" ? raw : null)} />;
}
