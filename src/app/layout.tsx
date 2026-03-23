import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { AppProvider } from "@/context/AppContext";

export const metadata: Metadata = {
  title: "RITHand - Right IT Hand",
  description:
    "Your IT leadership dashboard — vendor news, security alerts, and intelligence in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 md:pt-0 pt-14">{children}</main>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
