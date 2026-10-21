import type { Metadata } from "next";
import { OrdersListView } from "@/features/orders/OrdersListView";

export const metadata: Metadata = { title: "Đơn thu mua" };

export default function Page() {
  return <OrdersListView side="buyer" />;
}
