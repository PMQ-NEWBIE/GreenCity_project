"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, MapPin, Send, Trash2 } from "lucide-react";
import { useApp } from "@/store/app-store";
import { SAMPLE_IMAGES } from "@/data/mock-data";
import { MARKET_AUDIENCE, MARKET_LABEL, categoriesOf, marketOf } from "@/lib/market";
import { SmartImage } from "@/components/greencity/SmartImage";
import { SubmitButton } from "@/components/greencity/SubmitButton";
import { ChoiceChip, FieldError, PageContainer, PageIntro, StepHeading, buttonClass, inputClass } from "@/components/greencity/ui";
import { ROUTES } from "@/lib/routes";
import { AREAS, type CategoryId, type Product, type Unit } from "@/types";
import { formatPrice } from "@/utils/format";
import { compressImage } from "@/lib/image";
import { cn } from "@/lib/utils";

const UNITS: Unit[] = ["kg", "món", "lô", "chai"];

export function SellView() {
  const { addProduct, toast, state } = useApp();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<CategoryId | "">("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState<Unit | "">("");
  const [area, setArea] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [visibility, setVisibility] = useState<"public" | "draft">("public");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const clearError = (key: string) => setErrors((er) => (er[key] ? { ...er, [key]: "" } : er));

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    try {
      setImage(await compressImage(file));
      clearError("image");
    } catch {
      toast("error", "Không đọc được ảnh", "Vui lòng thử một ảnh khác.");
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!image) errs.image = "Thêm một tấm ảnh để người mua dễ hình dung";
    if (name.trim().length < 4) errs.name = "Tên món cần ít nhất 4 ký tự";
    if (!category) errs.category = "Chọn loại vật liệu";
    if (description.trim().length < 20) errs.description = "Mô tả thêm một chút (ít nhất 20 ký tự)";
    const priceNum = Number(price);
    if (!price.trim() || Number.isNaN(priceNum)) errs.price = "Nhập giá bằng số";
    else if (priceNum <= 0) errs.price = "Giá cần lớn hơn 0";
    if (!unit) errs.unit = "Chọn đơn vị tính";
    if (!area) errs.area = "Chọn khu vực";
    setErrors(errs);
    const firstError = Object.keys(errs)[0];
    if (firstError) document.getElementById(`sell-${firstError}`)?.focus();
    return !firstError;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "idle") return;
    if (!validate()) {
      toast("error", "Còn vài chỗ cần điền", "Xem các dòng chữ đỏ trong form.");
      return;
    }
    setStatus("loading");
    window.setTimeout(() => {
      const product: Product = {
        id: `p-${Date.now()}`,
        name: name.trim(),
        categoryId: category as CategoryId,
        price: Number(price),
        unit: unit as Unit,
        area,
        description: description.trim(),
        image,
        postedHoursAgo: 0,
        status: visibility === "draft" ? "draft" : "available",
        seller: {
          name: state.user?.name ?? "Bạn",
          type: "individual",
          rating: 5.0,
          deals: 0,
          joined: state.user?.memberSince ?? "Hôm nay",
          initials: (state.user?.name ?? "B").trim()[0].toUpperCase(),
        },
        isMine: true,
      };
      addProduct(product);
      setStatus("success");
      toast(
        "success",
        visibility === "draft" ? "Đã lưu nháp" : "Đã đăng tin",
        visibility === "draft" ? "Tin chỉ hiện trong Tin đăng của tôi." : "Tin của bạn đã lên sàn."
      );
      router.push(ROUTES.product(product.id));
    }, 500);
  };

  const fillDemo = () => {
    setName("Chai nhựa PET đã rửa sạch");
    setCategory("plastic");
    setPrice("5000");
    setUnit("kg");
    setArea("Bình Thạnh");
    setDescription(
      "Chai nước ngọt PET trong, đã bỏ nắp và nhãn, rửa sạch để khô, ép gọn trong túi. Khoảng 10kg, ưu tiên người lấy cả lô."
    );
    setImage(SAMPLE_IMAGES[1].url);
    setErrors({});
  };

  const selectCls = (err?: string) => cn(inputClass(err), "select-chevron cursor-pointer appearance-none");

  return (
    <PageContainer className="max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <PageIntro title="Đăng tin bán">
          Điền 4 bước dưới đây, mất khoảng một phút. Tin càng rõ ràng, người mua càng dễ trả giá.
        </PageIntro>
        <button type="button" onClick={fillDemo} className={buttonClass.ghost}>
          Điền thử dữ liệu mẫu
        </button>
      </div>

      <form onSubmit={submit} noValidate className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-8">
          {/* Bước 1: Ảnh */}
          <section aria-labelledby="step-1" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <StepHeading id="step-1" step={1} title="Chụp hoặc chọn ảnh" hint="Ảnh thật, đủ sáng giúp bán nhanh hơn." />
            <div className="mt-4">
              {image ? (
                <div className="relative overflow-hidden rounded-2xl border border-border">
                  <SmartImage src={image} alt="Ảnh món đồ bạn đã chọn" className="aspect-[4/3] w-full" sizes="(max-width: 1024px) 100vw, 600px" />
                  <button
                    type="button"
                    onClick={() => setImage("")}
                    className={cn(buttonClass.secondary, "absolute right-3 top-3 min-h-10 px-3 text-[14px]")}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Đổi ảnh
                  </button>
                </div>
              ) : (
                <button
                  id="sell-image"
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  aria-describedby={errors.image ? "sell-image-err" : undefined}
                  className={cn(
                    "flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-muted/40 text-center transition-colors hover:border-primary/60 hover:bg-accent",
                    errors.image ? "border-destructive" : "border-border"
                  )}
                >
                  <Camera className="h-9 w-9 text-primary" strokeWidth={1.6} aria-hidden="true" />
                  <span className="text-[15px] font-semibold text-foreground">Chụp ảnh hoặc chọn từ máy</span>
                  <span className="text-[13px] text-muted-foreground">JPG, PNG — ảnh tự thu nhỏ trước khi lưu</span>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onPickFile} className="hidden" />
              <FieldError id="sell-image-err" msg={errors.image} />
              {!image && (
                <>
                  <p className="mt-4 text-[13px] font-semibold text-muted-foreground">Chưa có ảnh? Dùng tạm ảnh mẫu:</p>
                  <div className="mt-2 grid grid-cols-5 gap-2">
                    {SAMPLE_IMAGES.map((img) => (
                      <button
                        key={img.url}
                        type="button"
                        onClick={() => {
                          setImage(img.url);
                          clearError("image");
                        }}
                        aria-label={`Dùng ảnh mẫu: ${img.label}`}
                        className="overflow-hidden rounded-lg border border-border hover:border-primary"
                      >
                        <SmartImage src={img.url} alt="" className="aspect-square w-full" sizes="80px" />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Bước 2: Món đồ */}
          <section aria-labelledby="step-2" className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
            <StepHeading id="step-2" step={2} title="Món đồ là gì?" />
            <div>
              <label htmlFor="sell-name" className="mb-1.5 block text-[14px] font-semibold text-foreground">
                Tên món
              </label>
              <input
                id="sell-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearError("name");
                }}
                placeholder="VD: Giấy carton sạch, đã ép kiện"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "sell-name-err" : undefined}
                className={inputClass(errors.name)}
              />
              <FieldError id="sell-name-err" msg={errors.name} />
            </div>
            <div>
              <label htmlFor="sell-category" className="mb-1.5 block text-[14px] font-semibold text-foreground">
                Loại hàng
              </label>
              <select
                id="sell-category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as CategoryId);
                  clearError("category");
                }}
                aria-invalid={!!errors.category}
                aria-describedby={errors.category ? "sell-category-err" : undefined}
                className={selectCls(errors.category)}
              >
                <option value="">Chọn loại…</option>
                {/* Hai nhóm: phế liệu đi tới người thu mua, đồ thanh lý đi tới người dân */}
                {(["scrap", "secondhand"] as const).map((m) => (
                  <optgroup key={m} label={MARKET_LABEL[m]}>
                    {categoriesOf(m).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.priceHint})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <FieldError id="sell-category-err" msg={errors.category} />
              {category && (
                <p className="mt-2 rounded-lg bg-accent px-3 py-2 text-[13.5px] text-accent-foreground" aria-live="polite">
                  <strong>{MARKET_LABEL[marketOf(category)]}.</strong> {MARKET_AUDIENCE[marketOf(category)]}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="sell-description" className="mb-1.5 block text-[14px] font-semibold text-foreground">
                Mô tả
              </label>
              <textarea
                id="sell-description"
                rows={4}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  clearError("description");
                }}
                placeholder="Tình trạng, đã phân loại chưa, khoảng bao nhiêu kg, giờ nào tới lấy được…"
                aria-invalid={!!errors.description}
                aria-describedby="sell-description-hint"
                className={cn(inputClass(errors.description), "h-auto resize-none py-3")}
              />
              <div className="mt-1.5 flex items-start justify-between gap-3">
                <FieldError msg={errors.description} />
                <span id="sell-description-hint" className="ml-auto shrink-0 text-[13px] text-muted-foreground">
                  {description.trim().length}/20 ký tự tối thiểu
                </span>
              </div>
            </div>
          </section>

          {/* Bước 3: Giá & khu vực */}
          <section aria-labelledby="step-3" className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
            <StepHeading id="step-3" step={3} title="Giá và nơi lấy hàng" hint="Chưa chắc giá? Xem giá gợi ý ở ô Loại hàng." />
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="sell-price" className="mb-1.5 block text-[14px] font-semibold text-foreground">
                  Giá mong muốn (đồng)
                </label>
                <input
                  id="sell-price"
                  inputMode="numeric"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value.replace(/[^0-9]/g, ""));
                    clearError("price");
                  }}
                  placeholder="VD: 4000"
                  aria-invalid={!!errors.price}
                  aria-describedby={errors.price ? "sell-price-err" : undefined}
                  className={inputClass(errors.price)}
                />
                <FieldError id="sell-price-err" msg={errors.price} />
              </div>
              <div>
                <label htmlFor="sell-area" className="mb-1.5 block text-[14px] font-semibold text-foreground">
                  Khu vực
                </label>
                <select
                  id="sell-area"
                  value={area}
                  onChange={(e) => {
                    setArea(e.target.value);
                    clearError("area");
                  }}
                  aria-invalid={!!errors.area}
                  aria-describedby={errors.area ? "sell-area-err" : undefined}
                  className={selectCls(errors.area)}
                >
                  <option value="">Chọn quận…</option>
                  {AREAS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
                <FieldError id="sell-area-err" msg={errors.area} />
              </div>
            </div>
            <fieldset>
              <legend className="mb-1.5 text-[14px] font-semibold text-foreground">Tính giá theo</legend>
              <div id="sell-unit" tabIndex={-1} className="flex flex-wrap gap-2 outline-none">
                {UNITS.map((u) => (
                  <ChoiceChip
                    key={u}
                    selected={unit === u}
                    onClick={() => {
                      setUnit(u);
                      clearError("unit");
                    }}
                  >
                    {u}
                  </ChoiceChip>
                ))}
              </div>
              <FieldError msg={errors.unit} />
            </fieldset>
          </section>

          {/* Bước 4: Hiển thị */}
          <section aria-labelledby="step-4" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <StepHeading id="step-4" step={4} title="Ai được xem tin này?" />
            <div className="mt-4 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-labelledby="step-4">
              {(
                [
                  { key: "public", label: "Mọi người", desc: "Tin hiện ngay trên trang Khám phá" },
                  { key: "draft", label: "Chỉ mình tôi (nháp)", desc: "Lưu lại, đăng sau trong Hồ sơ" },
                ] as const
              ).map((v) => (
                <label
                  key={v.key}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                    visibility === v.key ? "border-primary bg-accent" : "border-border hover:border-primary/40"
                  )}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value={v.key}
                    checked={visibility === v.key}
                    onChange={() => setVisibility(v.key)}
                    className="mt-0.5 h-5 w-5 accent-primary"
                  />
                  <span>
                    <span className="block text-[15px] font-bold text-foreground">{v.label}</span>
                    <span className="block text-[13px] text-muted-foreground">{v.desc}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Xem trước + nút đăng */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">Tin của bạn sẽ trông như này</p>
          <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card">
            {image ? (
              <SmartImage src={image} alt="" className="aspect-[4/3] w-full" sizes="320px" />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center bg-muted text-[13px] text-muted-foreground">Chưa có ảnh</div>
            )}
            <div className="p-4">
              <p className={cn("line-clamp-2 text-[15px] font-semibold", name.trim() ? "text-foreground" : "text-muted-foreground")}>
                {name.trim() || "Tên món"}
              </p>
              <p className="mt-1 text-[17px] font-bold text-primary">
                {price ? formatPrice(Number(price), unit || undefined) : "Giá"}
              </p>
              <p className="mt-1 flex items-center gap-1 text-[13px] text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {area || "Khu vực"}
              </p>
            </div>
          </div>
          <SubmitButton status={status} loadingText="Đang đăng…" successText="Xong!" className="mt-4">
            <Send className="h-[18px] w-[18px]" aria-hidden="true" />
            {visibility === "draft" ? "Lưu nháp" : "Đăng tin"}
          </SubmitButton>
        </aside>
      </form>
    </PageContainer>
  );
}
