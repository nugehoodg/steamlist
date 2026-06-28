"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SteamList } from "@/types";

interface ListActionsProps {
  list: SteamList;
}

export default function ListActions({ list }: ListActionsProps) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = window.location.href;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  function handleClone() {
    const appIds = list.items.map((item) => item.steam_id).join(",");
    router.push(`/?clone=${list.id}&app_ids=${appIds}`);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Copy Link */}
      <button
        id="copy-list-link-button"
        onClick={handleCopyLink}
        className={`flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-xl font-semibold text-sm
                   transition-all duration-200 border
                   ${
                     copied
                       ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                       : "bg-[#1a9fff]/10 border-[#1a9fff]/20 text-[#66c0f4] hover:bg-[#1a9fff]/20 hover:border-[#1a9fff]/40"
                   }
                   active:scale-95`}
      >
        {copied ? (
          <>
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
            </svg>
            Copy Link
          </>
        )}
      </button>

      {/* Clone List */}
      <button
        id="clone-list-button"
        onClick={handleClone}
        className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-xl font-semibold text-sm
                   bg-white/5 border border-white/10 text-[#8ba7c7]
                   hover:bg-white/10 hover:border-white/20 hover:text-white
                   transition-all duration-200 active:scale-95"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
          <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z" />
        </svg>
        Clone &amp; Edit
      </button>
    </div>
  );
}
