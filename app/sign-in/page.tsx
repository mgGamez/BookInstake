"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true); setMessage("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/` } });
      if (error) throw error;
      setMessage("Check your inbox for a secure sign-in link.");
    } catch { setMessage("Supabase is not configured or the sign-in link could not be sent."); }
    finally { setIsLoading(false); }
  }

  return <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-5"><section className="panel w-full p-6 sm:p-8"><p className="text-sm font-semibold text-[var(--accent)]">BooksIntake</p><h1 className="mt-4 text-2xl font-semibold tracking-[-.04em] text-white">Sign in to your workspace</h1><p className="mt-3 text-sm leading-7 text-[var(--muted)]">We will email you a secure sign-in link. Shared production workspaces require authentication.</p><form onSubmit={submit} className="mt-7"><label htmlFor="email" className="text-sm font-semibold text-white">Work email</label><input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" className="mt-3 h-11 w-full rounded-xl border border-[var(--border)] bg-black/20 px-4 text-sm text-white outline-none placeholder:text-[var(--faint)] focus:border-[var(--accent)]" /><button className="primary-action mt-5 w-full" disabled={isLoading}>{isLoading ? <><LoaderCircle size={16} className="animate-spin" />Sending…</> : <>Email me a sign-in link <ArrowRight size={16} /></>}</button>{message && <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{message}</p>}</form></section></main>;
}
