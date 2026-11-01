"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, LoaderCircle, Sparkles } from "lucide-react";

type Task = "document" | "workflow" | "email";

const copy: Record<Task, { title: string; description: string; label: string; placeholder: string; action: string }> = {
  document: { title: "Analyze a document", description: "Paste business text to extract a concise, reviewable operational brief.", label: "Document text", placeholder: "Paste an invoice, contract excerpt, customer request, or business record…", action: "Analyze document" },
  workflow: { title: "Generate a workflow draft", description: "Describe the process in plain language. You will receive an editable draft, not an automated workflow.", label: "Process requirement", placeholder: "Example: When a vendor invoice arrives, validate the supplier, capture the invoice fields, route exceptions to finance, and notify the requester…", action: "Generate draft" },
  email: { title: "Draft an email", description: "Supply the essential context and review the result before sending it through your own mail system.", label: "Email context", placeholder: "Recipient, purpose, key facts, tone, and any requested next step…", action: "Draft email" },
};

export function AIWorkbench({ task }: { task: Task }) {
  const [content, setContent] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const text = copy[task];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim()) return;
    setIsLoading(true); setError(""); setResult("");
    try {
      const response = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ task, content }) });
      const payload = await response.json() as { result?: string; error?: string };
      if (!response.ok || !payload.result) throw new Error(payload.error || "The request could not be completed.");
      setResult(payload.result);
      const history = JSON.parse(localStorage.getItem("booksintake-ai-history") || "[]") as { task: Task; createdAt: string }[];
      localStorage.setItem("booksintake-ai-history", JSON.stringify([{ task, createdAt: new Date().toISOString() }, ...history].slice(0, 50)));
    } catch (caught) { setError(caught instanceof Error ? caught.message : "The request could not be completed."); }
    finally { setIsLoading(false); }
  }

  return <section className="max-w-6xl"><header className="border-b border-[var(--rule)] pb-8"><div className="flex items-center gap-3 text-[var(--accent)]"><Sparkles size={18} strokeWidth={1.5} /><span className="text-sm font-semibold">AI workspace</span></div><h1 className="mt-4 text-2xl font-semibold tracking-[-.04em] text-white sm:text-[32px]">{text.title}</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">{text.description}</p></header><div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,.8fr)]"><form onSubmit={submit} className="panel p-5 sm:p-7"><label htmlFor={`${task}-content`} className="text-sm font-semibold text-white">{text.label}</label><textarea id={`${task}-content`} value={content} onChange={(event) => setContent(event.target.value)} placeholder={text.placeholder} className="mt-4 min-h-72 w-full resize-y rounded-xl border border-[var(--border)] bg-black/20 p-4 text-sm leading-6 text-white outline-none placeholder:text-[var(--faint)] focus:border-[var(--accent)]" /><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-[var(--faint)]">Sent only when you select {text.action.toLowerCase()}.</p><button type="submit" disabled={isLoading || !content.trim()} className="primary-action disabled:cursor-not-allowed disabled:opacity-45">{isLoading ? <><LoaderCircle size={16} className="animate-spin" />Working…</> : <>{text.action} <ArrowRight size={16} /></>}</button></div>{error && <p className="mt-4 border-l-2 border-red-400 pl-3 text-sm leading-6 text-red-200">{error}</p>}</form><aside className="panel min-h-72 p-5 sm:p-7"><p className="text-sm font-semibold text-white">Result</p>{result ? <pre className="mt-5 whitespace-pre-wrap font-sans text-sm leading-7 text-[var(--muted)]">{result}</pre> : <p className="mt-5 text-sm leading-7 text-[var(--faint)]">Your AI output will appear here. Nothing is generated until you submit content and configure a server-side provider key.</p>}</aside></div></section>;
}
