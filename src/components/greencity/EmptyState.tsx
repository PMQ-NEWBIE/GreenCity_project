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
    <div className={cn("page-enter flex flex-col items-center justify-center gap-3 py-14 text-center", className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/80 bg-accent text-primary shadow-xs">
        <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <h3 className="text-[17px] font-bold text-foreground">{title}</h3>
      <p className="max-w-sm text-[15px] leading-relaxed text-muted-foreground">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
