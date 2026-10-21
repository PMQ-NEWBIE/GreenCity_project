import type { Metadata } from "next";
import { BusinessDemandsView } from "@/features/demands/BusinessDemandsView";

export const metadata: Metadata = { title: "Đăng nhu cầu cần mua" };

export default function Page() {
  return <BusinessDemandsView />;
}
