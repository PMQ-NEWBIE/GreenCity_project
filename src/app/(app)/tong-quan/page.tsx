import type { Metadata } from "next";
import { HomeRedirect } from "@/pages-views/HomeRedirect";

export const metadata: Metadata = { title: "Green City" };

/** Điểm vào chung (sau đăng nhập, nút trên lobby): chuyển tới trang đầu đúng vai trò và chế độ. */
export default function Page() {
  return <HomeRedirect />;
}
