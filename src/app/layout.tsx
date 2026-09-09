import type { Metadata, Viewport } from "next";
import { Noto_Serif, Noto_Sans, Noto_Sans_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { getTheme } from "@/lib/theme";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { SWRegister } from "./sw-register";
import { CookieConsent } from "@/components/cookie-consent";
import "./globals.css";

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  display: "swap",
});

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  display: "swap",
});

const notoMono = Noto_Sans_Mono({
  variable: "--font-noto-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#A25F4C" },
    { media: "(prefers-color-scheme: dark)", color: "#C17A5E" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "KatipCelebi",
    template: "%s | KatipCelebi",
  },
  description:
    "Kişisel dijital kütüphane deneyimi — Kitaplarınızı, ödünç geçmişini, okuma hedeflerinizi ve istatistiklerinizi, sıcak, sakin, zamanın ötesinde bir arayüzde takip edin. Noto Serif/Sans tipografisi, Terracotta/Dusty Rose ve Ink & Copper paleti, eşit boyutlu fiziksel kitap kartları ve duyarlı kabuk ile.",
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000"),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KatipCelebi",
  },
  openGraph: {
    title: "KatipCelebi",
    description:
      "Kişisel dijital kütüphane — sıcak, sakin, zamanın ötesinde. Noto tipografisi ve Terracotta/Ink-Copper paleti ile kitap kartları.",
    type: "website",
    locale: "en_US",
    siteName: "KatipCelebi",
  },
  twitter: {
    card: "summary",
    title: "KatipCelebi",
    description: "Kişisel dijital kütüphane — sıcak, sakin, zamanın ötesinde.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const theme = await getTheme();
  const locale = await getLocale();
  const dict = await getDictionary();
  return (
    <html
      lang={locale}
      className={`${notoSerif.variable} ${notoSans.variable} ${notoMono.variable} ${theme === "dark" ? "dark" : ""} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-full flex flex-col">
        <SWRegister />
        {children}
        <CookieConsent dict={dict.cookieConsent as never} />
        <Toaster />
      </body>
    </html>
  );
}
