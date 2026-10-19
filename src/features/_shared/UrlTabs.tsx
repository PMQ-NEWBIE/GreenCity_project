"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export interface UrlTab {
  key: string;
  label: string;
  /** Số việc đang chờ — hiện cạnh nhãn */
  count?: number;
  content: React.ReactNode;
}

/** Thanh tab lưu tab đang mở trên URL (?tab=) → chia sẻ link, nút Back hoạt động. */
export function UrlTabs({ tabs, label, param = "tab" }: { tabs: UrlTab[]; label: string; param?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const raw = searchParams.get(param);
  const active = tabs.find((t) => t.key === raw) ?? tabs[0];

  const select = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (key === tabs[0].key) params.delete(param);
    else params.set(param, key);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div>
      <div className="hide-scrollbar -mx-4 flex gap-1 overflow-x-auto border-b border-border px-4 sm:mx-0 sm:px-0" role="tablist" aria-label={label}>
        {tabs.map((t) => (
          <button
            key={t.key}
            id={`tab-${t.key}`}
            type="button"
            role="tab"
            aria-selected={t.key === active.key}
            aria-controls={`panel-${t.key}`}
            onClick={() => select(t.key)}
            className={cn(
              "-mb-px flex min-h-12 shrink-0 items-center gap-2 border-b-2 px-3 text-[15px] font-semibold transition-colors",
              t.key === active.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
            {t.count != null && t.count > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-[12px] font-bold text-primary-foreground">{t.count}</span>
            )}
          </button>
        ))}
      </div>
      <div id={`panel-${active.key}`} role="tabpanel" aria-labelledby={`tab-${active.key}`} className="mt-5">
        {active.content}
      </div>
    </div>
  );
}
