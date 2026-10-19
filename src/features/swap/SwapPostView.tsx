"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, MapPin, Send, Trash2, Heart, Repeat } from "lucide-react";
import {
  ROUTES,
  AREAS,
  SWAP_CATEGORY_LABEL,
  SWAP_CONDITION_LABEL,
  SWAP_SAMPLE_IMAGES,
  compressImage,
  useSwap,
  useToast,
  type SwapCategory,
  type SwapCondition,
  type NewSwapItem,
} from "@/features/contracts";
import { SmartImage } from "@/components/greencity/SmartImage";
import { SubmitButton } from "@/components/greencity/SubmitButton";
import {
  ChoiceChip,
  FieldError,
  PageContainer,
  PageIntro,
  StepHeading,
  buttonClass,
  inputClass,
} from "@/components/greencity/ui";
import { cn } from "@/lib/utils";

const CATEGORIES: SwapCategory[] = ["quan-ao", "sach", "gia-dung", "do-tre-em", "khac"];
const CONDITIONS: SwapCondition[] = ["nhu-moi", "tot", "da-dung"];

export function SwapPostView() {
  const router = useRouter();
  const { addItem } = useSwap();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

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

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const dataUrl = await compressImage(file);
      setImage(dataUrl);
      clearError("image");
    } catch {
      toast("error", "Không đọc được ảnh", "Vui lòng chọn ảnh khác.");
    }
  };

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
        <PageIntro title="Đăng đồ trao đổi">
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
                    onClick={() => setImage("")}
                    className={cn(
                      buttonClass.secondary,
                      "absolute right-3 top-3 min-h-10 px-3 text-[14px]"
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
                  aria-describedby={errors.image ? "swap-image-err" : undefined}
                  className={cn(
                    "flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-muted/40 text-center transition-colors hover:border-primary/60 hover:bg-accent",
                    errors.image ? "border-destructive" : "border-border"
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
              <FieldError id="swap-image-err" msg={errors.image} />

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
                          setImage(img.url);
                          clearError("image");
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

          {/* Bước 2: Món đồ */}
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
                  setTitle(e.target.value);
                  clearError("title");
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
                      setCategory(c);
                      clearError("category");
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
                      setCondition(c);
                      clearError("condition");
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
                  setDescription(e.target.value);
                  clearError("description");
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
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
            Tin trao đổi xem trước
          </p>
          <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            {image ? (
              <SmartImage src={image} alt="" className="aspect-[4/3] w-full" sizes="320px" />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center bg-muted text-[13px] text-muted-foreground">
                Chưa có ảnh
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center gap-2">
                {condition && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                    {SWAP_CONDITION_LABEL[condition]}
                  </span>
                )}
                {category && (
                  <span className="text-[12px] text-muted-foreground">
                    {SWAP_CATEGORY_LABEL[category]}
                  </span>
                )}
              </div>

              <p className={cn("mt-2 line-clamp-2 text-[15px] font-bold", title.trim() ? "text-foreground" : "text-muted-foreground")}>
                {title.trim() || "Tiêu đề món đồ"}
              </p>

              <div className="mt-2 text-[13px]">
                {giveaway ? (
                  <span className="font-bold text-primary">Tặng miễn phí</span>
                ) : (
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">Đổi:</strong> {wants.trim() || "Chưa nhập"}
                  </span>
                )}
              </div>

              <p className="mt-3 flex items-center gap-1 border-t border-border pt-2.5 text-[12px] text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                {area || "Chọn quận"}
              </p>
            </div>
          </div>

          <SubmitButton
            status={status}
            loadingText="Đang đăng tin..."
            successText="Đã đăng thành công!"
            className="mt-4"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            Đăng đồ trao đổi
          </SubmitButton>
        </aside>
      </form>
    </PageContainer>
  );
}
