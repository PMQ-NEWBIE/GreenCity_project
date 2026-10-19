"use client";

import { useRef } from "react";
import { Camera, X } from "lucide-react";
import { SmartImage } from "@/components/greencity/SmartImage";
import { FieldError } from "@/components/greencity/ui";
import { useToast } from "@/store/hooks";
import { compressImage } from "@/lib/image";
import { cn } from "@/lib/utils";

interface PhotoPickerProps {
  /** id của nút thêm ảnh — để focus khi báo lỗi */
  id: string;
  photos: string[];
  onChange: (photos: string[]) => void;
  max?: number;
  error?: string;
}

/** Chọn tối đa `max` ảnh, nén trước khi lưu (xem compressImage). */
export function PhotoPicker({ id, photos, onChange, max = 3, error }: PhotoPickerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const full = photos.length >= max;

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = [...(e.target.files ?? [])].filter((f) => f.type.startsWith("image/")).slice(0, max - photos.length);
    e.target.value = "";
    if (files.length === 0) return;
    try {
      const added = await Promise.all(files.map((f) => compressImage(f)));
      onChange([...photos, ...added]);
    } catch {
      toast("error", "Không đọc được ảnh", "Vui lòng thử một ảnh khác.");
    }
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:max-w-md">
        {photos.map((src, i) => (
          <div key={i} className="relative">
            <SmartImage src={src} alt={`Ảnh ${i + 1}`} className="aspect-square w-full rounded-xl border border-border" sizes="140px" />
            <button
              type="button"
              onClick={() => onChange(photos.filter((_, j) => j !== i))}
              aria-label={`Bỏ ảnh ${i + 1}`}
              className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/75"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
        {!full && (
          <button
            id={id}
            type="button"
            onClick={() => fileRef.current?.click()}
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed bg-muted/40 text-center transition-colors hover:border-primary/60 hover:bg-accent",
              error ? "border-destructive" : "border-border"
            )}
          >
            <Camera className="h-6 w-6 text-primary" strokeWidth={1.75} aria-hidden="true" />
            <span className="text-[13px] font-semibold text-foreground">Thêm ảnh</span>
            <span className="text-[12px] text-muted-foreground">
              {photos.length}/{max}
            </span>
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple onChange={onPick} className="hidden" />
      <FieldError msg={error} />
    </div>
  );
}
