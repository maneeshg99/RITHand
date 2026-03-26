import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased">{children}</body>
    </html>
  );
}
