import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Green City — Thành phố xanh hơn, giá trị sống tốt hơn",
  description:
    "Sàn giao dịch ve chai, đồ tái chế và vật dụng cũ. Kết nối cộng đồng thu gom để biến rác thải hôm nay thành tài nguyên ngày mai. (Website demo)",
  keywords: [
    "Green City",
    "tái chế",
    "ve chai",
    "phế liệu",
    "thu gom rác",
    "kinh tế tuần hoàn",
  ],
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#248B52",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${beVietnam.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
