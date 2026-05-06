import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClaimRedirect } from "@/components/claim-redirect";
import { TopNav } from "@/components/top-nav";
import { CityProvider } from "@/context/city-context";
import { AuthProvider } from "@/context/auth-context";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nammaporuppu.in";
const officialXUrl = process.env.NEXT_PUBLIC_OFFICIAL_X_URL ?? "https://x.com/nammaporuppu";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <ClaimRedirect />
          <CityProvider>
            <TopNav />
            {children}
            <footer className="border-t border-white/10 bg-slate-900 text-white">
              <div className="mx-auto max-w-7xl px-4 py-10">
                <div className="grid gap-8 md:grid-cols-3">
                  {/* About */}
                  <div>
                    <p className="font-bold text-white">NammaPoruppu</p>
                    <p className="mt-2 text-sm text-slate-300">
                      A civic accountability platform to report, track, and resolve local issues in your city.
                    </p>
                    <p className="mt-3 text-xs text-slate-400">
                      Built by{" "}
                      <a
                        href="https://aramsource.org"
                        target="_blank"
                        rel="noreferrer"
                        className="text-white/80 hover:text-white hover:underline"
                      >
                        AramSource
                      </a>
                    </p>
                  </div>

                  {/* Quick Links */}
                  <div>
                    <p className="text-sm font-semibold text-white">Quick Links</p>
                    <div className="mt-3 flex flex-col gap-2 text-sm">
                      <Link href="/privacy-policy" className="text-slate-300 hover:text-accent-300 hover:underline">
                        Privacy Policy
                      </Link>
                      <Link href="/terms" className="text-slate-300 hover:text-accent-300 hover:underline">
                        Terms of Use
                      </Link>
                      <Link href="/data-sources" className="text-slate-300 hover:text-accent-300 hover:underline">
                        Data Sources
                      </Link>
                      <a href="mailto:hello@nammaporuppu.in" className="text-slate-300 hover:text-accent-300 hover:underline">
                        hello@nammaporuppu.in
                      </a>
                    </div>
                  </div>

                  {/* Open Source */}
                  <div>
                    <p className="text-sm font-semibold text-white">Open Source</p>
                    <p className="mt-2 text-sm text-slate-300">
                      NammaPoruppu is open source. Contributions, bug reports, and feature ideas are welcome.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a
                        href="https://github.com/aramsource/NammaPoruppu"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.426 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.866-.014-1.7-2.782.605-3.369-1.344-3.369-1.344-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.607.069-.607 1.004.071 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.202 2.398.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.579.688.481A10.02 10.02 0 0 0 22 12.017C22 6.484 17.523 2 12 2Z" />
                        </svg>
                        View on GitHub
                      </a>
                      <a
                        href={officialXUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        @nammaporuppu
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-white/10 pt-5 text-center text-xs text-slate-400">
                  &copy; {new Date().getFullYear()} NammaPoruppu - MIT License
                </div>
              </div>
            </footer>
          </CityProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
