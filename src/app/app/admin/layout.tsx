import { redirect } from "next/navigation";
import { isCurrentUserOrgAdmin } from "@/lib/auth/roles";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await isCurrentUserOrgAdmin();

  if (!isAdmin) {
    redirect("/app");
  }

  return <>{children}</>;
}
