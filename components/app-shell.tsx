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
      <Link href="/" className="flex items-center gap-2 px-2 py-2 text-sm font-semibold text-white" onClick={() => setIsOpen(false)}><BookOpenCheck size={20} strokeWidth={1.5} aria-hidden="true" />BooksIntake</Link>
      <div className="mt-9"><p className="px-2 text-xs text-[#949494]">Workspace</p><div className="mt-3 space-y-1"><Link href="/" onClick={() => setIsOpen(false)} className={`nav-link ${pathname === "/" ? "nav-link-active" : ""}`}>Overview</Link>{productModules.map(({ href, icon: Icon, name }) => <Link key={href} href={href} onClick={() => setIsOpen(false)} className={`nav-link ${pathname === href ? "nav-link-active" : ""}`}><Icon size={16} strokeWidth={1.5} aria-hidden="true" />{name}</Link>)}</div></div>
      <div className="mt-auto space-y-1"><Link href="/team-management" onClick={() => setIsOpen(false)} className="nav-link"><Settings size={16} strokeWidth={1.5} aria-hidden="true" />Workspace settings</Link><button type="button" className="workspace-switcher mt-4 w-full" aria-label="Current workspace: BooksIntake"><span className="grid size-6 place-items-center rounded-full bg-[#2a2a2a] text-[10px] font-semibold text-white">BI</span><span className="min-w-0 text-left"><span className="block truncate text-[13px] font-medium text-white">BooksIntake</span><span className="block truncate text-xs text-[#949494]">Foundation workspace</span></span><ChevronDown size={14} className="ml-auto text-[#949494]" aria-hidden="true" /></button></div>
    </nav>
  );

  return <div className="min-h-screen bg-black"><aside className="fixed inset-y-0 left-0 z-30 hidden w-[228px] border-r border-[#1a1a1a] bg-black lg:block">{navigation}</aside><div className="lg:pl-[228px]"><header className="flex h-16 items-center border-b border-[#1a1a1a] bg-black px-4 sm:px-7"><button type="button" className="p-2 text-white lg:hidden" onClick={() => setIsOpen(true)} aria-label="Open navigation"><Menu size={20} /></button><div className="hidden flex-1 text-sm text-[#b4b4b4] lg:block">Document operations</div><div className="ml-auto flex h-full items-center border-l border-[#1a1a1a] pl-5"><span className="text-[13px] text-[#b4b4b4]">Foundation workspace</span></div></header><main className="mx-auto w-full max-w-[1320px] px-5 py-8 sm:px-7 lg:px-8 lg:py-10">{children}</main></div>{isOpen && <div className="fixed inset-0 z-50 bg-black lg:hidden"><button className="absolute right-3 top-3 p-2 text-white" aria-label="Close navigation" onClick={() => setIsOpen(false)}><X size={20} /></button>{navigation}</div>}</div>;
}
