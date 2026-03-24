import type { Metadata } from "next";
import { DM_Sans, Space_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import { ThemeProvider } from "@/components/ui/theme-provider";
import Footer from "@/components/layout/Footer";
import { CommandPalette } from "@/components/ui/command-palette";

const fontSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "700"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://terminal.swayam.io";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Vyapar – Crypto Market Tracker",
    template: "%s | Vyapar",
  },
  description:
    "Track live cryptocurrency prices, real-time charts, trending coins, and market data powered by CoinGecko.",
  keywords: [
    "crypto",
    "cryptocurrency",
    "bitcoin",
    "ethereum",
    "market data",
    "live prices",
  ],
  authors: [{ name: "Vyapar" }],
  openGraph: {
    title: "Vyapar – Crypto Market Tracker",
    description:
      "Live crypto prices, real-time candlestick charts, and market insights.",
    url: APP_URL,
    siteName: "Vyapar",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vyapar – Crypto Market Tracker",
    description: "Live crypto prices, real-time charts, and market insights.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main>{children}</main>
          <Footer />
          <CommandPalette />
        </ThemeProvider>
      </body>
    </html>
  );
}
