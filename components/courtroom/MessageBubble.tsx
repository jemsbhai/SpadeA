"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Message } from "@/lib/types";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isAttorney = message.sender === "attorney";
  const intensity = message.intensity ?? 1;
  const scale = intensity >= 4 ? 1 + (intensity - 4) * 0.008 : 1;
  const [copying, setCopying] = useState(false);

  const handleCopy = useCallback(async () => {
    setCopying(true);
    await navigator.clipboard.writeText(message.text);
    setTimeout(() => setCopying(false), 1000);
  }, [message.text]);

  return (
    <motion.div
      initial={isAttorney ? (intensity >= 7 ? { opacity: 0, scale: 0.9 } : { opacity: 0, x: -20 }) : { opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: intensity >= 7 ? 0.4 : 0.3, type: intensity >= 7 ? "spring" : "tween" }}
      className={`flex flex-col max-w-[82%] my-1.5 px-5 ${isAttorney ? "self-start" : "self-end"}`}
    >
      <span className={`text-[10px] font-medium tracking-wider mb-1 ${isAttorney ? "text-left" : "text-right"}`} style={{ color: isAttorney ? "var(--primary)" : "var(--accent)" }}>
        {isAttorney ? "PROSECUTION" : "YOU"}
      </span>
      <div
        className={`rounded-2xl px-4 py-3.5 ${isAttorney ? "rounded-tl-md" : "rounded-tr-md"} group relative`}
        style={{ background: isAttorney ? "var(--attorney-bubble)" : "var(--user-bubble)", transform: `scale(${scale})`, boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}
      >
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap" style={{ color: isAttorney ? "var(--attorney-text)" : "var(--user-text)" }}>
          {message.text}
        </p>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg cursor-pointer"
          style={{ background: "rgba(255,255,255,0.1)" }}
          aria-label="Copy message"
        >
          <AnimatePresence mode="wait">
            {copying ? (
              <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-xs" style={{ color: "var(--take-that)" }}>Done</motion.span>
            ) : (
              <motion.svg key="copy" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text-muted)" }}>
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </motion.svg>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );
}
