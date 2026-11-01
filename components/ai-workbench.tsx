"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowRight, FileText, History, LoaderCircle, Sparkles } from "lucide-react";

type Task = "document" | "workflow" | "email";
type AIHistoryEntry = { id: string; task: Task; input: string; output: string; createdAt: string };

const historyKey = "booksintake-ai-history";
const copy: Record<Task, { title: string; historyTitle: string; description: string; label: string; placeholder: string; action: string; acceptsFile?: boolean }> = {
  document: { title: "Analyze a document", historyTitle: "Document analysis history", description: "Paste business text or load a text-based file to extract a concise, reviewable operational brief.", label: "Document text", placeholder: "Paste an invoice, contract excerpt, customer request, or business record…", action: "Analyze document", acceptsFile: true },
  workflow: { title: "Generate a workflow draft", historyTitle: "Workflow draft history", description: "Describe the process in plain language. You will receive an editable draft, not an automated workflow.", label: "Process requirement", placeholder: "Example: When a vendor invoice arrives, validate the supplier, capture the invoice fields, route exceptions to finance, and notify the requester…", action: "Generate draft" },
  email: { title: "Draft an email", historyTitle: "Email draft history", description: "Supply the essential context and review the result before sending it through your own mail system.", label: "Email context", placeholder: "Recipient, purpose, key facts, tone, and any requested next step…", action: "Draft email" },
};

function readHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(historyKey) || "[]") as unknown[];
    return parsed.filter((entry): entry is AIHistoryEntry => Boolean(entry && typeof entry === "object" && "id" in entry && "task" in entry && "input" in entry && "output" in entry && "createdAt" in entry && typeof entry.input === "string" && typeof entry.output === "string"));
  } catch { return []; }
}

function cleanResult(text: string) {
  return text.replace(/^#{1,6}\s*/gm, "").replace(/\*\*/g, "").replace(/^\s*[-*]\s+/gm, "• ").replace(/^\s*(result|response)\s*:?\s*/i, "");
}

export function AIWorkbench({ task }: { task: Task }) {
  const [content, setContent] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [model, setModel] = useState("");
  const [history, setHistory] = useState<AIHistoryEntry[]>([]);
  const text = copy[task];
  const taskHistory = useMemo(() => history.filter((entry) => entry.task === task), [history, task]);

  useEffect(() => {
    let active = true;
    const frame = requestAnimationFrame(() => { if (active) setHistory(readHistory()); });
    fetch("/api/ai/status").then(async (response) => {
      const payload = await response.json() as { configured?: boolean; model?: string };
      if (active) { setIsConfigured(Boolean(payload.configured)); setModel(payload.model || ""); }
    }).catch(() => { if (active) setIsConfigured(false); });
    return () => { active = false; cancelAnimationFrame(frame); };
  }, []);

  function saveHistory(entry: AIHistoryEntry) {
    const updated = [entry, ...history];
    try { localStorage.setItem(historyKey, JSON.stringify(updated)); setHistory(updated); }
    catch { setError("The result was generated, but this browser could not save it to local history."); }
  }

  async function loadFile(file: File | undefined) {
    if (!file) return;
    if (file.size > 250_000) { setError("Choose a text-based file smaller than 250 KB."); return; }
    try {
      const loaded = await file.text();
      if (!loaded.trim()) { setError("That file does not contain readable text."); return; }
      setContent(loaded.slice(0, 12000));
      setError(loaded.length > 12000 ? "The file was trimmed to the first 12,000 characters for this AI request." : "");
    } catch { setError("This file could not be read. Try a .txt, .md, .csv, or .json file."); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim()) return;
    setIsLoading(true); setError(""); setResult("");
    try {
      const response = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ task, content }) });
      const payload = await response.json() as { result?: string; error?: string };
      if (!response.ok || !payload.result) throw new Error(payload.error || "The request could not be completed.");
      setResult(payload.result);
      saveHistory({ id: crypto.randomUUID(), task, input: content, output: payload.result, createdAt: new Date().toISOString() });
    } catch (caught) { setError(caught instanceof Error ? caught.message : "The request could not be completed."); }
    finally { setIsLoading(false); }
  }

  function clearTaskHistory() {
    const updated = history.filter((entry) => entry.task !== task);
    localStorage.setItem(historyKey, JSON.stringify(updated));
    setHistory(updated);
  }

  return <section className="max-w-6xl"><header className="border-b border-[var(--rule)] pb-8"><div className="flex items-center gap-3 text-[var(--accent)]"><Sparkles size={18} strokeWidth={1.5} /><span className="text-sm font-semibold">{isConfigured ? `AI ready${model ? ` · ${model}` : ""}` : "AI workspace"}</span></div><h1 className="mt-4 text-2xl font-semibold tracking-[-.04em] text-white sm:text-[32px]">{text.title}</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">{text.description}</p></header><div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,.8fr)]"><form onSubmit={submit} className="panel p-5 sm:p-7"><div className="flex flex-wrap items-center justify-between gap-3"><label htmlFor={`${task}-content`} className="text-sm font-semibold text-white">{text.label}</label>{text.acceptsFile && <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-[var(--accent-strong)]"><FileText size={15} />Load text file<input type="file" accept=".txt,.md,.csv,.json,text/plain,text/markdown,text/csv,application/json" className="sr-only" onChange={(event) => { void loadFile(event.target.files?.[0]); event.currentTarget.value = ""; }} /></label>}</div><textarea id={`${task}-content`} value={content} onChange={(event) => setContent(event.target.value)} placeholder={text.placeholder} className="mt-4 min-h-72 w-full resize-y rounded-xl border border-[var(--border)] bg-black/20 p-4 text-sm leading-6 text-white outline-none placeholder:text-[var(--faint)] focus:border-[var(--accent)]" />{text.acceptsFile && <p className="mt-2 text-xs text-[var(--faint)]">Text-based files only. PDF, image, and OCR support require a separate document-processing service.</p>}<div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-[var(--faint)]">{isConfigured === false ? "Add the selected provider key to enable this workspace." : `Sent only when you select ${text.action.toLowerCase()}.`}</p><button type="submit" disabled={isLoading || !content.trim() || isConfigured === false} className="primary-action disabled:cursor-not-allowed disabled:opacity-45">{isLoading ? <><LoaderCircle size={16} className="animate-spin" />Generating concise answer…</> : <>{text.action} <ArrowRight size={16} /></>}</button></div>{error && <p className="mt-4 border-l-2 border-red-400 pl-3 text-sm leading-6 text-red-200">{error}</p>}</form><aside className="panel min-h-72 p-5 sm:p-7"><p className="text-sm font-semibold text-white">Result</p>{result ? <div className="mt-5 space-y-3 text-sm leading-7 text-[var(--muted)]">{cleanResult(result).split(/\n+/).filter(Boolean).map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}</div> : <p className="mt-5 text-sm leading-7 text-[var(--faint)]">{isConfigured === false ? "AI is not configured. Add the server-side environment variables, restart the application, and return here to generate a result." : "Your AI output will appear here. Nothing is generated until you submit content."}</p>}</aside></div><section className="panel mt-6 p-5 sm:p-7"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><History size={17} className="text-[var(--accent)]" /><h2 className="text-base font-semibold text-white">{text.historyTitle}</h2></div>{taskHistory.length > 0 && <button type="button" onClick={clearTaskHistory} className="text-xs font-semibold text-[var(--accent-strong)]">Clear this history</button>}</div><p className="mt-2 text-xs leading-5 text-[var(--faint)]">Saved in this browser. Outputs remain separate by feature.</p>{taskHistory.length ? <div className="mt-5 divide-y divide-[var(--rule)]">{taskHistory.map((entry) => <button type="button" key={entry.id} onClick={() => { setContent(entry.input); setResult(entry.output); setError(""); }} className="block w-full py-4 text-left first:pt-0"><span className="block truncate text-sm font-semibold text-white">{entry.input.replace(/\s+/g, " ").slice(0, 90)}</span><time className="mt-1 block text-xs text-[var(--faint)]">{new Date(entry.createdAt).toLocaleString()}</time></button>)}</div> : <p className="mt-5 text-sm text-[var(--faint)]">No saved outputs for this feature yet.</p>}</section></section>;
}
