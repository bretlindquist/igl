import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
  manifest: '/site.webmanifest',
  themeColor: '#0a7d2c',
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#0a7d2c' }
    ]
  },
  appleWebApp: {
    capable: true,
    title: 'IGSGS',
    statusBarStyle: 'black-translucent'
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
<body className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900
                 dark:from-slate-900 dark:to-slate-950 dark:text-slate-100">
  {children}
</body>
    </html>
  );
}
