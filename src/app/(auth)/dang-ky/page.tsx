import type { Metadata } from "next";
import { AuthScreen } from "@/pages-views/AuthScreen";
import { NEXT_PARAM, safeNextPath } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Đăng ký",
  description: "Tạo tài khoản Green City miễn phí để bán ve chai và gọi thu gom tận nhà.",
};

// Đọc ?tiep= ở server (thay vì useSearchParams) để HTML có sẵn nội dung form ngay từ lần tải đầu
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = (await searchParams)[NEXT_PARAM];
  return <AuthScreen mode="register" next={safeNextPath(typeof raw === "string" ? raw : null)} />;
}
