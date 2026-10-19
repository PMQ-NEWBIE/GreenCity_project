import type { Metadata } from "next";
import { DashboardView } from "@/pages-views/DashboardView";

export const metadata: Metadata = { title: "Tổng quan" };

export default function Page() {
  return <DashboardView />;
}
