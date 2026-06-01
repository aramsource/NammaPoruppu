import type { Metadata } from "next";
import { Inter, Noto_Sans_Tamil } from "next/font/google";
import "./globals.css";
import { AppFooter } from "@/components/app-footer";
import { ClaimRedirect } from "@/components/claim-redirect";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { TopNav } from "@/components/top-nav";
import { CityProvider } from "@/context/city-context";
import { AuthProvider } from "@/context/auth-context";
import { LanguageProvider } from "@/context/language-context";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoSansTamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  variable: "--font-tamil",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nammaporuppu.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NammaPoruppu",
    template: "%s | NammaPoruppu",
  },
  description:
    "Report civic issues in Chennai, gain community support, and hold local officials accountable. A transparency platform for Chennai residents.",
  keywords: [
    "Chennai civic issues",
    "report pothole Chennai",
    "civic accountability",
    "ward complaints Chennai",
    "NammaPoruppu",
    "Chennai corporation complaints",
  ],
  openGraph: {
    type: "website",
    siteName: "NammaPoruppu",
    title: "NammaPoruppu - Chennai Civic Accountability Platform",
    description:
      "Report civic issues in Chennai, gain community support, and hold local officials accountable.",
    url: siteUrl,
    images: [{ url: "/logo/logo.png", alt: "NammaPoruppu" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NammaPoruppu - Chennai Civic Accountability Platform",
    description:
      "Report civic issues in Chennai, gain community support, and hold local officials accountable.",
    images: ["/logo/logo.png"],
  },
  icons: {
    icon: "/logo/favicon.svg",
    shortcut: "/logo/favicon.svg",
    apple: "/logo/logo.png",
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    title: "NammaPoruppu",
    statusBarStyle: "default",
  },
  applicationName: "NammaPoruppu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${notoSansTamil.variable} ${inter.className}`} suppressHydrationWarning>
        <LanguageProvider>
          <AuthProvider>
            <ClaimRedirect />
            <CityProvider>
              <TopNav />
              {children}
              <AppFooter />
              <PwaInstallPrompt />
            </CityProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
