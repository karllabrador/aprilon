import type { Metadata } from "next";
import "./globals.css";

const description =
  "Aprilon was a gaming community that hosted game servers for Garry's Mod, Team Fortress 2, and Minecraft. This site preserves its history.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://aprilon.org",
  ),
  title: "Aprilon — gaming community (now defunct)",
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Aprilon — gaming community (now defunct)",
    description,
    url: "/",
    siteName: "Aprilon",
    type: "website",
    images: [
      {
        url: "/images/hl2dm-event-puzzle.jpg",
        width: 1920,
        height: 1080,
        alt: "Aprilon gaming community",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aprilon — gaming community (now defunct)",
    description,
    images: ["/images/hl2dm-event-puzzle.jpg"],
  },
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
