import type { Metadata } from "next";
import { OrdersListView } from "@/features/orders/OrdersListView";

export const metadata: Metadata = { title: "Đơn tôi đã đặt" };

export default function Page() {
  return <OrdersListView side="buyer" />;
}
