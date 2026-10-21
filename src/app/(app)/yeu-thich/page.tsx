import type { Metadata } from "next";
import { FavoritesView } from "@/pages-views/FavoritesView";

export const metadata: Metadata = { title: "Món đã lưu" };

export default function Page() {
  return <FavoritesView />;
}
