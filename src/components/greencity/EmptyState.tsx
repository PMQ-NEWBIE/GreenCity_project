"use client";

import { motion } from "framer-motion";
import { PackageOpen, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon = PackageOpen, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn("flex flex-col items-center justify-center gap-3 py-14 text-center", className)}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-accent text-primary">
        <Icon className="h-7 w-7" strokeWidth={1.75} />
      </div>
      <h3 className="text-[17px] font-bold text-foreground">{title}</h3>
      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </motion.div>
  );
}
