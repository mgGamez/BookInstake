"use client";

import Link from "next/link";
import { BookOpenCheck, ChevronDown, Menu, Settings, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { productModules } from "@/lib/modules";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = (
    <nav aria-label="Main navigation" className="flex h-full flex-col px-3 py-5">
      <Link href="/" className="flex items-center gap-2.5 px-2 py-2 text-sm font-bold tracking-[-.03em] text-white" onClick={() => setIsOpen(false)}><BookOpenCheck size={20} strokeWidth={1.6} className="text-[var(--accent)]" aria-hidden="true" />BooksIntake</Link>
      <div className="mt-10"><p className="px-2 text-[11px] font-semibold uppercase tracking-[.12em] text-[var(--faint)]">Workspace</p><div className="mt-3 space-y-1"><Link href="/" onClick={() => setIsOpen(false)} className={`nav-link ${pathname === "/" ? "nav-link-active" : ""}`}>Overview</Link>{productModules.map(({ href, icon: Icon, name }) => <Link key={href} href={href} onClick={() => setIsOpen(false)} className={`nav-link ${pathname === href ? "nav-link-active" : ""}`}><Icon size={16} strokeWidth={1.5} aria-hidden="true" />{name}</Link>)}</div></div>
      <div className="mt-auto space-y-1 border-t border-[var(--rule)] pt-4"><Link href="/team-management" onClick={() => setIsOpen(false)} className="nav-link"><Settings size={16} strokeWidth={1.5} aria-hidden="true" />Workspace settings</Link><button type="button" className="workspace-switcher mt-4 w-full" aria-label="Current workspace: BooksIntake"><span className="grid size-7 place-items-center rounded-lg border border-[rgba(115,215,255,.22)] bg-[rgba(115,215,255,.08)] text-[10px] font-bold text-[var(--accent)]">BI</span><span className="min-w-0 text-left"><span className="block truncate text-[13px] font-semibold text-white">BooksIntake</span><span className="block truncate text-xs text-[var(--faint)]">Foundation workspace</span></span><ChevronDown size={14} className="ml-auto text-[var(--faint)]" aria-hidden="true" /></button></div>
    </nav>
  );

  return <div className="min-h-screen bg-[var(--ground)]"><aside className="fixed inset-y-0 left-0 z-30 hidden w-[244px] border-r border-[var(--border)] bg-[#0b0e13]/95 lg:block">{navigation}</aside><div className="lg:pl-[244px]"><header className="flex h-16 items-center border-b border-[var(--border)] bg-[#0b0e13]/90 px-4 sm:px-7"><button type="button" className="p-2 text-white lg:hidden" onClick={() => setIsOpen(true)} aria-label="Open navigation"><Menu size={20} /></button><div className="hidden flex-1 lg:block"><span className="text-xs font-medium text-[var(--faint)]">Operations</span><span className="mx-2 text-[var(--faint)]">/</span><span className="text-xs font-semibold text-white">Foundation</span></div><div className="ml-auto flex h-full items-center gap-5 border-l border-[var(--border)] pl-5"><span className="status-line">Workspace is staged</span><Link href="/sign-in" className="text-xs font-semibold text-[var(--accent-strong)]">Sign in</Link></div></header><main className="mx-auto w-full max-w-[1380px] px-5 py-9 sm:px-7 lg:px-10 lg:py-12">{children}</main></div>{isOpen && <div className="fixed inset-0 z-50 bg-[#0b0e13] lg:hidden"><button className="absolute right-3 top-3 p-2 text-white" aria-label="Close navigation" onClick={() => setIsOpen(false)}><X size={20} /></button>{navigation}</div>}</div>;
}
