import type { Metadata } from "next";
import { ProfileView } from "@/pages-views/ProfileView";

export const metadata: Metadata = { title: "Hồ sơ của tôi" };

export default function Page() {
  return <ProfileView />;
}
