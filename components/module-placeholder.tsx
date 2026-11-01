import { ArrowRight, Check, Construction } from "lucide-react";
import type { ModuleDefinition } from "@/lib/modules";

const plannedWork: Record<string, string[]> = {
  "Document Processing": ["Receive files and business records", "Extract structured fields", "Route exceptions for review"],
  "Workflow Generator": ["Capture process requirements", "Generate editable workflow drafts", "Assign owners and handoffs"],
  "Workflow Builder": ["Compose workflow steps", "Set triggers and conditions", "Review execution history"],
  "Email Assistant": ["Draft business replies", "Apply workspace context", "Review messages before sending"],
  "Business Intelligence": ["Define operating metrics", "Measure workflow performance", "Share actionable reporting"],
  "Team Management": ["Invite workspace members", "Set access roles", "Maintain team context"],
};

const implementationInputs: Record<string, string[]> = {
  "Document Processing": ["Document sources", "Extraction fields", "Review owners"],
  "Workflow Generator": ["Process goals", "Decision rules", "Responsible roles"],
  "Workflow Builder": ["Workflow triggers", "Step conditions", "Completion outcomes"],
  "Email Assistant": ["Approved knowledge", "Writing guidance", "Review policy"],
  "Business Intelligence": ["Operating metrics", "Data sources", "Reporting cadence"],
  "Team Management": ["Member directory", "Access roles", "Workspace policies"],
};

export function ModulePlaceholder({ module }: { module: ModuleDefinition }) {
  const Icon = module.icon;
  const capabilities = plannedWork[module.name] ?? [];
  const inputs = implementationInputs[module.name] ?? [];

  return (
    <section className="max-w-6xl">
      <header className="grid gap-6 border-b border-[var(--rule)] pb-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div><div className="text-[var(--accent)]"><Icon size={16} strokeWidth={1.5} /></div><h1 className="mt-4 text-2xl font-semibold tracking-[-.045em] text-white sm:text-[32px]">{module.name}</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">{module.description}</p></div>
        <p className="text-xs font-semibold text-[var(--faint)]">Status: planned</p>
      </header>
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)]">
        <div className="panel p-6 sm:p-8"><div className="text-[var(--accent)]"><Construction size={18} strokeWidth={1.5} /></div><h2 className="mt-7 text-2xl font-semibold tracking-[-.035em] text-white">This area is ready for its first working flow.</h2><p className="mt-3 max-w-xl text-sm leading-7 text-[var(--muted)]">The workspace frame is in place. This module will gain its data model, user flows, and integrations in a later implementation phase.</p><div className="mt-8 flex items-center gap-2 border-t border-[var(--rule)] pt-5 text-sm text-[var(--faint)]">No activity to show <ArrowRight size={15} /></div></div>
        <aside className="panel p-6"><h2 className="text-xl font-semibold tracking-[-.025em] text-white">Current foundation</h2><dl className="mt-7 divide-y divide-[var(--rule)]"><div className="flex items-center justify-between py-4 first:pt-0"><dt className="text-sm text-[var(--muted)]">Navigation</dt><dd className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-strong)]"><Check size={14} strokeWidth={2} />Ready</dd></div><div className="flex items-center justify-between py-4"><dt className="text-sm text-[var(--muted)]">Data model</dt><dd className="text-xs font-semibold text-[var(--faint)]">Pending</dd></div><div className="flex items-center justify-between py-4 last:pb-0"><dt className="text-sm text-[var(--muted)]">Interactive flows</dt><dd className="text-xs font-semibold text-[var(--faint)]">Pending</dd></div></dl></aside>
      </div>
      <section className="mt-10"><div className="flex items-end justify-between gap-4"><h2 className="text-xl font-semibold tracking-[-.025em] text-white">Planned capabilities</h2><span className="text-xs font-medium text-[var(--faint)]">{capabilities.length} items</span></div><div className="mt-5 grid gap-4 sm:grid-cols-3">{capabilities.map((capability) => <div key={capability} className="panel-subtle p-5"><span className="block size-1.5 rounded-full bg-[var(--accent)]" /><p className="mt-6 text-sm leading-6 text-[var(--muted)]">{capability}</p></div>)}</div></section>
      <section className="panel mt-10 p-6 sm:p-8"><h2 className="text-xl font-semibold tracking-[-.025em] text-white">Implementation inputs</h2><p className="mt-2 text-sm text-[var(--muted)]">These decisions shape the first working version of this area.</p><div className="mt-7 grid gap-4 sm:grid-cols-3">{inputs.map((input) => <div key={input} className="border-t border-[var(--accent)] bg-[rgba(115,215,255,.035)] px-4 py-5"><span className="block size-1.5 rounded-full bg-[var(--accent)]" /><p className="mt-5 text-sm font-semibold text-white">{input}</p></div>)}</div></section>
    </section>
  );
}
