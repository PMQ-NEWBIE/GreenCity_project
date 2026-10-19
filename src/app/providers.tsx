"use client";

import { LazyMotion, MotionConfig } from "framer-motion";
import { ThemeProvider } from "@/components/theme-provider";
import { AppProvider } from "@/store/app-store";
import { GcToasts } from "@/components/greencity/GcToasts";

// Nạp phần animation của framer-motion bất đồng bộ → gói JS ban đầu nhẹ hơn ở mọi trang
const loadMotionFeatures = () => import("./motion-features").then((mod) => mod.default);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {/* LazyMotion: chỉ dùng m.* (nhẹ) thay cho motion.* — `strict` báo lỗi nếu lỡ dùng motion.* */}
      <LazyMotion features={loadMotionFeatures} strict>
        <MotionConfig reducedMotion="user">
          <AppProvider>
            {children}
            <GcToasts />
          </AppProvider>
        </MotionConfig>
      </LazyMotion>
    </ThemeProvider>
  );
}
