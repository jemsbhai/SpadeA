"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useHistoryStore } from "@/lib/state/historyStore";

export default function ProfilePage() {
  const router = useRouter();
  const { arguments: savedArgs, hydrate } = useHistoryStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    hydrate();
    setMounted(true);
  }, [hydrate]);

  if (!mounted) return null;

  const wins = savedArgs.filter((a) => a.outcome === "won").length;
  const losses = savedArgs.filter((a) => a.outcome === "lost").length;
  const total = savedArgs.length;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
  const totalScore = savedArgs.reduce((sum, a) => sum + a.score, 0);
  const avgScore = total > 0 ? Math.round(totalScore / total) : 0;

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "var(--bg)" }}>
      <header className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={() => router.push("/")} className="text-sm cursor-pointer p-2 rounded-full hover:bg-white/5 transition-colors" style={{ color: "var(--text-secondary)" }} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <h1 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Profile</h1>
      </header>

      <main className="flex-1 px-5 py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { label: "Total Cases", value: total },
              { label: "Win Rate", value: `${winRate}%` },
              { label: "Wins", value: wins },
              { label: "Losses", value: losses },
              { label: "Total Score", value: totalScore },
              { label: "Avg Score", value: avgScore },
            ].map((stat) => (
              <div key={stat.label} className="px-4 py-4 rounded-2xl border" style={{ background: "var(--bg-card)", borderColor: "rgba(255,255,255,0.06)" }}>
                <p className="text-[10px] font-medium tracking-wider uppercase mb-1" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
                <p className="text-2xl font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Recent Cases */}
          {savedArgs.length > 0 && (
            <div>
              <h2 className="text-xs font-medium tracking-wider uppercase mb-3" style={{ color: "var(--text-muted)" }}>Recent Cases</h2>
              <div className="flex flex-col gap-2">
                {savedArgs.slice(0, 10).map((arg) => (
                  <div key={arg.id} className="px-4 py-3 rounded-xl border" style={{ background: "var(--bg-card)", borderColor: "rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate flex-1 mr-3" style={{ color: "var(--text-primary)" }}>{arg.caseData.title}</p>
                      <span className="text-[10px] font-semibold tracking-wider shrink-0" style={{ color: arg.outcome === "won" ? "#22c55e" : "#ef4444" }}>
                        {arg.outcome.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{arg.exchangeCount} rounds</span>
                      <span className="text-[11px]" style={{ color: "var(--accent)" }}>Score: {arg.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {savedArgs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No cases yet. Enter the courtroom to start your record.</p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
