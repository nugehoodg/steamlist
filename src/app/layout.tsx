import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: {
    default: "SteamList — Share Your Steam Game Lists",
    template: "%s · SteamList",
  },
  description:
    "Create and share curated Steam game lists — no account needed. Like Pastebin for your Steam wishlist.",
  keywords: ["Steam", "game list", "Steam games", "wishlist", "share games"],
  openGraph: {
    type: "website",
    siteName: "SteamList",
    title: "SteamList — Share Your Steam Game Lists",
    description:
      "Create and share curated Steam game lists — no account needed.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SteamList",
    description: "Share your curated Steam game lists with anyone.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="antialiased bg-[#0d1117] text-white min-h-screen">
        {/* Ambient background glows */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#1a9fff]/5 blur-[120px]" />
          <div className="absolute top-1/2 -right-60 w-[500px] h-[500px] rounded-full bg-[#7c3aed]/5 blur-[120px]" />
          <div className="absolute -bottom-40 left-1/3 w-[400px] h-[400px] rounded-full bg-[#4c6b22]/5 blur-[100px]" />
        </div>

        {/* Navigation */}
        <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0d1117]/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <a
                href="/"
                className="flex items-center gap-2.5 group"
                id="SteamList-logo"
              >
                {/* Logo icon */}
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1a9fff] to-[#7c3aed] flex items-center justify-center shadow-[0_0_15px_rgba(26,159,255,0.4)] group-hover:shadow-[0_0_20px_rgba(26,159,255,0.6)] transition-shadow">
                  <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-white" aria-hidden="true">
                    <path d="M2 6h2v12H2V6zm3 0h1v12H5V6zm2 0h3v12H7V6zm4 0h1v12h-1V6zm3 0h2v12h-2V6zm3 0h1v12h-1V6zm2 0h2v12h-2V6z" />
                  </svg>
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent group-hover:from-[#66c0f4] group-hover:to-white transition-all">
                  SteamList
                </span>
              </a>

              <a
                href="/"
                id="create-list-nav-link"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1a9fff]/10 hover:bg-[#1a9fff]/20 
                           text-[#66c0f4] text-sm font-medium border border-[#1a9fff]/20 hover:border-[#1a9fff]/40
                           transition-all duration-200"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
                </svg>
                New List
              </a>
            </div>
          </div>
        </header>

        <main className="relative z-10">
          {children}
        </main>

        {/* Footer */}
        <footer className="relative z-10 mt-24 border-t border-white/5 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-[#4a6580] text-sm">
              Made with 💚 by <a href="https://github.com/nugehoodg">Anugerah</a>
              <span className="mx-2">·</span>
              SteamList is not affiliated with Valve Corporation or Steam.
              <span className="mx-2">·</span>
              Lists expire after 90 days.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
