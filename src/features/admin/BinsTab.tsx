"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Search } from "lucide-react";
import { useToast } from "@/store/hooks";
import { useBins } from "@/store/use-bins";
import { GcModal } from "@/components/greencity/GcModal";
import { FieldError, buttonClass, inputClass } from "@/components/greencity/ui";
import { BIN_LEVEL_LABEL, BIN_TYPE_LABEL } from "@/data/bins";
import { AREA_CENTER } from "@/data/geo";
import { AREAS, type Area } from "@/types";
import type { Bin, BinLevel, BinType } from "@/types/features";
import { formatRelativeTime } from "@/utils/format";
import { cn } from "@/lib/utils";
import { BIN_TYPE_BADGE, badgeBase } from "@/features/bins/styles";

const selectCls = cn(inputClass(), "select-chevron cursor-pointer appearance-none");

/** IV.2 — vị trí và tình trạng thùng: đổi mức đầy, thêm hoặc sửa thùng. */
export function BinsTab() {
  const { bins, upsertBin } = useBins();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Bin | "new" | null>(null);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return bins.filter((b) => !s || [b.code, b.name, b.area, b.address, b.collaborator].some((x) => x.toLowerCase().includes(s)));
  }, [bins, q]);

  const setLevel = (b: Bin, level: BinLevel) => {
    upsertBin({ ...b, level, lastEmptiedAt: level === "binh-thuong" && b.level !== "binh-thuong" ? new Date().toISOString() : b.lastEmptiedAt });
    toast("success", `${b.code}: ${BIN_LEVEL_LABEL[level]}`);
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-80">
          <label htmlFor="bin-search" className="sr-only">
            Tìm thùng
          </label>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input id="bin-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Mã, chỗ đặt, quận, cộng tác viên…" className={cn(inputClass(), "pl-10")} />
        </div>
        <button type="button" onClick={() => setEditing("new")} className={buttonClass.primary}>
          <Plus className="h-[18px] w-[18px]" aria-hidden="true" />
          Thêm thùng
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
        {/* Điện thoại: mỗi thùng hiện thành thẻ xếp dọc (xem ghi chú cùng loại ở materials/LotManage.tsx) */}
        <table className="w-full text-[14px] max-md:block md:min-w-[760px]">
          <caption className="sr-only">Danh sách thùng thu gom</caption>
          <thead className="max-md:hidden">
            <tr className="border-b border-border text-left text-[12px] uppercase tracking-wide text-muted-foreground">
              <th scope="col" className="px-4 py-3 font-semibold">Thùng</th>
              <th scope="col" className="px-4 py-3 font-semibold">Chỗ đặt</th>
              <th scope="col" className="px-4 py-3 font-semibold">Cộng tác viên</th>
              <th scope="col" className="px-4 py-3 font-semibold">Tình trạng</th>
              <th scope="col" className="px-4 py-3 font-semibold"><span className="sr-only">Sửa</span></th>
            </tr>
          </thead>
          <tbody className="max-md:block">
            {list.map((b) => (
              <tr key={b.id} className="border-b border-border/60 last:border-0 max-md:relative max-md:block max-md:py-2">
                <td className="px-4 py-3 max-md:block max-md:pb-1">
                  <span className="font-mono font-bold text-foreground">{b.code}</span>
                  <span className={cn(badgeBase, BIN_TYPE_BADGE[b.type], "ml-2")}>{BIN_TYPE_LABEL[b.type]}</span>
                </td>
                <td className="px-4 py-3 text-foreground max-md:block max-md:py-1">
                  {b.name}
                  <span className="block text-[12px] text-muted-foreground">{b.area} · đổ {formatRelativeTime(b.lastEmptiedAt).toLowerCase()}</span>
                </td>
                <td className="px-4 py-3 text-foreground/85 max-md:block max-md:py-1">
                  <span className="md:sr-only">Cộng tác viên: </span>
                  {b.collaborator}
                </td>
                <td className="px-4 py-3 max-md:block max-md:py-1">
                  <label htmlFor={`lvl-${b.id}`} className="sr-only">
                    Tình trạng thùng {b.code}
                  </label>
                  <select id={`lvl-${b.id}`} value={b.level} onChange={(e) => setLevel(b, e.target.value as BinLevel)} className={cn(selectCls, "h-10 min-w-36")}>
                    {(Object.keys(BIN_LEVEL_LABEL) as BinLevel[]).map((l) => (
                      <option key={l} value={l}>
                        {BIN_LEVEL_LABEL[l]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-2 py-3 text-right max-md:absolute max-md:right-1 max-md:top-1">
                  <button type="button" onClick={() => setEditing(b)} aria-label={`Sửa thùng ${b.code}`} className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground">
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <GcModal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "Thêm thùng" : `Sửa thùng ${editing?.code ?? ""}`}>
        {editing !== null && (
          <BinForm
            key={editing === "new" ? "new" : editing.id}
            bin={editing === "new" ? null : editing}
            codes={bins.map((b) => b.code)}
            onSave={(b) => {
              upsertBin(b);
              toast("success", editing === "new" ? `Đã thêm thùng ${b.code}` : `Đã lưu thùng ${b.code}`);
              setEditing(null);
            }}
          />
        )}
      </GcModal>
    </div>
  );
}

function BinForm({ bin, codes, onSave }: { bin: Bin | null; codes: string[]; onSave: (b: Bin) => void }) {
  const [f, setF] = useState({
    code: bin?.code ?? "",
    type: bin?.type ?? ("tai-che" as BinType),
    name: bin?.name ?? "",
    area: bin?.area ?? ("" as Area | ""),
    address: bin?.address ?? "",
    collaborator: bin?.collaborator ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof typeof f, v: string) => {
    setF((x) => ({ ...x, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = f.code.trim().toUpperCase();
    const errs: Record<string, string> = {};
    if (!/^[A-Z]{2}-\d{3}$/.test(code)) errs.code = "Mã dạng 2 chữ cái và 3 số, ví dụ TC-025";
    else if (code !== bin?.code && codes.includes(code)) errs.code = "Mã này đã có thùng khác dùng";
    if (f.name.trim().length < 4) errs.name = "Ghi chỗ đặt thùng";
    if (!f.area) errs.area = "Chọn quận";
    if (f.address.trim().length < 5) errs.address = "Ghi đường và phường";
    if (f.collaborator.trim().length < 2) errs.collaborator = "Ghi tên cộng tác viên";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const area = f.area as Area;
    // Thùng mới: đặt quanh tâm quận (bản demo chưa có chọn điểm trên bản đồ)
    const pos = bin && bin.area === area ? { lat: bin.lat, lng: bin.lng } : {
      lat: Math.round((AREA_CENTER[area].lat + (Math.random() - 0.5) * 0.012) * 1e5) / 1e5,
      lng: Math.round((AREA_CENTER[area].lng + (Math.random() - 0.5) * 0.012) * 1e5) / 1e5,
    };
    onSave({
      id: bin?.id ?? code.toLowerCase(),
      code,
      type: f.type,
      name: f.name.trim(),
      area,
      address: f.address.trim(),
      collaborator: f.collaborator.trim(),
      level: bin?.level ?? "binh-thuong",
      lastEmptiedAt: bin?.lastEmptiedAt ?? new Date().toISOString(),
      ...pos,
    });
  };

  const field = (k: "code" | "name" | "address" | "collaborator", label: string, placeholder: string) => (
    <div>
      <label htmlFor={`bf-${k}`} className="mb-1.5 block text-[14px] font-semibold text-foreground">
        {label}
      </label>
      <input id={`bf-${k}`} value={f[k]} onChange={(e) => set(k, e.target.value)} placeholder={placeholder} aria-invalid={!!errors[k]} className={cn(inputClass(errors[k]), k === "code" && "font-mono uppercase")} />
      <FieldError msg={errors[k]} />
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {field("code", "Mã in trên thùng", "TC-025")}
        <div>
          <label htmlFor="bf-type" className="mb-1.5 block text-[14px] font-semibold text-foreground">
            Loại thùng
          </label>
          <select id="bf-type" value={f.type} onChange={(e) => set("type", e.target.value)} className={selectCls}>
            {(Object.keys(BIN_TYPE_LABEL) as BinType[]).map((t) => (
              <option key={t} value={t}>
                {BIN_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </div>
      </div>
      {field("name", "Chỗ đặt", "Sân chung cư, cạnh nhà xe")}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="bf-area" className="mb-1.5 block text-[14px] font-semibold text-foreground">
            Quận
          </label>
          <select id="bf-area" value={f.area} onChange={(e) => set("area", e.target.value)} aria-invalid={!!errors.area} className={cn(selectCls, errors.area && "border-destructive")}>
            <option value="">Chọn quận…</option>
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <FieldError msg={errors.area} />
        </div>
        {field("collaborator", "Cộng tác viên phụ trách", "Chị Mai")}
      </div>
      {field("address", "Đường, phường", "Đường Lê Văn Sỹ, Phường 13")}
      <button type="submit" className={cn(buttonClass.primary, "mt-1")}>
        Lưu thùng
      </button>
    </form>
  );
}
