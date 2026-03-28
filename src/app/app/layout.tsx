import { Sidebar } from "@/components/Sidebar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Toaster } from "@/components/Toaster";
import { SessionWatcher } from "@/components/SessionWatcher";
import { CommandPalette } from "@/components/CommandPalette";
import { ToastProvider } from "@/context/ToastContext";
import { getFullUserContext } from "@/lib/auth/roles";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ctx = await getFullUserContext();

  // Not authenticated — middleware should catch this, but just in case
  if (!ctx) {
    redirect("/login");
  }

  // Authenticated but no org membership and not app admin → pending page
  if (!ctx.membership && ctx.appRole !== "app_admin") {
    redirect("/pending");
  }

  const isAdmin =
    ctx.appRole === "app_admin" || ctx.membership?.role === "admin";

  return (
    <ToastProvider>
      <div className="flex min-h-screen">
        <Sidebar isAdmin={isAdmin} />
        <div className="flex-1 flex flex-col md:pt-0 pt-14">
          <Breadcrumbs />
          <main className="flex-1">{children}</main>
        </div>
      </div>
      <Toaster />
      <SessionWatcher />
      <CommandPalette />
    </ToastProvider>
  );
}
