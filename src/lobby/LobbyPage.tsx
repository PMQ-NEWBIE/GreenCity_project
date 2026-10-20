"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "lenis/dist/lenis.css";
import "./lobby.css";
import { LOBBY_MEDIA, LOBBY_MOTION } from "./config";
import { startSmoothScroll } from "./animations/smoothScroll";
import { playIntro, playReducedIntro } from "./animations/intro";
import { createHeroMobileParallax, createHeroPin } from "./animations/heroScroll";
import { startHeroFit } from "./animations/heroFit";
import { startMagnetic, startMouseParallax } from "./animations/pointer";
import { revealFeatures, revealInkHeadings, startHeaderBehavior } from "./animations/sections";
import { startInkSway } from "./animations/ink";
import { LobbyHeader } from "./sections/LobbyHeader";
import { LobbyHero } from "./sections/LobbyHero";
import { LobbyFeatures } from "./sections/LobbyFeatures";
import { LobbyCta } from "./sections/LobbyCta";
import { LobbyFooter } from "./sections/LobbyFooter";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

export function LobbyPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      startHeaderBehavior(root);
      // Đo trước intro: lá / xe đạp đã đúng chỗ ngay khung hình đầu tiên hiện ra
      const stopHeroFit = startHeroFit(root);

      // Intro chỉ chạy một lần; mouse parallax đợi intro xong để không tranh thuộc tính x/y
      let introDone = false;
      const afterIntro: (() => void)[] = [];
      const whenIntroDone = (fn: () => void) => (introDone ? fn() : afterIntro.push(fn));

      const mmIntro = gsap.matchMedia();
      mmIntro.add({ motionOK: LOBBY_MEDIA.motionOK, reduce: LOBBY_MEDIA.reduceMotion }, (ctx) => {
        if (ctx.conditions?.reduce) {
          playReducedIntro(root);
          introDone = true;
          return;
        }
        const stopSmooth = startSmoothScroll();
        const lite = window.matchMedia(LOBBY_MEDIA.mobile).matches;
        playIntro(root, { lite }).eventCallback("onComplete", () => {
          introDone = true;
          afterIntro.splice(0).forEach((fn) => fn());
        });
        return stopSmooth;
      });

      // Bố cục theo kích thước màn hình — tự dựng lại khi đổi qua mốc 768 / 1024px
      const mmLayout = gsap.matchMedia();
      mmLayout.add(
        {
          desktop: `${LOBBY_MEDIA.desktop} and ${LOBBY_MEDIA.motionOK}`,
          tablet: `${LOBBY_MEDIA.tablet} and ${LOBBY_MEDIA.motionOK}`,
          mobile: `${LOBBY_MEDIA.mobile} and ${LOBBY_MEDIA.motionOK}`,
          finePointer: LOBBY_MEDIA.finePointer,
        },
        (ctx) => {
          const c = ctx.conditions ?? {};
          if (!c.desktop && !c.tablet && !c.mobile) return; // reduced motion: không ghim, không parallax

          if (c.mobile) createHeroMobileParallax(root);
          else createHeroPin(root, c.desktop ? LOBBY_MOTION.pin.desktopDistance : LOBBY_MOTION.pin.tabletDistance);
          revealFeatures(root, !c.mobile);
          revealInkHeadings(root, !!c.mobile);

          if (!(c.desktop && c.finePointer)) return;
          let stopMouse: (() => void) | undefined;
          let stopSway: (() => void) | undefined;
          let disposed = false;
          const heroTitle = root.querySelector<HTMLElement>("[data-ink-variant=hero]");

          whenIntroDone(() => {
            if (!disposed) {
              stopMouse = startMouseParallax(root);
              if (heroTitle) stopSway = startInkSway(heroTitle);
            }
          });
          const stopMagnetic = startMagnetic(root);
          return () => {
            disposed = true;
            stopMouse?.();
            stopSway?.();
            stopMagnetic();
          };
        }
      );

      // Font tải xong có thể đổi chiều cao chữ → tính lại vị trí các mốc cuộn
      document.fonts?.ready.then(() => ScrollTrigger.refresh());

      return () => {
        mmLayout.revert();
        mmIntro.revert();
        stopHeroFit();
      };
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className="lobby relative overflow-x-clip bg-gc-50 text-gc-900">
      {/* Lớp hạt film rất nhẹ — ảnh tĩnh, không animate */}
      <div aria-hidden="true" className="lobby-grain pointer-events-none fixed inset-0 z-[70]" />
      <LobbyHeader />
      <main>
        {/* Wrapper do React quản lý — GSAP chèn pin-spacer vào giữa wrapper và hero */}
        <div>
          <LobbyHero />
        </div>
        <LobbyFeatures />
        <LobbyCta />
      </main>
      <LobbyFooter />
    </div>
  );
}
