import type { Metadata } from "next";
import { LobbyPage } from "@/lobby/LobbyPage";

const title = "Green City — Bán ve chai, gọi thu gom tận nhà";
const description =
  "Đồ cũ nhà bạn chưa phải là rác. Đăng bán ve chai trong một phút, hoặc gọi người thu mua quanh bạn tới tận nhà cân và trả tiền.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "Green City",
    locale: "vi_VN",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Green City — Đồ cũ nhà bạn chưa phải là rác" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] },
};

export default function Home() {
  return <LobbyPage />;
}
