import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { getTheme } from "@/lib/theme";
import { getLocale } from "@/i18n/get-dictionary";
import { SWRegister } from "./sw-register";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3584e4" },
    { media: "(prefers-color-scheme: dark)", color: "#3584e4" },
  ],
  appleMobileWebAppCapable: "yes",
  appleMobileWebAppStatusBarStyle: "default",
  appleMobileWebAppTitle: "KatipCelebi",
};

export const metadata: Metadata = {
  title: {
    default: "KatipCelebi",
    template: "%s | KatipCelebi",
  },
  description: "Track your books, lending history, reading goals, and stats.",
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000"),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KatipCelebi",
  },
  openGraph: {
    title: "KatipCelebi",
    description: "Track your books, lending history, reading goals, and stats.",
    type: "website",
    locale: "en_US",
    siteName: "KatipCelebi",
  },
  twitter: {
    card: "summary",
    title: "KatipCelebi",
    description: "Track your books, lending history, reading goals, and stats.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const theme = await getTheme();
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${theme === "dark" ? "dark" : ""} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col">
        <SWRegister />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
