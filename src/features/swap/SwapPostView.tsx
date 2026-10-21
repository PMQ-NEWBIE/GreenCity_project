"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ROUTES,
  AREAS,
  SWAP_SAMPLE_IMAGES,
  useSwap,
  useToast,
  type SwapCategory,
  type SwapCondition,
  type NewSwapItem,
} from "@/features/contracts";
import {
  FieldError,
  PageContainer,
  PageIntro,
  StepHeading,
  buttonClass,
  inputClass,
} from "@/components/greencity/ui";
import { cn } from "@/lib/utils";
import { SwapImageStep } from "./components/SwapImageStep";
import { SwapItemInfoStep } from "./components/SwapItemInfoStep";
import { SwapPreviewCard } from "./components/SwapPreviewCard";

export function SwapPostView() {
  const router = useRouter();
  const { addItem } = useSwap();
  const toast = useToast();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<SwapCategory | "">("");
  const [condition, setCondition] = useState<SwapCondition | "">("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [giveaway, setGiveaway] = useState(true);
  const [wants, setWants] = useState("");
  const [area, setArea] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const clearError = (key: string) =>
    setErrors((prev) => (prev[key] ? { ...prev, [key]: "" } : prev));

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!image) errs.image = "Thêm một tấm ảnh để mọi người dễ hình dung";
    if (title.trim().length < 4) errs.title = "Tiêu đề cần ít nhất 4 ký tự";
    if (!category) errs.category = "Chọn loại đồ trao đổi";
    if (!condition) errs.condition = "Chọn tình trạng món đồ";
    if (description.trim().length < 20)
      errs.description = "Mô tả thêm một chút (ít nhất 20 ký tự)";
    if (!giveaway && wants.trim().length < 3)
      errs.wants = "Nhập món đồ bạn muốn đổi lấy (ít nhất 3 ký tự)";
    if (!area) errs.area = "Chọn khu vực bạn đang ở";

    setErrors(errs);

    const firstKey = Object.keys(errs)[0];
    if (firstKey) {
      document.getElementById(`swap-${firstKey}`)?.focus();
    }
    return !firstKey;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "idle") return;

    if (!validate()) {
      toast("error", "Còn vài chỗ cần điền", "Xem các dòng chữ đỏ trong form.");
      return;
    }

    setStatus("loading");
    window.setTimeout(() => {
      const input: NewSwapItem = {
        title: title.trim(),
        category: category as SwapCategory,
        condition: condition as SwapCondition,
        description: description.trim(),
        image,
        area: area as NewSwapItem["area"],
        giveaway,
        wants: giveaway ? "" : wants.trim(),
      };

      const newItem = addItem(input);
      setStatus("success");
      toast("success", "Đã đăng đồ trao đổi", "Món đồ của bạn đã lên sàn trao đổi.");
      router.push(ROUTES.swapItem(newItem.id));
    }, 400);
  };

  const fillSample = () => {
    setTitle("Bàn học gấp gọn gỗ ép");
    setCategory("gia-dung");
    setCondition("tot");
    setDescription(
      "Bàn gấp gọn chân thép sơn tĩnh điện, mặt gỗ ép còn rất mới, không trầy xước, để vừa phòng trọ sinh viên."
    );
    setGiveaway(true);
    setWants("");
    setArea("Bình Thạnh");
    setImage(SWAP_SAMPLE_IMAGES[0]?.url || "/content/swap/mau-1.webp");
    setErrors({});
  };

  const selectCls = (err?: string) =>
    cn(inputClass(err), "select-chevron cursor-pointer appearance-none");

  return (
    <PageContainer className="max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <PageIntro title="Đăng đồ cho tặng, đổi">
          Điền 4 bước dưới đây để chia sẻ đồ dùng cũ còn tốt. Tặng miễn phí hoặc đổi lấy món khác, hoàn toàn không dùng tiền.
        </PageIntro>
        <button
          type="button"
          onClick={fillSample}
          className={cn(buttonClass.ghost, "text-[14px]")}
        >
          Điền thử dữ liệu mẫu
        </button>
      </div>

      <form
        onSubmit={onSubmit}
        noValidate
        className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]"
      >
        <div className="flex flex-col gap-8">
          {/* Bước 1: Ảnh */}
          <SwapImageStep
            image={image}
            error={errors.image}
            onImageChange={setImage}
            onClearError={() => clearError("image")}
          />

          {/* Bước 2: Món đồ */}
          <SwapItemInfoStep
            title={title}
            category={category}
            condition={condition}
            description={description}
            errors={errors}
            onTitleChange={setTitle}
            onCategoryChange={setCategory}
            onConditionChange={setCondition}
            onDescriptionChange={setDescription}
            onClearError={clearError}
          />

          {/* Bước 3: Bạn muốn gì? */}
          <section aria-labelledby="step-3" className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
            <StepHeading id="step-3" step={3} title="Bạn muốn tặng hay đổi lấy gì?" />
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2" role="radiogroup" aria-labelledby="step-3">
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors",
                  giveaway ? "border-primary bg-accent" : "border-border hover:border-primary/40"
                )}
              >
                <input
                  type="radio"
                  name="giveaway-option"
                  checked={giveaway}
                  onChange={() => {
                    setGiveaway(true);
                    setWants("");
                    clearError("wants");
                  }}
                  className="mt-0.5 h-4 w-4 accent-primary"
                />
                <div>
                  <span className="block text-[15px] font-bold text-foreground">
                    Tặng miễn phí
                  </span>
                  <span className="block text-[13px] text-muted-foreground">
                    Chia sẻ cho ai đang cần, mang lại niềm vui cho cộng đồng
                  </span>
                </div>
              </label>

              <label
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors",
                  !giveaway ? "border-primary bg-accent" : "border-border hover:border-primary/40"
                )}
              >
                <input
                  type="radio"
                  name="giveaway-option"
                  checked={!giveaway}
                  onChange={() => setGiveaway(false)}
                  className="mt-0.5 h-4 w-4 accent-primary"
                />
                <div>
                  <span className="block text-[15px] font-bold text-foreground">
                    Muốn đổi lấy món khác
                  </span>
                  <span className="block text-[13px] text-muted-foreground">
                    Đổi lấy đồ dùng, sách báo hoặc chậu cây bạn đang tìm
                  </span>
                </div>
              </label>
            </div>

            {!giveaway && (
              <div className="mt-4">
                <label htmlFor="swap-wants" className="mb-1.5 block text-[14px] font-semibold text-foreground">
                  Bạn muốn đổi lấy món gì?
                </label>
                <input
                  id="swap-wants"
                  value={wants}
                  onChange={(e) => {
                    setWants(e.target.value);
                    clearError("wants");
                  }}
                  placeholder="VD: Sách dạy nấu ăn hoặc chậu cây nhỏ để bàn"
                  aria-invalid={!!errors.wants}
                  className={inputClass(errors.wants)}
                />
                <FieldError msg={errors.wants} />
              </div>
            )}
          </section>

          {/* Bước 4: Khu vực */}
          <section aria-labelledby="step-4" className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
            <StepHeading id="step-4" step={4} title="Khu vực hẹn gặp trao đổi" />
            <div className="mt-4">
              <label htmlFor="swap-area" className="mb-1.5 block text-[14px] font-semibold text-foreground">
                Quận / Huyện tại TP.HCM
              </label>
              <select
                id="swap-area"
                value={area}
                onChange={(e) => {
                  setArea(e.target.value);
                  clearError("area");
                }}
                aria-invalid={!!errors.area}
                className={selectCls(errors.area)}
              >
                <option value="">Chọn quận...</option>
                {AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <FieldError msg={errors.area} />
            </div>
          </section>
        </div>

        {/* Cột phải: Xem trước thẻ & Nút gửi */}
        <SwapPreviewCard
          image={image}
          title={title}
          category={category}
          condition={condition}
          giveaway={giveaway}
          wants={wants}
          area={area}
          status={status}
        />
      </form>
    </PageContainer>
  );
}
