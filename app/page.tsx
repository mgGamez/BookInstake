import Link from "next/link";
import { ArrowRight, FileInput, GitBranch, UsersRound } from "lucide-react";
import { productModules } from "@/lib/modules";

const path = [
  { title: "Source", state: "No source connected", detail: "Choose where documents, emails, and requests first enter the workspace.", href: "/document-processing", icon: FileInput },
  { title: "Decision", state: "No rules configured", detail: "Define the business logic that turns incoming context into a clear next step.", href: "/workflow-generator", icon: GitBranch },
  { title: "Handoff", state: "No owner assigned", detail: "Set the accountable person or team that receives the completed work.", href: "/team-management", icon: UsersRound },
];

export default function DashboardPage() {
  return (
    <div className="space-y-10 lg:space-y-12">
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
        <div>
          <h1 className="max-w-3xl text-2xl font-semibold tracking-[-0.045em] text-white sm:text-[32px]">Turn every document into a decision.</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">BooksIntake gives incoming work a deliberate path: capture the source, define the decision, and send the finished context to the right person.</p>
          <div className="mt-7 flex flex-wrap gap-3"><Link href="/document-processing" className="primary-action">Configure first source <ArrowRight size={16} /></Link><Link href="/workflow-builder" className="secondary-action">Explore workflow builder</Link></div>
        </div>
        <aside className="panel-subtle p-5">
          <p className="text-sm font-semibold text-[var(--muted)]">Setup readiness</p>
          <p className="num mt-4 text-3xl font-semibold tracking-[-.05em] text-white">0<span className="text-[var(--faint)]">/3</span></p>
          <p className="mt-1 text-sm text-[var(--muted)]">Foundations defined</p>
          <div className="mt-5 border-t border-[var(--rule)] pt-4"><span className="status-line">Setup phase</span></div>
        </aside>
      </section>

      <section className="signal-canvas p-5 sm:p-7 lg:p-8">
        <div className="relative z-10 flex flex-col gap-3 border-b border-[rgba(115,215,255,.16)] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div><h2 className="text-xl font-semibold tracking-[-.025em] text-white">Your operating path starts here.</h2></div>
          <p className="text-sm text-[var(--muted)]">No active signal yet</p>
        </div>
        <div className="relative z-10 mt-7 grid gap-6 md:grid-cols-3 md:gap-0">
          {path.map(({ title, state, detail, href, icon: Icon }) => (
            <Link href={href} key={title} className="signal-node group rounded-xl p-3 transition-colors hover:bg-white/[.035] md:p-4">
              <div className="flex items-center gap-3"><span className="size-1.5 rounded-full bg-[var(--accent)]" /><Icon size={17} strokeWidth={1.5} className="text-[var(--accent)]" /><h3 className="text-sm font-semibold text-white">{title}</h3></div>
              <p className="mt-5 text-sm font-semibold text-[var(--accent-strong)]">{state}</p>
              <p className="mt-2 max-w-[270px] text-sm leading-6 text-[var(--muted)]">{detail}</p>
            </Link>
          ))}
        </div>
        <div className="relative z-10 mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-[rgba(115,215,255,.1)] pt-5"><p className="text-sm text-[var(--muted)]">Start with the source. The rest of the system follows from what enters it.</p><Link href="/document-processing" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent-strong)]">Begin setup <ArrowRight size={15} /></Link></div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_310px]">
        <div className="panel p-5 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-semibold tracking-[-.025em] text-white">Six areas, one operating system.</h2></div><span className="num text-xs font-medium text-[var(--faint)]">{productModules.length} modules</span></div>
          <div className="mt-7">{productModules.map(({ href, name, description, icon: Icon }) => <Link key={href} href={href} className="module-row group"><span className="size-1.5 shrink-0 rounded-full bg-[var(--faint)] transition-colors group-hover:bg-[var(--accent)]" /><Icon size={17} strokeWidth={1.5} className="text-[var(--faint)] transition-colors group-hover:text-[var(--accent)]" /><div className="min-w-0"><h3 className="text-sm font-semibold text-white">{name}</h3><p className="mt-1 text-[13px] text-[var(--muted)]">{description}</p></div><ArrowRight size={16} className="ml-auto text-[var(--faint)] transition-transform group-hover:translate-x-1 group-hover:text-[var(--accent)]" /></Link>)}</div>
        </div>
        <aside className="panel flex flex-col p-5 sm:p-7">
          <h2 className="text-xl font-semibold tracking-[-.025em] text-white">What to define first.</h2>
          <ul className="mt-7 space-y-5">{["Connect a document source", "Describe the decision rules", "Choose the accountable owner"].map((item) => <li key={item} className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--accent)]" /><span className="text-sm leading-5 text-[var(--muted)]">{item}</span></li>)}</ul>
          <div className="mt-auto pt-8"><div className="border-t border-[var(--rule)] pt-5"><p className="text-xs leading-5 text-[var(--faint)]">Each area remains clearly marked as planned until its working data model and user flows are implemented.</p></div></div>
        </aside>
      </section>
    </div>
  );
}
