import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gemini và Claude làm chung thư mục: mỗi bên build ra thư mục riêng để không đè nhau
  // (Claude chạy với NEXT_DIST_DIR=.next-claude, Gemini và người dùng dùng .next mặc định).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  output: "standalone",
  reactStrictMode: true,
  images: {
    // Ảnh sản phẩm mẫu nằm trên CDN ngoài — để Next tối ưu (resize + WebP/AVIF + cache)
    remotePatterns: [new URL("https://z-cdn.chatglm.cn/image-search-mcp/**")],
    formats: ["image/avif", "image/webp"],
    qualities: [70, 80],
  },
  async redirects() {
    return [
      // Đường dẫn cũ /lobby (bản nháp trước) giờ là trang chủ
      { source: "/lobby", destination: "/", permanent: true },
      // Khu quản lý đã tách ra khu làm việc riêng (2026-10)
      { source: "/quan-tri", destination: "/van-hanh", permanent: false },
      { source: "/cho-vat-lieu", destination: "/doanh-nghiep", permanent: false },
      { source: "/thong-ke", destination: "/doanh-nghiep/thong-ke", permanent: false },
    ];
  },
};

export default nextConfig;
