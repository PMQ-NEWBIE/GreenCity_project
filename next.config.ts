import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
