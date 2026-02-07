"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useHistoryStore } from "@/lib/state/historyStore";
import { MessageBubble } from "@/components/courtroom/MessageBubble";
import type { SavedArgument } from "@/lib/types";

export default function ArgumentReplayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { arguments: savedArgs, hydrate } = useHistoryStore();
  const [argument, setArgument] = useState<SavedArgument | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const found = savedArgs.find((a) => a.id === id);
    if (found) setArgument(found);
  }, [savedArgs, id]);

  if (!argument) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading argument...</p>
      </div>
    );
  }

  const outcomeColor = argument.outcome === "won" ? "#22c55e" : "#ef4444";

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "var(--bg)" }}>
      <header className="flex items-center gap-3 px-5 py-4 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={() => router.push("/")} className="text-sm cursor-pointer p-2 rounded-full hover:bg-white/5 transition-colors" style={{ color: "var(--text-secondary)" }} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{argument.caseData.title}</h1>
        </div>
        <span className="text-xs font-semibold tracking-wider shrink-0 px-2.5 py-1 rounded-full" style={{ color: outcomeColor, background: `${outcomeColor}15` }}>{argument.outcome.toUpperCase()}</span>
      </header>

      {/* Case Info */}
      <div className="px-5 py-3 shrink-0" style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{argument.caseData.charge}</p>
        <div className="flex items-center gap-4 mt-1">
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{argument.exchangeCount} rounds</span>
          <span className="text-[11px]" style={{ color: "var(--accent)" }}>Score: {argument.score}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-2 px-0">
        {argument.messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 py-4 text-center shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={() => router.push("/")} className="text-sm font-medium px-6 py-2.5 rounded-full cursor-pointer hover:brightness-110 transition-all" style={{ background: "var(--primary)", color: "#fff" }}>
          Back to Home
        </button>
      </motion.div>
    </div>
  );
}
