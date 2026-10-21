import type { Metadata } from "next";
import { OrdersListView } from "@/features/orders/OrdersListView";

export const metadata: Metadata = { title: "Đơn mua của tôi" };

export default function Page() {
  return <OrdersListView side="buyer" />;
}
