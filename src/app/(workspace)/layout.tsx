import { WorkspaceShell } from "@/pages-views/WorkspaceShell";

/** Khu làm việc riêng của nhóm vận hành, cộng tác viên, doanh nghiệp — khung trang khác hẳn trang mua bán. */
export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
