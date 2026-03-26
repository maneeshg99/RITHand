import { Sidebar } from "@/components/Sidebar";
import { AppProvider } from "@/context/AppContext";
import { getCurrentUserOrgMembership } from "@/lib/auth/roles";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const membership = await getCurrentUserOrgMembership();
  const isAdmin = membership?.role === "admin";

  return (
    <AppProvider>
      <div className="flex min-h-screen">
        <Sidebar isAdmin={isAdmin} />
        <main className="flex-1 md:pt-0 pt-14">{children}</main>
      </div>
    </AppProvider>
  );
}
