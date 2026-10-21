import type { Metadata } from "next";
import { OrdersListView } from "@/features/orders/OrdersListView";

export const metadata: Metadata = { title: "Đơn khách đặt mua" };

export default function Page() {
  return <OrdersListView side="seller" />;
}
