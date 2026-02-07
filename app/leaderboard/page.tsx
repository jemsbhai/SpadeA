"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useHistoryStore } from "@/lib/state/historyStore";

export default function LeaderboardPage() {
  const router = useRouter();
  const { arguments: savedArgs, hydrate } = useHistoryStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    hydrate();
    setMounted(true);
  }, [hydrate]);

  if (!mounted) return null;

  const sorted = [...savedArgs].sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "var(--bg)" }}>
      <header className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={() => router.push("/")} className="text-sm cursor-pointer p-2 rounded-full hover:bg-white/5 transition-colors" style={{ color: "var(--text-secondary)" }} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <h1 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Leaderboard</h1>
      </header>

      <main className="flex-1 px-5 py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">
          {sorted.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No cases completed yet. Start arguing to appear on the leaderboard.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {sorted.map((arg, i) => (
                <motion.div key={arg.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-xl border" style={{ background: "var(--bg-card)", borderColor: "rgba(255,255,255,0.06)" }}>
                  <span className="text-lg font-bold tabular-nums w-8 text-center shrink-0" style={{ color: i < 3 ? "var(--accent)" : "var(--text-muted)" }}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{arg.caseData.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[11px]" style={{ color: arg.outcome === "won" ? "#22c55e" : "#ef4444" }}>{arg.outcome.toUpperCase()}</span>
                      <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{arg.exchangeCount} rounds</span>
                    </div>
                  </div>
                  <span className="text-lg font-bold tabular-nums shrink-0" style={{ color: "var(--accent)" }}>{arg.score}</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
