import { Hammer } from "lucide-react";
import { PageContainer, PageIntro } from "@/components/greencity/ui";

/**
 * Trang khung trong lúc tính năng đang được làm.
 * `npm run features:smoke` coi chữ "Đang xây dựng" là chưa xong — đừng đổi chữ này.
 */
export function FeatureStub({ title, note }: { title: string; note?: string }) {
  return (
    <PageContainer>
      <PageIntro title={title} />
      <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-primary">
          <Hammer className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="text-[16px] font-bold text-foreground">Đang xây dựng</p>
        <p className="max-w-sm text-[14px] text-muted-foreground">{note ?? "Trang này sẽ có trong bản cập nhật tới."}</p>
      </div>
    </PageContainer>
  );
}
