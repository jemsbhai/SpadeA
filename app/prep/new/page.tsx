"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface UploadedFile {
  name: string;
  type: string;
  text: string;
  charCount: number;
}

const CASE_TYPES = ["Civil", "Criminal", "Family", "Contract", "Employment", "IP", "Other"];

const ROLES = [
  { id: "plaintiff", label: "Plaintiff", desc: "You are the one bringing the claim" },
  { id: "prosecution", label: "Prosecution", desc: "You represent the state's case" },
  { id: "defendant", label: "Defendant", desc: "You are defending against the claim" },
  { id: "defense_counsel", label: "Defense Counsel", desc: "You represent the defendant" },
];

const TONES = [
  { id: "ace", icon: "bolt", label: "Ace Attorney", desc: "Dramatic, theatrical, over-the-top courtroom flair" },
  { id: "professional", icon: "scale", label: "Professional Attorney", desc: "Measured, precise, cites procedure and precedent" },
  { id: "aggressive", icon: "flame", label: "Aggressive Litigator", desc: "High-pressure, rapid-fire, exploits every weakness" },
  { id: "socratic", icon: "brain", label: "Socratic Examiner", desc: "Probing questions that force you to justify every claim" },
];

function ToneIcon({ icon }: { icon: string }) {
  switch (icon) {
    case "bolt":
      return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case "scale":
      return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v18M3 7l9-4 9 4M3 7v4a9 9 0 0018 0V7" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case "flame":
      return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case "brain":
      return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a4 4 0 014 4v1a3 3 0 013 3 3 3 0 01-1 5.83V17a4 4 0 01-4 4H10a4 4 0 01-4-4v-1.17A3 3 0 015 10a3 3 0 013-3V6a4 4 0 014-4z" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    default:
      return null;
  }
}

export default function CasePrepIntakePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [pastedText, setPastedText] = useState("");
  const [notebookSummary, setNotebookSummary] = useState("");
  const [caseType, setCaseType] = useState("");
  const [role, setRole] = useState("");
  const [tone, setTone] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [courtLevel, setCourtLevel] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const extractTextFromFile = useCallback(async (file: File): Promise<string> => {
    if (file.type === "application/pdf") {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const pages: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          pages.push(content.items.map((item: { str?: string }) => ('str' in item ? item.str : '')).join(" "));
        }
        return pages.join("\n\n");
      } catch {
        return `[PDF extraction failed for ${file.name}]`;
      }
    }
    return await file.text();
  }, []);

  const handleFiles = useCallback(async (fileList: FileList) => {
    const newFiles: UploadedFile[] = [];
    for (const file of Array.from(fileList)) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!["pdf", "txt", "md"].includes(ext || "")) continue;
      const text = await extractTextFromFile(file);
      newFiles.push({ name: file.name, type: ext || "txt", text, charCount: text.length });
    }
    setFiles((prev) => [...prev, ...newFiles]);
  }, [extractTextFromFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeFile = useCallback((idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const handleAnalyze = useCallback(async () => {
    setIsAnalyzing(true);
    // In a real app, this would call an AI agent to analyze the case
    // For now, navigate to a placeholder
    await new Promise((r) => setTimeout(r, 1500));
    setIsAnalyzing(false);
    // TODO: Navigate to /prep/[id] with analyzed case data
    router.push("/");
  }, [router]);

  const isFormValid = title.trim() && (files.length > 0 || pastedText.trim()) && caseType && role && tone;

  return (
    <div className="min-h-dvh" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={() => router.back()} className="p-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors" style={{ color: "var(--text-muted)" }} aria-label="Go back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <h1 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>New Case Prep</h1>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-6">
        {/* Disclaimer */}
        <div className="rounded-xl px-4 py-3 mb-8" style={{ background: "rgba(224,185,122,0.08)", border: "1px solid rgba(224,185,122,0.2)" }}>
          <p className="text-xs leading-relaxed" style={{ color: "var(--accent)" }}>
            This tool is for preparation and training purposes only. It does not provide legal advice.
          </p>
        </div>

        {/* Case Title */}
        <SectionLabel label="Case Title" />
        <input
          type="text" value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Smith v. Johnson"
          className="w-full rounded-xl px-4 py-3 text-sm border outline-none mb-8 transition-colors"
          style={{ background: "var(--bg-light)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-primary)" }}
        />

        {/* Case Documents */}
        <SectionLabel label="Case Documents" />
        <div
          className={`rounded-xl border-2 border-dashed px-6 py-8 text-center mb-4 transition-colors cursor-pointer ${dragOver ? "border-[var(--primary)]" : ""}`}
          style={{ borderColor: dragOver ? "var(--primary)" : "rgba(255,255,255,0.1)", background: dragOver ? "rgba(255,56,92,0.05)" : "transparent" }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3" style={{ color: "var(--text-muted)" }}>
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round"/>
          </svg>
          <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>Drop files here or click to browse</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>PDF, TXT, MD supported</p>
        </div>
        <input ref={fileInputRef} type="file" accept=".pdf,.txt,.md" multiple className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />

        {/* Uploaded files list */}
        <AnimatePresence>
          {files.map((file, idx) => (
            <motion.div key={file.name + idx} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 rounded-xl px-4 py-3 mb-2" style={{ background: "var(--bg-card)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: "rgba(255,56,92,0.15)", color: "var(--primary)" }}>{file.type.toUpperCase()}</span>
              <span className="text-sm flex-1 truncate" style={{ color: "var(--text-primary)" }}>{file.name}</span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{file.charCount.toLocaleString()} chars</span>
              <button onClick={() => removeFile(idx)} className="p-1 rounded cursor-pointer hover:bg-white/5" style={{ color: "var(--text-muted)" }} aria-label="Remove file">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Paste text */}
        <textarea
          value={pastedText} onChange={(e) => setPastedText(e.target.value)}
          placeholder="Or paste case text directly here..."
          rows={4}
          className="w-full rounded-xl px-4 py-3 text-sm border outline-none mb-4 resize-none transition-colors"
          style={{ background: "var(--bg-light)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-primary)" }}
        />

        {/* NotebookLM Summary */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium tracking-wider uppercase" style={{ color: "var(--text-muted)" }}>NotebookLM Summary</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}>optional</span>
        </div>
        <textarea
          value={notebookSummary} onChange={(e) => setNotebookSummary(e.target.value)}
          placeholder="Paste your NotebookLM summary..."
          rows={3}
          className="w-full rounded-xl px-4 py-3 text-sm border outline-none mb-8 resize-none transition-colors"
          style={{ background: "var(--bg-light)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-primary)" }}
        />

        {/* Case Type */}
        <SectionLabel label="Case Type" />
        <div className="flex flex-wrap gap-2 mb-8">
          {CASE_TYPES.map((ct) => (
            <button key={ct} onClick={() => setCaseType(ct)}
              className="px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer"
              style={{
                background: caseType === ct ? "var(--primary)" : "transparent",
                borderColor: caseType === ct ? "var(--primary)" : "rgba(255,255,255,0.1)",
                color: caseType === ct ? "#fff" : "var(--text-secondary)",
              }}>
              {ct}
            </button>
          ))}
        </div>

        {/* Your Role */}
        <SectionLabel label="Your Role" />
        <div className="grid grid-cols-2 gap-3 mb-8">
          {ROLES.map((r) => (
            <button key={r.id} onClick={() => setRole(r.id)}
              className="p-4 rounded-xl border text-left transition-all cursor-pointer hover:bg-white/[0.02]"
              style={{
                background: role === r.id ? "rgba(255,56,92,0.08)" : "var(--bg-card)",
                borderColor: role === r.id ? "var(--primary)" : "rgba(255,255,255,0.06)",
              }}>
              <span className="text-sm font-medium block mb-1" style={{ color: role === r.id ? "var(--primary)" : "var(--text-primary)" }}>{r.label}</span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{r.desc}</span>
            </button>
          ))}
        </div>

        {/* Opposing Counsel Tone */}
        <SectionLabel label="Opposing Counsel Tone" />
        <div className="grid grid-cols-2 gap-3 mb-8">
          {TONES.map((t) => (
            <button key={t.id} onClick={() => setTone(t.id)}
              className="p-4 rounded-xl border text-left transition-all cursor-pointer hover:bg-white/[0.02]"
              style={{
                background: tone === t.id ? "rgba(255,56,92,0.08)" : "var(--bg-card)",
                borderColor: tone === t.id ? "var(--primary)" : "rgba(255,255,255,0.06)",
              }}>
              <div className="flex items-center gap-2 mb-2" style={{ color: tone === t.id ? "var(--primary)" : "var(--text-secondary)" }}>
                <ToneIcon icon={t.icon} />
                <span className="text-sm font-medium" style={{ color: tone === t.id ? "var(--primary)" : "var(--text-primary)" }}>{t.label}</span>
              </div>
              <span className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{t.desc}</span>
            </button>
          ))}
        </div>

        {/* Additional Details */}
        <SectionLabel label="Additional Details" optional />
        <div className="grid grid-cols-2 gap-3 mb-8">
          <input type="text" value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} placeholder="Jurisdiction"
            className="rounded-xl px-4 py-3 text-sm border outline-none transition-colors"
            style={{ background: "var(--bg-light)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-primary)" }} />
          <input type="text" value={courtLevel} onChange={(e) => setCourtLevel(e.target.value)} placeholder="Court Level"
            className="rounded-xl px-4 py-3 text-sm border outline-none transition-colors"
            style={{ background: "var(--bg-light)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-primary)" }} />
        </div>

        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={!isFormValid || isAnalyzing}
          className="w-full py-4 rounded-2xl text-sm font-semibold tracking-[0.2em] transition-all duration-200 hover:brightness-110 active:scale-[0.98] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mb-12"
          style={{ background: "var(--primary)", color: "#fff", boxShadow: isFormValid ? "0 4px 24px rgba(255,56,92,0.25)" : "none" }}
        >
          {isAnalyzing ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              ANALYZING CASE...
            </span>
          ) : (
            "ANALYZE CASE"
          )}
        </button>
      </div>
    </div>
  );
}

function SectionLabel({ label, optional }: { label: string; optional?: boolean }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-xs font-medium tracking-wider uppercase" style={{ color: "var(--text-muted)" }}>{label}</span>
      {optional && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}>optional</span>}
    </div>
  );
}
