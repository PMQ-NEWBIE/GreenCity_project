"use client";

import { useRef } from "react";
import { Camera, Trash2 } from "lucide-react";
import {
  SWAP_SAMPLE_IMAGES,
  compressImage,
  useToast,
} from "@/features/contracts";
import { SmartImage } from "@/components/greencity/SmartImage";
import {
  FieldError,
  StepHeading,
  buttonClass,
} from "@/components/greencity/ui";
import { cn } from "@/lib/utils";

interface SwapImageStepProps {
  image: string;
  error?: string;
  onImageChange: (url: string) => void;
  onClearError: () => void;
}

export function SwapImageStep({
  image,
  error,
  onImageChange,
  onClearError,
}: SwapImageStepProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const dataUrl = await compressImage(file);
      onImageChange(dataUrl);
      onClearError();
    } catch {
      toast("error", "Không đọc được ảnh", "Vui lòng chọn ảnh khác.");
    }
  };

  return (
    <section aria-labelledby="step-1" className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
      <StepHeading
        id="step-1"
        step={1}
        title="Chụp hoặc chọn ảnh"
        hint="Ảnh thật giúp mọi người tin tưởng và hẹn trao đổi nhanh hơn."
      />
      <div className="mt-4">
        {image ? (
          <div className="relative overflow-hidden rounded-2xl border border-border">
            <SmartImage
              src={image}
              alt="Ảnh món đồ trao đổi"
              className="aspect-[4/3] w-full"
              sizes="(max-width: 1024px) 100vw, 600px"
            />
            <button
              type="button"
              onClick={() => onImageChange("")}
              className={cn(
                buttonClass.secondary,
                "absolute right-3 top-3 min-h-11 px-3 text-[14px]"
              )}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Đổi ảnh
            </button>
          </div>
        ) : (
          <button
            id="swap-image"
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-describedby={error ? "swap-image-err" : undefined}
            className={cn(
              "flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-muted/40 text-center transition-colors hover:border-primary/60 hover:bg-accent",
              error ? "border-destructive" : "border-border"
            )}
          >
            <Camera className="h-8 w-8 text-primary" strokeWidth={1.75} aria-hidden="true" />
            <span className="text-[15px] font-semibold text-foreground">
              Chụp ảnh hoặc chọn từ máy
            </span>
            <span className="text-[13px] text-muted-foreground">
              Hỗ trợ JPG, PNG — nén tự động trước khi tải lên
            </span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onPickFile}
          className="hidden"
        />
        <FieldError id="swap-image-err" msg={error} />

        {!image && (
          <div className="mt-4">
            <p className="text-[13px] font-semibold text-muted-foreground">
              Hoặc chọn ảnh mẫu có sẵn:
            </p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {SWAP_SAMPLE_IMAGES.map((img) => (
                <button
                  key={img.url}
                  type="button"
                  onClick={() => {
                    onImageChange(img.url);
                    onClearError();
                  }}
                  aria-label={`Dùng ảnh mẫu: ${img.label}`}
                  className="group overflow-hidden rounded-xl border border-border hover:border-primary transition-colors"
                >
                  <SmartImage src={img.url} alt="" className="aspect-square w-full" sizes="80px" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
