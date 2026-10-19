"use client";

import {
  SWAP_CATEGORY_LABEL,
  SWAP_CONDITION_LABEL,
  type SwapCategory,
  type SwapCondition,
} from "@/features/contracts";
import {
  ChoiceChip,
  FieldError,
  StepHeading,
  inputClass,
} from "@/components/greencity/ui";
import { cn } from "@/lib/utils";

const CATEGORIES: SwapCategory[] = ["quan-ao", "sach", "gia-dung", "do-tre-em", "khac"];
const CONDITIONS: SwapCondition[] = ["nhu-moi", "tot", "da-dung"];

interface SwapItemInfoStepProps {
  title: string;
  category: SwapCategory | "";
  condition: SwapCondition | "";
  description: string;
  errors: Record<string, string>;
  onTitleChange: (v: string) => void;
  onCategoryChange: (v: SwapCategory) => void;
  onConditionChange: (v: SwapCondition) => void;
  onDescriptionChange: (v: string) => void;
  onClearError: (key: string) => void;
}

export function SwapItemInfoStep({
  title,
  category,
  condition,
  description,
  errors,
  onTitleChange,
  onCategoryChange,
  onConditionChange,
  onDescriptionChange,
  onClearError,
}: SwapItemInfoStepProps) {
  return (
    <section aria-labelledby="step-2" className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
      <StepHeading id="step-2" step={2} title="Thông tin món đồ" />

      <div>
        <label htmlFor="swap-title" className="mb-1.5 block text-[14px] font-semibold text-foreground">
          Tiêu đề món đồ
        </label>
        <input
          id="swap-title"
          value={title}
          onChange={(e) => {
            onTitleChange(e.target.value);
            onClearError("title");
          }}
          placeholder="VD: Áo khoác jean nam size L còn rất mới"
          aria-invalid={!!errors.title}
          className={inputClass(errors.title)}
        />
        <FieldError msg={errors.title} />
      </div>

      <fieldset>
        <legend className="mb-1.5 text-[14px] font-semibold text-foreground">
          Loại món đồ
        </legend>
        <div id="swap-category" tabIndex={-1} className="flex flex-wrap gap-2 outline-none">
          {CATEGORIES.map((c) => (
            <ChoiceChip
              key={c}
              selected={category === c}
              onClick={() => {
                onCategoryChange(c);
                onClearError("category");
              }}
            >
              {SWAP_CATEGORY_LABEL[c]}
            </ChoiceChip>
          ))}
        </div>
        <FieldError msg={errors.category} />
      </fieldset>

      <fieldset>
        <legend className="mb-1.5 text-[14px] font-semibold text-foreground">
          Tình trạng sử dụng
        </legend>
        <div id="swap-condition" tabIndex={-1} className="flex flex-wrap gap-2 outline-none">
          {CONDITIONS.map((c) => (
            <ChoiceChip
              key={c}
              selected={condition === c}
              onClick={() => {
                onConditionChange(c);
                onClearError("condition");
              }}
            >
              {SWAP_CONDITION_LABEL[c]}
            </ChoiceChip>
          ))}
        </div>
        <FieldError msg={errors.condition} />
      </fieldset>

      <div>
        <label htmlFor="swap-description" className="mb-1.5 block text-[14px] font-semibold text-foreground">
          Mô tả chi tiết
        </label>
        <textarea
          id="swap-description"
          rows={4}
          value={description}
          onChange={(e) => {
            onDescriptionChange(e.target.value);
            onClearError("description");
          }}
          placeholder="Tình trạng sử dụng, kích cỡ, vết xước nếu có, thời gian rảnh để hẹn lấy đồ..."
          aria-invalid={!!errors.description}
          className={cn(inputClass(errors.description), "h-auto resize-none py-3")}
        />
        <div className="mt-1 flex items-start justify-between gap-3">
          <FieldError msg={errors.description} />
          <span className="ml-auto text-[13px] text-muted-foreground">
            {description.trim().length}/20 ký tự tối thiểu
          </span>
        </div>
      </div>
    </section>
  );
}
