"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useArgumentStore } from "@/lib/state/argumentStore";
import { useHistoryStore } from "@/lib/state/historyStore";
import { generateCase } from "@/lib/agents/caseCreator";
import type { SavedArgument } from "@/lib/types";

function Header() {
  const router = useRouter();
  return (
    <header className="flex items-center justify-between px-5 py-4">
      <button
        onClick={() => router.push("/leaderboard")}
        className="text-xs font-medium px-4 py-2 rounded-full border cursor-pointer transition-colors hover:bg-white/5"
        style={{ borderColor: "var(--chip-border)", color: "var(--text-secondary)" }}
      >
        Leaderboard
      </button>
      <button
        onClick={() => router.push("/profile")}
        className="text-xs font-medium px-4 py-2 rounded-full border cursor-pointer transition-colors hover:bg-white/5"
        style={{ borderColor: "var(--chip-border)", color: "var(--text-secondary)" }}
      >
        Profile
      </button>
    </header>
  );
}

function ArgumentHistoryItem({ arg, onClick }: { arg: SavedArgument; onClick: () => void }) {
  const outcomeColor = arg.outcome === "won" ? "#22c55e" : arg.outcome === "lost" ? "#ef4444" : "var(--text-muted)";
  return (
    <button onClick={onClick} className="w-full text-left px-5 py-4 rounded-2xl border cursor-pointer transition-all hover:bg-white/[0.03] active:scale-[0.99]" style={{ background: "var(--bg-card)", borderColor: "rgba(255,255,255,0.06)" }}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-sm font-medium flex-1 line-clamp-1" style={{ color: "var(--text-primary)" }}>{arg.caseData.title}</h3>
        <span className="text-[10px] font-semibold tracking-wider shrink-0 px-2 py-0.5 rounded-full" style={{ color: outcomeColor, background: `${outcomeColor}15` }}>
          {arg.outcome.toUpperCase()}
        </span>
      </div>
      <p className="text-xs line-clamp-1 mb-2" style={{ color: "var(--text-muted)" }}>{arg.caseData.charge}</p>
      <div className="flex items-center gap-3">
        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{arg.exchangeCount} rounds</span>
        <span className="text-[10px]" style={{ color: "var(--accent)" }}>Score: {arg.score}</span>
      </div>
    </button>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { initCase, setPhase, reset, selectEvidenceCards } = useArgumentStore();
  const { arguments: savedArgs, hydrate } = useHistoryStore();

  useEffect(() => {
    reset();
    hydrate();
  }, [reset, hydrate]);

  const handleEnterCourtroom = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const caseData = await generateCase();
      initCase(caseData);
      const allDefIds = caseData.defendant_points.map((p) => p.id);
      selectEvidenceCards(allDefIds);
      setPhase("chat");
      router.push("/chat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate case");
      setIsGenerating(false);
    }
  }, [initCase, setPhase, selectEvidenceCards, router, reset]);

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "var(--bg)" }}>
      <Header />

      <main className="flex-1 flex flex-col items-center px-5 pt-8">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3" style={{ color: "var(--text-primary)" }}>
            AI Courtroom
          </h1>
          <p className="text-sm max-w-xs mx-auto leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Where absurdity meets philosophy and justice is debatable
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }} className="w-full max-w-sm flex flex-col gap-3 mb-10">
          <button
            onClick={handleEnterCourtroom}
            disabled={isGenerating}
            className="w-full py-4 rounded-2xl text-sm font-semibold tracking-[0.2em] transition-all duration-200 hover:brightness-110 active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-wait"
            style={{ background: "var(--primary)", color: "#fff", boxShadow: "0 4px 24px rgba(255,56,92,0.25)" }}
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                GENERATING CASE...
              </span>
            ) : (
              "ENTER THE COURTROOM"
            )}
          </button>

          <button
            onClick={() => router.push("/prep/new")}
            className="w-full py-4 rounded-2xl text-sm font-semibold tracking-[0.2em] border-2 transition-all duration-200 hover:bg-[var(--accent)]/10 active:scale-[0.98] cursor-pointer"
            style={{ borderColor: "var(--accent)", color: "var(--accent)", background: "transparent" }}
          >
            CASE PREP MODE
          </button>
          <p className="text-[11px] text-center" style={{ color: "var(--text-muted)" }}>
            Upload real case documents and spar against AI opposing counsel
          </p>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full max-w-sm mb-6 px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Past Arguments */}
        {savedArgs.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="w-full max-w-sm">
            <h2 className="text-xs font-medium tracking-wider uppercase mb-3" style={{ color: "var(--text-muted)" }}>Past Arguments</h2>
            <div className="flex flex-col gap-2.5 pb-6 max-h-[40dvh] overflow-y-auto">
              {savedArgs.slice(0, 20).map((arg) => (
                <ArgumentHistoryItem key={arg.id} arg={arg} onClick={() => router.push(`/argument/${arg.id}`)} />
              ))}
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center">
        <p className="text-[10px] tracking-wider" style={{ color: "var(--text-muted)" }}>Powered by Claude AI</p>
      </footer>
    </div>
  );
}
