import type { Metadata } from "next";
import { BusinessDemandsView } from "@/features/demands/BusinessDemandsView";

export const metadata: Metadata = { title: "Nhu cầu thu mua" };

export default function Page() {
  return <BusinessDemandsView />;
}
