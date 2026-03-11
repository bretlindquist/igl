import type { Metadata, Viewport } from "next";
import Providers from "./providers";
import "./globals.css";

const ASSET_VERSION = "20260311-1";

export const metadata: Metadata = {
  title: {
    default: "Itaewon Golf League",
    template: "%s | Itaewon Golf League",
  },
  description: "Itaewon Golf League leaderboard, TQE results, and eclectic standings.",
  applicationName: "Itaewon Golf League",
  manifest: `/site.webmanifest?v=${ASSET_VERSION}`,
  icons: {
    icon: [
      { url: `/favicon-32x32.png?v=${ASSET_VERSION}`, sizes: "32x32", type: "image/png" },
      { url: `/favicon-16x16.png?v=${ASSET_VERSION}`, sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: `/apple-touch-icon.png?v=${ASSET_VERSION}`, sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "Itaewon Golf League",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a7d2c",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
