"use client";

import { useState } from "react";
import { Pencil, Phone, Plus } from "lucide-react";
import { usePartners, useToast } from "@/store/hooks";
import { GcModal } from "@/components/greencity/GcModal";
import { ChoiceChip, FieldError, buttonClass, inputClass } from "@/components/greencity/ui";
import { newId } from "@/store/app-store";
import { AREAS, type Area } from "@/types";
import type { Partner, PartnerKind } from "@/types/features";
import { cn } from "@/lib/utils";

const KIND_LABEL: Record<PartnerKind, string> = {
  "thu-gom": "Vựa / người thu mua",
  "che-bien-phan": "Cơ sở chế biến phân bón",
};

/** IV.4 — đối tác thu gom và cơ sở chế biến phân bón hữu cơ. */
export function PartnersTab() {
  const { partners, upsert } = usePartners();
  const toast = useToast();
  const [editing, setEditing] = useState<Partner | "new" | null>(null);

  return (
    <div>
      <div className="flex justify-end">
        <button type="button" onClick={() => setEditing("new")} className={buttonClass.primary}>
          <Plus className="h-[18px] w-[18px]" aria-hidden="true" />
          Thêm đối tác
        </button>
      </div>
      {(Object.keys(KIND_LABEL) as PartnerKind[]).map((kind) => (
        <section key={kind} aria-labelledby={`pn-${kind}`} className="mt-6">
          <h3 id={`pn-${kind}`} className="mb-3 text-[18px] font-bold text-foreground">
            {KIND_LABEL[kind]}
          </h3>
          <ul className="grid gap-3 lg:grid-cols-2">
            {partners
              .filter((p) => p.kind === kind)
              .map((p) => (
                <li key={p.id} className={cn("rounded-2xl border border-border bg-card p-4", !p.active && "opacity-70")}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[15px] font-bold text-foreground">{p.name}</p>
                      <p className="text-[13px] text-muted-foreground">
                        {p.contactName} · <Phone className="inline h-3 w-3" aria-hidden="true" /> <span className="font-mono">{p.phoneMasked}</span>
                      </p>
                    </div>
                    <span className={cn("rounded-full px-2.5 py-1 text-[12px] font-bold", p.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                      {p.active ? "Đang hoạt động" : "Tạm ngưng"}
                    </span>
                  </div>
                  <p className="mt-2 text-[13px] text-foreground/85">Phụ trách: {p.areas.join(", ")}</p>
                  {p.note && <p className="mt-1 text-[13px] text-muted-foreground">{p.note}</p>}
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => setEditing(p)} className={cn(buttonClass.secondary, "min-h-11")}>
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        upsert({ ...p, active: !p.active });
                        toast("success", p.active ? `Đã tạm ngưng ${p.name}` : `${p.name} hoạt động trở lại`);
                      }}
                      className={cn(buttonClass.ghost, "min-h-11")}
                    >
                      {p.active ? "Tạm ngưng" : "Cho hoạt động lại"}
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        </section>
      ))}

      <GcModal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "Thêm đối tác" : "Sửa đối tác"}>
        {editing !== null && (
          <PartnerForm
            key={editing === "new" ? "new" : editing.id}
            partner={editing === "new" ? null : editing}
            onSave={(p) => {
              upsert(p);
              toast("success", `Đã lưu ${p.name}`);
              setEditing(null);
            }}
          />
        )}
      </GcModal>
    </div>
  );
}

function PartnerForm({ partner, onSave }: { partner: Partner | null; onSave: (p: Partner) => void }) {
  const [kind, setKind] = useState<PartnerKind>(partner?.kind ?? "thu-gom");
  const [name, setName] = useState(partner?.name ?? "");
  const [contactName, setContactName] = useState(partner?.contactName ?? "");
  const [phone, setPhone] = useState(partner?.phoneMasked ?? "09xx xxx ");
  const [areas, setAreas] = useState<Area[]>(partner?.areas ?? []);
  const [note, setNote] = useState(partner?.note ?? "");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 3) return setError("Ghi tên đối tác");
    if (contactName.trim().length < 2) return setError("Ghi tên người liên hệ");
    if (areas.length === 0) return setError("Chọn ít nhất một quận phụ trách");
    onSave({
      id: partner?.id ?? newId("dt"),
      kind,
      name: name.trim(),
      contactName: contactName.trim(),
      phoneMasked: phone.trim(),
      areas,
      note: note.trim(),
      active: partner?.active ?? true,
    });
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Loại đối tác">
        {(Object.keys(KIND_LABEL) as PartnerKind[]).map((k) => (
          <ChoiceChip key={k} selected={kind === k} onClick={() => setKind(k)}>
            {KIND_LABEL[k]}
          </ChoiceChip>
        ))}
      </div>
      <div>
        <label htmlFor="pf-pname" className="mb-1.5 block text-[14px] font-semibold text-foreground">
          Tên đối tác
        </label>
        <input id="pf-pname" value={name} onChange={(e) => setName(e.target.value)} className={inputClass()} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pf-contact" className="mb-1.5 block text-[14px] font-semibold text-foreground">
            Người liên hệ
          </label>
          <input id="pf-contact" value={contactName} onChange={(e) => setContactName(e.target.value)} className={inputClass()} />
        </div>
        <div>
          <label htmlFor="pf-phone" className="mb-1.5 block text-[14px] font-semibold text-foreground">
            Điện thoại (bản demo che số)
          </label>
          <input id="pf-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={cn(inputClass(), "font-mono")} />
        </div>
      </div>
      <fieldset>
        <legend className="mb-1.5 text-[14px] font-semibold text-foreground">Quận phụ trách</legend>
        <div className="flex flex-wrap gap-2">
          {AREAS.map((a) => (
            <ChoiceChip key={a} selected={areas.includes(a)} onClick={() => setAreas((x) => (x.includes(a) ? x.filter((y) => y !== a) : [...x, a]))}>
              {a}
            </ChoiceChip>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="pf-note" className="mb-1.5 block text-[14px] font-semibold text-foreground">
          Ghi chú
        </label>
        <input id="pf-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Xe, giờ chạy, loại đồ nhận…" className={inputClass()} />
      </div>
      <FieldError msg={error} />
      <button type="submit" className={buttonClass.primary}>
        Lưu đối tác
      </button>
    </form>
  );
}
