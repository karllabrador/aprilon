import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aprilon — gaming community (now defunct)",
  description:
    "Aprilon was a gaming community that hosted game servers for a multitude of games, including Garry's Mod, Team Fortress 2 and Minecraft",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
