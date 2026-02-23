import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const ASSET_VERSION = "20260223-2";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: 'IGSGS', template: '%s • IGSGS' },
  applicationName: 'IGSGS',
  manifest: `/site.webmanifest?v=${ASSET_VERSION}`,
  icons: {
    icon: [
      { url: `/favicon-32x32.png?v=${ASSET_VERSION}`, sizes: '32x32', type: 'image/png' },
      { url: `/favicon-16x16.png?v=${ASSET_VERSION}`, sizes: '16x16', type: 'image/png' }
    ],
    apple: [
      { url: `/apple-touch-icon.png?v=${ASSET_VERSION}`, sizes: '180x180', type: 'image/png' }
    ]
  },
  appleWebApp: {
    capable: true,
    title: 'IGSGS',
    statusBarStyle: 'black-translucent'
  }
}

export const viewport: Viewport = {
  themeColor: '#0a7d2c',
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
