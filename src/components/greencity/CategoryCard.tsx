"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Anvil, Armchair, Laptop, Newspaper, Wine, ArrowUpRight } from "lucide-react";
import type { Category } from "@/types";
import { useApp } from "@/store/app-store";
import { SmartImage } from "./SmartImage";
import { cn } from "@/lib/utils";

const ICONS = {
  newspaper: Newspaper,
  bottle: Wine,
  anvil: Anvil,
  wine: Wine,
  laptop: Laptop,
  armchair: Armchair,
} as const;

interface CategoryCardProps {
  category: Category;
  index?: number;
}

export function CategoryCard({ category, index = 0 }: CategoryCardProps) {
  const reduced = useReducedMotion();
  const { state, goApp, goAuth, setPending, setDiscoverPreset, toast } = useApp();
  const Icon = ICONS[category.icon] ?? Newspaper;

  const openCategory = () => {
    setDiscoverPreset(category.id);
    if (state.user) {
      goApp("discover");
    } else {
      setPending({ screen: "app", page: "discover" });
      goAuth("login");
      toast("info", "Đăng nhập để khám phá danh mục", category.name);
    }
  };

  return (
    <motion.button
      type="button"
      onClick={openCategory}
      initial={{ opacity: 0, y: reduced ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.07, 0.4), ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.985 }}
      className="group relative flex h-[240px] w-full flex-col justify-end overflow-hidden rounded-3xl text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <SmartImage
        src={category.image}
        alt={category.name}
        className="absolute inset-0 h-full w-full"
        imgClassName="transition-transform duration-[600ms] ease-out group-hover:scale-[1.07]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-forest/92 via-forest/38 to-forest/5" />
      <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-all duration-300 group-hover:bg-white group-hover:text-forest">
        <ArrowUpRight className="h-4.5 w-4.5 transition-transform duration-300 group-hover:rotate-45" />
      </div>
      <div className="relative z-10 flex flex-col gap-1.5 p-5">
        <span
          className={cn(
            "mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-mint/95 text-forest shadow-sm"
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="text-[17px] font-bold leading-tight text-white">{category.name}</h3>
        <p className="line-clamp-2 text-[12.5px] leading-snug text-mint/85">{category.description}</p>
        <p className="mt-1 inline-flex w-fit rounded-full bg-white/16 px-2.5 py-1 text-[11.5px] font-semibold text-mint backdrop-blur-sm">
          {category.priceHint}
        </p>
      </div>
    </motion.button>
  );
}
