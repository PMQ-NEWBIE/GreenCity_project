import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Montserrat } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  // Tiếng Việt chỉ cần latin + vietnamese (latin-ext thừa). Mỗi weight × bộ ký tự là một file
  // được preload — giữ ít để không tranh băng thông với CSS trên mạng chậm.
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Font chữ thương hiệu "GREEN CITY" — khối hình học đậm giống wordmark trong logo
const brandFont = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["800"],
  display: "swap",
  preload: false, // chỉ dùng cho chữ thương hiệu — tải sau, không chặn trang
});

export const metadata: Metadata = {
  metadataBase: new URL("https://greencity.vn"),
  title: {
    default: "Green City — Bán ve chai, gọi thu gom tận nhà",
    template: "%s · Green City",
  },
  description:
    "Bán ve chai và đồ cũ, tìm mua phế liệu theo khu vực, hoặc gọi người tới tận nhà thu gom — tại TP. Hồ Chí Minh.",
  keywords: ["Green City", "ve chai", "phế liệu", "thu gom rác", "tái chế", "đồ cũ"],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF7F0" },
    { media: "(prefers-color-scheme: dark)", color: "#121813" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        {/* Đánh dấu JS đã chạy trước khi vẽ trang — CSS dùng class này để ẩn
            phần tử chờ intro mà không làm mất nội dung khi JS bị tắt */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className={`${beVietnam.variable} ${brandFont.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
