"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { useCollect } from "@/store/hooks";
import { useBins } from "@/store/use-bins";
import { useLitter } from "@/store/use-litter";
import { PageContainer, PageIntro, buttonClass, inputClass } from "@/components/greencity/ui";
import { statsSeed } from "@/data/stats-seed";
import { lastMonths, liveRows, summarize, toCsv } from "@/lib/stats";
import { AREAS } from "@/types";
import { cn } from "@/lib/utils";
import { BarList, ColumnChart, DataTable } from "./Charts";

const PERIODS = [
  { n: 3, label: "3 tháng" },
  { n: 6, label: "6 tháng" },
] as const;

const monthLabel = (m: string) => `T${Number(m.slice(5))}/${m.slice(2, 4)}`;
const fmt = (n: number) => n.toLocaleString("vi-VN");

/** III.2 — thống kê thu gom, tỷ lệ bỏ thùng đúng chuẩn, điểm rác đã xử lý; theo quận và theo thời gian. */
export function StatsView() {
  const { requests } = useCollect();
  const { bins, dropoffs } = useBins();
  const { reports: litter } = useLitter();
  const [area, setArea] = useState("all");
  const [period, setPeriod] = useState<number>(6);

  const rows = useMemo(() => {
    const areaOfBin = (id: string) => bins.find((b) => b.id === id)?.area ?? "";
    return [...statsSeed(), ...liveRows(requests, dropoffs, litter, areaOfBin)];
  }, [bins, requests, dropoffs, litter]);
  const months = useMemo(() => lastMonths(new Date(), period), [period]);
  const s = useMemo(() => summarize(rows, months, area), [rows, months, area]);

  const exportCsv = () => {
    const scoped = rows.filter((r) => months.includes(r.month) && (area === "all" || r.area === area) && r.kg > 0);
    const csv = toCsv(
      ["Tháng", "Quận", "Nhóm vật liệu", "Khối lượng (kg)"],
      scoped.map((r) => [r.month, r.area, r.group, Math.round(r.kg * 10) / 10])
    );
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `green-city-thong-ke-${area === "all" ? "toan-thanh" : area.replace(/\s+/g, "-").toLowerCase()}-${period}-thang.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tiles = [
    { label: "Khối lượng thu gom", value: `${fmt(Math.round(s.totalKg))} kg`, hint: `${period} tháng gần nhất` },
    { label: "Bỏ thùng đúng chuẩn", value: s.dropOkRate == null ? "—" : `${Math.round(s.dropOkRate * 100)}%`, hint: `${fmt(s.dropChecked)} lượt đã kiểm` },
    { label: "Điểm rác đã dọn", value: fmt(s.litterDone), hint: "điểm" },
    { label: "Thời gian xử lý", value: s.litterAvgHours == null ? "—" : `${fmt(Math.round(s.litterAvgHours))} giờ`, hint: "trung bình từ lúc báo tới lúc dọn" },
  ];

  return (
    <PageContainer>
      <PageIntro title="Thống kê môi trường">
        Số liệu thu gom và phân loại cho tổ dân phố và doanh nghiệp. Đây là{" "}
        <strong className="font-semibold text-foreground">số liệu minh họa</strong>, cộng thêm hoạt động thật trên trình duyệt này.
      </PageIntro>

      {/* Bộ lọc: một hàng phía trên mọi biểu đồ */}
      <div className="mt-6 flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-56">
          <label htmlFor="stats-area" className="mb-1.5 block text-[13px] font-semibold text-muted-foreground">
            Khu vực
          </label>
          <select id="stats-area" value={area} onChange={(e) => setArea(e.target.value)} className={cn(inputClass(), "select-chevron cursor-pointer appearance-none")}>
            <option value="all">Toàn thành phố</option>
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-1 rounded-xl bg-muted p-1" role="group" aria-label="Khoảng thời gian">
          {PERIODS.map((p) => (
            <button
              key={p.n}
              type="button"
              aria-pressed={period === p.n}
              onClick={() => setPeriod(p.n)}
              className={cn("min-h-10 rounded-lg px-4 text-[14px] font-semibold", period === p.n ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}
            >
              {p.label}
            </button>
          ))}
        </div>
        <button type="button" onClick={exportCsv} className={cn(buttonClass.secondary, "sm:ml-auto")}>
          <Download className="h-[18px] w-[18px]" aria-hidden="true" />
          Xuất CSV
        </button>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-2xl border border-border bg-card p-4">
            <dt className="text-[13px] font-medium text-muted-foreground">{t.label}</dt>
            <dd className="mt-1 text-[26px] font-extrabold leading-none tabular-nums text-foreground">{t.value}</dd>
            <dd className="mt-1.5 text-[12px] text-muted-foreground">{t.hint}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section aria-labelledby="ch-month" className="rounded-2xl border border-border bg-card p-5">
          <h3 id="ch-month" className="text-[16px] font-bold text-foreground">
            Khối lượng thu gom theo tháng (kg)
          </h3>
          <p className="mb-4 text-[13px] text-muted-foreground">{area === "all" ? "Toàn thành phố" : area}</p>
          <ColumnChart label="Khối lượng thu gom theo tháng" unit="kg" data={s.byMonth.map((m) => ({ key: m.month, label: monthLabel(m.month), value: Math.round(m.kg) }))} />
          <p className="mt-2 text-[12px] text-muted-foreground">Cột cuối là tháng này, tính tới hôm nay.</p>
          <DataTable caption="Khối lượng thu gom theo tháng" head={["Tháng", "Kg"]} rows={s.byMonth.map((m) => [monthLabel(m.month), fmt(Math.round(m.kg))])} />
        </section>

        <section aria-labelledby="ch-group" className="rounded-2xl border border-border bg-card p-5">
          <h3 id="ch-group" className="text-[16px] font-bold text-foreground">
            Theo loại vật liệu (kg)
          </h3>
          <p className="mb-4 text-[13px] text-muted-foreground">{period} tháng gần nhất</p>
          <BarList label="Khối lượng theo loại vật liệu" unit="kg" data={s.byGroup.map((g) => ({ key: g.group, label: g.group, value: Math.round(g.kg) }))} />
          <DataTable caption="Khối lượng theo loại vật liệu" head={["Loại", "Kg"]} rows={s.byGroup.map((g) => [g.group, fmt(Math.round(g.kg))])} />
        </section>
      </div>

      <section aria-labelledby="ch-area" className="mt-6 rounded-2xl border border-border bg-card p-5">
        <h3 id="ch-area" className="text-[16px] font-bold text-foreground">
          Xếp hạng quận theo khối lượng thu gom (kg)
        </h3>
        <p className="mb-4 text-[13px] text-muted-foreground">
          {period} tháng gần nhất{area !== "all" && ` · đang tô đậm ${area}`}
        </p>
        <BarList label="Xếp hạng quận" unit="kg" highlight={area === "all" ? undefined : area} data={s.byArea.map((a) => ({ key: a.area, label: a.area, value: Math.round(a.kg) }))} />
        <DataTable caption="Xếp hạng quận theo khối lượng" head={["Quận", "Kg"]} rows={s.byArea.map((a) => [a.area, fmt(Math.round(a.kg))])} />
      </section>
    </PageContainer>
  );
}
