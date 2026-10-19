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
  // Đường dẫn cũ /lobby (bản nháp trước) giờ là trang chủ
  async redirects() {
    return [{ source: "/lobby", destination: "/", permanent: true }];
  },
};

export default nextConfig;
