import type { Metadata } from "next";
import "./globals.css";

const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

const siteUrl = configuredUrl ||
  (vercelProductionUrl
    ? `https://${vercelProductionUrl}`
    : "http://localhost:3000");

const farcasterEmbed = JSON.stringify({
  version: "1",
  imageUrl: "https://gm-base-daily-1riq.vercel.app/embed.png",
  button: {
    title: "Say GM on Base",
    action: {
      type: "launch_miniapp",
      name: "BaseGM",
      url: "https://gm-base-daily-1riq.vercel.app/?miniApp=true",
      splashImageUrl: "https://gm-base-daily-1riq.vercel.app/splash.png",
      splashBackgroundColor: "#F5F8FF",
    },
  },
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "BaseGM — Say GM Onchain",
  description: "Turn your daily GM into a low-cost onchain moment on Base.",
  other: {
    "base:app_id": "6a86bb936ea1f57fed333a3d",
    "fc:miniapp": farcasterEmbed,
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
