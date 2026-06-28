import { Suspense } from "react";
import type { Metadata } from "next";
import CreateListForm from "@/components/CreateListForm";

export const metadata: Metadata = {
  title: "SteamShelf — Share Your Steam Game Lists",
  description:
    "Paste Steam URLs, fetch game info automatically, and share a curated list with anyone — no account needed.",
};

export default function HomePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Hero */}
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
          <span className="text-white">Share your </span>
          <span className="bg-gradient-to-r from-[#1a9fff] via-[#66c0f4] to-[#7c3aed] bg-clip-text text-transparent">
            Steam library
          </span>
          <br />
          <span className="text-white">with the world</span>
        </h1>
        <p className="text-[#8ba7c7] text-lg max-w-xl mx-auto">
          Paste Steam URLs. Get a shareable link in seconds.
        </p>
      </div>

      {/* Card */}
      <div className="rounded-2xl bg-[#1b2838]/50 border border-white/5 p-6 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.5)] backdrop-blur-sm">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-[#1b2838]" />}>
          <CreateListForm />
        </Suspense>
      </div>

      {/* How it works */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          {
            icon: "📋",
            title: "Paste URLs",
            desc: "Drop in any Steam Store links. We'll pull all the game details automatically.",
          },
          {
            icon: "🎮",
            title: "Review your shelf",
            desc: "Games appear as rich Steam-style cards with pricing and genres.",
          },
          {
            icon: "🔗",
            title: "Share instantly",
            desc: "One click generates a permanent link. No login, no fuss.",
          },
        ].map((step) => (
          <div
            key={step.title}
            className="text-center p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
          >
            <div className="text-3xl mb-3">{step.icon}</div>
            <h3 className="text-white font-semibold text-sm mb-2">{step.title}</h3>
            <p className="text-[#8ba7c7] text-xs leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
