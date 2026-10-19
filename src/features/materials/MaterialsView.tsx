"use client";

import { useMemo, useState } from "react";
import { Boxes, Clock } from "lucide-react";
import { useCurrentUser, useToast } from "@/store/hooks";
import { useMaterials } from "@/store/use-materials";
import { EmptyState } from "@/components/greencity/EmptyState";
import { PageContainer, PageIntro, buttonClass, inputClass } from "@/components/greencity/ui";
import { UrlTabs } from "@/features/_shared/UrlTabs";
import { LOT_GRADE_HINT, LOT_MATERIALS } from "@/data/lots";
import { timeLeft } from "@/lib/materials";
import { AREAS } from "@/types";
import type { LotGrade, MaterialLot } from "@/types/features";
import { formatDateTime } from "@/utils/format";
import { cn } from "@/lib/utils";
import { LotCard } from "./LotCard";
import { LotManage } from "./LotManage";
import { ReserveModal } from "./ReserveModal";

const selectCls = cn(inputClass(), "select-chevron cursor-pointer appearance-none");

/** I.5 — chợ lô vật liệu đã kiểm định, dành cho doanh nghiệp tái chế. */
export function MaterialsView() {
  const user = useCurrentUser();
  const { lots, myHolds } = useMaterials();
  const isOps = user?.role === "operator";
  const openLots = lots.filter((l) => l.status === "san-sang").length;

  return (
    <PageContainer>
      <PageIntro title="Chợ vật liệu tái chế">
        Lô phế liệu đã gom đủ số lượng và được kiểm định độ sạch, độ ẩm. Giữ lô 48 giờ để sắp xếp xe, rồi tới kho lấy hàng.
      </PageIntro>
      <div className="mt-6">
        <UrlTabs
          label="Chợ vật liệu"
          tabs={[
            { key: "dang-ban", label: "Lô đang bán", count: openLots, content: <Market /> },
            { key: "dang-giu", label: "Lô tôi đang giữ", count: myHolds.length, content: <MyHolds /> },
            ...(isOps ? [{ key: "quan-ly", label: "Quản lý lô", content: <LotManage /> }] : []),
          ]}
        />
      </div>
    </PageContainer>
  );
}

type Sort = "moi" | "gia" | "kg";

function Market() {
  const { lots } = useMaterials();
  const [material, setMaterial] = useState("all");
  const [grade, setGrade] = useState<LotGrade | "all">("all");
  const [area, setArea] = useState("all");
  const [sort, setSort] = useState<Sort>("moi");
  const [onlyOpen, setOnlyOpen] = useState(true);
  const [reserving, setReserving] = useState<MaterialLot | null>(null);

  const list = useMemo(() => {
    const l = lots.filter(
      (x) =>
        (!onlyOpen || x.status === "san-sang") &&
        (material === "all" || x.material === material) &&
        (grade === "all" || x.grade === grade) &&
        (area === "all" || x.area === area)
    );
    return l.sort((a, b) => (sort === "gia" ? a.pricePerKg - b.pricePerKg : sort === "kg" ? b.weightKg - a.weightKg : b.inspectedAt.localeCompare(a.inspectedAt)));
  }, [lots, material, grade, area, sort, onlyOpen]);

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="lot-material" className="mb-1.5 block text-[13px] font-semibold text-muted-foreground">
            Vật liệu
          </label>
          <select id="lot-material" value={material} onChange={(e) => setMaterial(e.target.value)} className={selectCls}>
            <option value="all">Mọi loại</option>
            {LOT_MATERIALS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="lot-grade" className="mb-1.5 block text-[13px] font-semibold text-muted-foreground">
            Hạng kiểm định
          </label>
          <select id="lot-grade" value={grade} onChange={(e) => setGrade(e.target.value as LotGrade | "all")} className={selectCls}>
            <option value="all">Mọi hạng</option>
            {(Object.keys(LOT_GRADE_HINT) as LotGrade[]).map((g) => (
              <option key={g} value={g}>
                Hạng {g}: {LOT_GRADE_HINT[g].toLowerCase()}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="lot-area" className="mb-1.5 block text-[13px] font-semibold text-muted-foreground">
            Kho ở quận
          </label>
          <select id="lot-area" value={area} onChange={(e) => setArea(e.target.value)} className={selectCls}>
            <option value="all">Mọi quận</option>
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="lot-sort" className="mb-1.5 block text-[13px] font-semibold text-muted-foreground">
            Sắp xếp
          </label>
          <select id="lot-sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={selectCls}>
            <option value="moi">Mới kiểm định trước</option>
            <option value="gia">Giá thấp trước</option>
            <option value="kg">Khối lượng lớn trước</option>
          </select>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[14px] text-muted-foreground" aria-live="polite">
          <strong className="text-foreground">{list.length}</strong> lô
        </p>
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-[14px] text-foreground">
          <input type="checkbox" checked={onlyOpen} onChange={(e) => setOnlyOpen(e.target.checked)} className="h-5 w-5 accent-primary" />
          Chỉ lô còn bán
        </label>
      </div>
      {list.length === 0 ? (
        <EmptyState icon={Boxes} title="Không có lô nào khớp" description="Thử bỏ bớt bộ lọc, hoặc xem cả lô đang giữ và đã bán." />
      ) : (
        <ul className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((l) => (
            <LotCard
              key={l.id}
              lot={l}
              action={
                l.status === "san-sang" ? (
                  <button type="button" onClick={() => setReserving(l)} className={cn(buttonClass.primary, "w-full")}>
                    Giữ lô 48 giờ
                  </button>
                ) : l.status === "dang-giu" ? (
                  <p className="text-[13px] text-muted-foreground">Đang có doanh nghiệp giữ tới {formatDateTime(l.reservation!.expiresAt)}.</p>
                ) : (
                  <p className="text-[13px] text-muted-foreground">Đã bán cho {l.soldTo}.</p>
                )
              }
            />
          ))}
        </ul>
      )}
      <ReserveModal lot={reserving} onClose={() => setReserving(null)} />
    </div>
  );
}

function MyHolds() {
  const { myHolds, release } = useMaterials();
  const toast = useToast();
  if (myHolds.length === 0)
    return <EmptyState icon={Clock} title="Bạn chưa giữ lô nào" description="Ở tab Lô đang bán, bấm Giữ lô 48 giờ để giữ riêng một lô cho doanh nghiệp của bạn." />;
  const now = new Date();
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {myHolds.map((l) => (
        <LotCard
          key={l.id}
          lot={l}
          action={
            <div className="flex flex-col gap-2">
              <p className="rounded-xl bg-warn/10 px-3 py-2 text-[13px] text-foreground">
                Còn <strong>{timeLeft(l.reservation!.expiresAt, now)}</strong> · hẹn lấy {formatDateTime(l.reservation!.pickupAt)}
              </p>
              <button
                type="button"
                onClick={() => {
                  release(l.id);
                  toast("info", `Đã bỏ giữ lô ${l.code}`);
                }}
                className={cn(buttonClass.secondary, "hover:border-destructive/50 hover:text-destructive")}
              >
                Bỏ giữ lô
              </button>
            </div>
          }
        />
      ))}
    </ul>
  );
}
