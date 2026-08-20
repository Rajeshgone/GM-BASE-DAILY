import type { Metadata } from "next";
import "./globals.css";

const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

const siteUrl = configuredUrl ||
  (vercelProductionUrl
    ? `https://${vercelProductionUrl}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "BaseGM — Say GM Onchain",
  description: "Turn your daily GM into a low-cost onchain moment on Base.",
  other: {
    "base:app_id": "6a86bb936ea1f57fed333a3d",
  },
  openGraph: {
    title: "BaseGM — Say GM Onchain",
    description: "A tiny daily ritual on Base. Connect, say GM, and make it onchain.",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "BaseGM — Say GM. Make it onchain." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BaseGM — Say GM Onchain",
    description: "A tiny daily ritual on Base.",
    images: ["/og.png"],
  },
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
