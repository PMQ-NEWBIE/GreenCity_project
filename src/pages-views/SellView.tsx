"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Camera,
  Check,
  ImagePlus,
  Info,
  Package,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useApp } from "@/store/app-store";
import { CATEGORIES, SAMPLE_IMAGES } from "@/data/mock-data";
import { SmartImage } from "@/components/greencity/SmartImage";
import { SubmitButton } from "@/components/greencity/SubmitButton";
import { Reveal } from "@/components/greencity/Reveal";
import { AREAS, type CategoryId, type Product, type Unit } from "@/types";
import { formatPrice } from "@/utils/format";
import { cn } from "@/lib/utils";

const UNITS: { key: Unit; label: string }[] = [
  { key: "kg", label: "kg" },
  { key: "món", label: "món" },
  { key: "lô", label: "lô" },
  { key: "chai", label: "chai" },
];

const inputCls = (err?: string) =>
  cn(
    "h-12 w-full rounded-xl border-[1.5px] bg-white px-4 text-[14px] font-medium outline-none transition-all duration-200 placeholder:text-muted-foreground/60",
    err
      ? "border-destructive focus:shadow-[0_0_0_3px_rgba(220,38,38,0.12)]"
      : "border-[#dce7dc] hover:border-[#a8c9ae] focus:border-primary focus:shadow-[0_0_0_3px_rgba(36,139,82,0.14)]"
  );

export function SellView() {
  const { addProduct, goApp, toast, state } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<CategoryId | "">("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState<Unit | "">("");
  const [area, setArea] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string>("");
  const [visibility, setVisibility] = useState<"public" | "draft">("public");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setImage(url);
      setErrors((er) => ({ ...er, image: "" }));
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (name.trim().length < 4) errs.name = "Tên sản phẩm cần tối thiểu 4 ký tự";
    if (!category) errs.category = "Vui lòng chọn danh mục";
    const priceNum = Number(price);
    if (!price.trim() || Number.isNaN(priceNum)) errs.price = "Vui lòng nhập giá bằng số";
    else if (priceNum <= 0) errs.price = "Giá cần lớn hơn 0";
    if (!unit) errs.unit = "Vui lòng chọn đơn vị tính";
    if (!area) errs.area = "Vui lòng chọn khu vực";
    if (description.trim().length < 20) errs.description = "Mô tả cần tối thiểu 20 ký tự để người mua hiểu rõ món đồ";
    if (!image) errs.image = "Vui lòng chọn một ảnh minh họa";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (status !== "idle") return;
    if (!validate()) {
      toast("error", "Chưa gửi được tin", "Vui lòng kiểm tra các trường bị đánh dấu đỏ.");
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
        status: visibility === "draft" ? "sold" : "available",
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
      toast("success", "Đăng tin thành công (demo)!", "Tin của bạn đã xuất hiện trên sàn Green City.");
      window.setTimeout(() => {
        goApp("product", product.id);
      }, 1400);
    }, 1100);
  };

  const fillDemo = () => {
    setName("Chai nhựa PET đã rửa sạch");
    setCategory("plastic");
    setPrice("5000");
    setUnit("kg");
    setArea("Bình Thạnh");
    setDescription(
      "Chai nước ngọt PET trong, đã bỏ nắp và nhãn, rửa sạch để khô, ép gọn trong túi. Khối lượng khoảng 10kg, ưu tiên người mua lấy cả lô. Có thể chụp thêm hình nếu cần kiểm tra."
    );
    setImage(SAMPLE_IMAGES[1].url);
    setErrors({});
    toast("info", "Đã điền dữ liệu mẫu", "Điều chỉnh tùy ý trước khi đăng.");
  };

  return (
    <div className="nice-scroll h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Reveal>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-[24px] font-extrabold tracking-tight text-forest">
                Đăng tin bán ve chai
              </h2>
              <p className="mt-1.5 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
                Mô tả rõ vật liệu, khối lượng và khu vực để người thu mua chấm giá nhanh hơn. Tin
                đăng trong bản demo chỉ lưu phía trình duyệt.
              </p>
            </div>
            <button
              type="button"
              onClick={fillDemo}
              className="flex items-center gap-2 rounded-2xl border-[1.5px] border-primary/30 bg-accent/50 px-4 py-2.5 text-[13px] font-semibold text-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent"
            >
              <Sparkles className="h-4 w-4" />
              Điền dữ liệu mẫu
            </button>
          </div>
        </Reveal>

        <form onSubmit={submit} noValidate className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Cột trái: các trường */}
          <Reveal delay={0.06}>
            <div className="flex flex-col gap-5 rounded-3xl border border-border/70 bg-white p-6">
              <div>
                <label htmlFor="sell-name" className="mb-2 block text-[13px] font-bold text-forest">
                  Tên sản phẩm <span className="text-destructive">*</span>
                </label>
                <input
                  id="sell-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((er) => ({ ...er, name: "" }));
                  }}
                  placeholder="VD: Giấy carton sạch đã ép kiện"
                  className={inputCls(errors.name)}
                />
                {errors.name && <FieldError msg={errors.name} />}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="sell-category" className="mb-2 block text-[13px] font-bold text-forest">
                    Danh mục <span className="text-destructive">*</span>
                  </label>
                  <select
                    id="sell-category"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value as CategoryId);
                      if (errors.category) setErrors((er) => ({ ...er, category: "" }));
                    }}
                    className={cn(inputCls(errors.category), "cursor-pointer")}
                  >
                    <option value="">Chọn danh mục</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && <FieldError msg={errors.category} />}
                </div>
                <div>
                  <label htmlFor="sell-area" className="mb-2 block text-[13px] font-bold text-forest">
                    Khu vực <span className="text-destructive">*</span>
                  </label>
                  <select
                    id="sell-area"
                    value={area}
                    onChange={(e) => {
                      setArea(e.target.value);
                      if (errors.area) setErrors((er) => ({ ...er, area: "" }));
                    }}
                    className={cn(inputCls(errors.area), "cursor-pointer")}
                  >
                    <option value="">Chọn quận / khu vực</option>
                    {AREAS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                  {errors.area && <FieldError msg={errors.area} />}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                <div>
                  <label htmlFor="sell-price" className="mb-2 block text-[13px] font-bold text-forest">
                    Giá dự kiến <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="sell-price"
                    inputMode="numeric"
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value.replace(/[^0-9]/g, ""));
                      if (errors.price) setErrors((er) => ({ ...er, price: "" }));
                    }}
                    placeholder="VD: 4000"
                    className={inputCls(errors.price)}
                  />
                  {errors.price ? (
                    <FieldError msg={errors.price} />
                  ) : (
                    price && (
                      <p className="mt-1.5 pl-1 text-[12px] text-muted-foreground">
                        Hiển thị: <span className="font-bold text-primary">{formatPrice(Number(price))}</span>
                      </p>
                    )
                  )}
                </div>
                <div>
                  <p className="mb-2 text-[13px] font-bold text-forest">
                    Đơn vị <span className="text-destructive">*</span>
                  </p>
                  <div className="flex h-12 items-center gap-1.5">
                    {UNITS.map((u) => (
                      <button
                        key={u.key}
                        type="button"
                        onClick={() => {
                          setUnit(u.key);
                          if (errors.unit) setErrors((er) => ({ ...er, unit: "" }));
                        }}
                        className={cn(
                          "h-12 rounded-xl px-3.5 text-[13px] font-bold transition-all duration-200",
                          unit === u.key
                            ? "bg-primary text-white shadow-sm shadow-primary/30"
                            : "bg-[#f2f6f2] text-foreground/60 hover:bg-accent hover:text-primary"
                        )}
                      >
                        {u.label}
                      </button>
                    ))}
                  </div>
                  {errors.unit && <FieldError msg={errors.unit} />}
                </div>
              </div>

              <div>
                <label htmlFor="sell-desc" className="mb-2 block text-[13px] font-bold text-forest">
                  Mô tả chi tiết <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="sell-desc"
                  rows={5}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) setErrors((er) => ({ ...er, description: "" }));
                  }}
                  placeholder="Tình trạng vật liệu, đã phân loại hay chưa, khối lượng ước tính, điều kiện giao nhận..."
                  className={cn(
                    "w-full resize-none rounded-xl border-[1.5px] border-[#dce7dc] bg-white px-4 py-3.5 text-[14px] font-medium outline-none transition-all duration-200 placeholder:text-muted-foreground/60 hover:border-[#a8c9ae] focus:border-primary focus:shadow-[0_0_0_3px_rgba(36,139,82,0.14)]",
                    errors.description && "border-destructive"
                  )}
                />
                <div className="mt-1.5 flex items-center justify-between">
                  {errors.description ? (
                    <FieldError msg={errors.description} />
                  ) : (
                    <span />
                  )}
                  <span
                    className={cn(
                      "text-[12px]",
                      description.trim().length < 20 ? "text-muted-foreground/60" : "text-primary"
                    )}
                  >
                    {description.trim().length}/20 ký tự tối thiểu
                  </span>
                </div>
              </div>

              <div>
                <p className="mb-2 text-[13px] font-bold text-forest">
                  Chế độ hiển thị
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      { key: "public", label: "Đăng công khai", desc: "Tin xuất hiện trên sàn Khám phá" },
                      { key: "draft", label: "Lưu nháp (ẩn)", desc: "Chỉ bạn nhìn thấy trong Hồ sơ" },
                    ] as const
                  ).map((v) => (
                    <button
                      key={v.key}
                      type="button"
                      onClick={() => setVisibility(v.key)}
                      className={cn(
                        "flex items-start gap-3 rounded-2xl border-[1.5px] p-4 text-left transition-all duration-200",
                        visibility === v.key
                          ? "border-primary bg-accent/50"
                          : "border-[#dce7dc] bg-white hover:border-primary/40"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors",
                          visibility === v.key ? "border-primary bg-primary text-white" : "border-[#c4d4c6]"
                        )}
                      >
                        {visibility === v.key && <Check className="h-3 w-3" strokeWidth={3.5} />}
                      </span>
                      <span>
                        <span className="block text-[14px] font-bold text-forest">{v.label}</span>
                        <span className="mt-0.5 block text-[12.5px] text-muted-foreground">{v.desc}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Cột phải: ảnh + xem trước */}
          <Reveal delay={0.12}>
            <div className="flex flex-col gap-5 lg:sticky lg:top-24">
              <div className="rounded-3xl border border-border/70 bg-white p-5">
                <p className="flex items-center gap-2 text-[14px] font-bold text-forest">
                  <ImagePlus className="h-4.5 w-4.5 text-primary" />
                  Ảnh minh họa <span className="text-destructive">*</span>
                </p>
                <div className="relative mt-3.5 overflow-hidden rounded-2xl border border-border/60">
                  {image ? (
                    <>
                      <SmartImage src={image} alt="Ảnh sản phẩm đã chọn" className="aspect-[4/3] w-full" priority />
                      <button
                        type="button"
                        onClick={() => setImage("")}
                        className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-destructive shadow-sm backdrop-blur-sm transition-transform duration-200 hover:scale-105"
                        aria-label="Xóa ảnh"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2.5 rounded-2xl border-[1.5px] border-dashed border-[#c4d4c6] bg-[#f8fbf7] transition-colors duration-200 hover:border-primary/60 hover:bg-accent/40"
                    >
                      <Camera className="h-8 w-8 text-primary/60" strokeWidth={1.6} />
                      <span className="text-[13px] font-semibold text-foreground/60">
                        Tải ảnh từ thiết bị
                      </span>
                      <span className="text-[11.5px] text-muted-foreground/70">
                        hoặc chọn ảnh mẫu bên dưới
                      </span>
                    </button>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={onPickFile}
                  className="hidden"
                  aria-label="Chọn ảnh từ thiết bị"
                />
                {errors.image && <FieldError msg={errors.image} />}
                <p className="mt-3 text-[12px] font-bold text-forest">Ảnh mẫu nhanh</p>
                <div className="mt-2 grid grid-cols-5 gap-2">
                  {SAMPLE_IMAGES.map((img) => (
                    <button
                      key={img.url}
                      type="button"
                      onClick={() => {
                        setImage(img.url);
                        setErrors((er) => ({ ...er, image: "" }));
                      }}
                      title={img.label}
                      className={cn(
                        "overflow-hidden rounded-xl border-2 transition-all duration-200 hover:-translate-y-0.5",
                        image === img.url ? "border-primary shadow-md shadow-primary/20" : "border-transparent opacity-80 hover:opacity-100"
                      )}
                    >
                      <SmartImage src={img.url} alt={img.label} className="aspect-square w-full" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-primary/25 bg-accent/40 p-5">
                <p className="flex items-center gap-2 text-[13px] font-bold text-primary">
                  <Info className="h-4 w-4" />
                  Xem trước giá hiển thị
                </p>
                <p className="mt-2.5 text-[20px] font-extrabold text-forest">
                  {price ? formatPrice(Number(price), unit || undefined) : "—"}
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                  {name.trim() ? name.trim() : "Tên sản phẩm sẽ hiển thị ở đây"} • {area || "Khu vực"}
                </p>
              </div>

              <SubmitButton
                status={status}
                loadingText="Đang đăng tin..."
                successText="Tin đã được đăng!"
              >
                <span className="flex items-center gap-2">
                  <Send className="h-[18px] w-[18px]" />
                  {visibility === "draft" ? "Lưu nháp tin đăng" : "Đăng tin lên sàn"}
                </span>
              </SubmitButton>

              <p className="flex items-start gap-2 text-[12px] leading-relaxed text-muted-foreground/70">
                <Package className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Tin đăng demo được lưu trong trình duyệt và tự thêm vào trang Khám phá của phiên
                này.
              </p>
            </div>
          </Reveal>
        </form>
      </div>
    </div>
  );
}

function FieldError({ msg }: { msg: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: -3 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="mt-1.5 flex items-center gap-1.5 pl-1 text-[12.5px] font-medium text-destructive"
    >
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {msg}
    </motion.p>
  );
}
