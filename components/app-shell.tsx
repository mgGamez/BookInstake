"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, Menu, Settings, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { productModules } from "@/lib/modules";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const navigation = (
    <nav aria-label="Main navigation" className="flex h-full flex-col">
      <div className="flex h-20 items-center gap-3 px-6">
        <div className="grid size-9 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20"><Sparkles size={18} aria-hidden="true" /></div>
        <span className="text-lg font-semibold tracking-tight text-slate-950">BooksIntake</span>
      </div>
      <div className="px-4 pb-5 pt-2"><Link href="/" onClick={() => setIsOpen(false)} className={`nav-link ${pathname === "/" ? "nav-link-active" : ""}`}><span className="grid size-5 place-items-center rounded-md border border-current text-[10px] font-bold">D</span>Dashboard</Link></div>
      <div className="px-4"><p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Platform</p><div className="space-y-1">{productModules.map(({ href, icon: Icon, name }) => <Link key={href} href={href} onClick={() => setIsOpen(false)} className={`nav-link ${pathname === href ? "nav-link-active" : ""}`}><Icon size={18} aria-hidden="true" /><span>{name}</span></Link>)}</div></div>
      <div className="mt-auto border-t border-slate-200 p-4"><Link href="/team-management" onClick={() => setIsOpen(false)} className="nav-link"><Settings size={18} aria-hidden="true" />Workspace settings</Link><div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3"><div className="grid size-8 place-items-center rounded-full bg-slate-900 text-xs font-semibold text-white">BI</div><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-800">BooksIntake</p><p className="truncate text-xs text-slate-500">Business workspace</p></div><ChevronDown size={15} className="ml-auto text-slate-400" aria-hidden="true" /></div></div>
    </nav>
  );
  return <div className="min-h-screen bg-slate-50"><aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200 bg-white lg:block">{navigation}</aside><div className="lg:pl-72"><header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur lg:px-10"><button type="button" className="rounded-lg p-2 text-slate-600 lg:hidden" onClick={() => setIsOpen(true)} aria-label="Open navigation"><Menu size={21} /></button><div className="hidden text-sm text-slate-500 lg:block">Your intelligent operations workspace</div><div className="ml-auto flex items-center gap-3"><button type="button" className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900" aria-label="Notifications"><Bell size={19} /></button><div className="grid size-9 place-items-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">BI</div></div></header><main className="mx-auto w-full max-w-[1600px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">{children}</main></div>{isOpen && <div className="fixed inset-0 z-50 lg:hidden"><button className="absolute inset-0 bg-slate-900/30" aria-label="Close navigation" onClick={() => setIsOpen(false)} /><aside className="relative h-full w-72 bg-white shadow-2xl"><button type="button" className="absolute right-4 top-6 rounded-lg p-2 text-slate-500" onClick={() => setIsOpen(false)} aria-label="Close navigation"><X size={20} /></button>{navigation}</aside></div>}</div>;
}
