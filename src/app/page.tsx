"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AppProvider, useApp } from "@/store/app-store";
import { LandingPage } from "@/pages-views/LandingPage";
import { AuthScreen } from "@/pages-views/AuthScreen";
import { AppShell } from "@/pages-views/AppShell";
import { GcToasts } from "@/components/greencity/GcToasts";
import { LogoMark } from "@/components/greencity/Logo";

function GreenCityApp() {
  const { state } = useApp();
  const route = state.route;

  return (
    <>
      <AnimatePresence mode="wait">
        {route.screen === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LandingPage />
          </motion.div>
        )}
        {route.screen === "auth" && (
          <motion.div
            key="auth"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <AuthScreen />
          </motion.div>
        )}
        {route.screen === "app" && (
          <motion.div
            key="app"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <AppShell />
          </motion.div>
        )}
      </AnimatePresence>
      <GcToasts />
    </>
  );
}

function Splash({ done }: { done: boolean }) {
  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-background"
        >
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <LogoMark size={72} id="splash-logo" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex flex-col items-center gap-3"
          >
            <p className="text-[22px] font-extrabold tracking-tight text-forest">
              Green<span className="text-primary">City</span>
            </p>
            <div className="h-1 w-36 overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                className="h-full w-1/2 rounded-full bg-primary"
              />
            </div>
            <p className="text-[11.5px] font-medium tracking-wide text-muted-foreground">
              Thành phố xanh hơn, giá trị sống tốt hơn
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Cho phép hydrate localStorage trước khi hiển thị — tránh nhấp nháy
    const t = window.setTimeout(() => setMounted(true), 650);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <AppProvider>
      {mounted ? <GreenCityApp /> : null}
      <Splash done={mounted} />
    </AppProvider>
  );
}
