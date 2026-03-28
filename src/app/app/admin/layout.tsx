import { redirect } from "next/navigation";
import { isCurrentUserOrgAdmin, isAppAdmin } from "@/lib/auth/roles";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOrgAdmin, isAppAdminUser] = await Promise.all([
    isCurrentUserOrgAdmin(),
    isAppAdmin(),
  ]);

  // Allow access for both app admins and org admins
  if (!isOrgAdmin && !isAppAdminUser) {
    redirect("/app");
  }

  return <>{children}</>;
}
