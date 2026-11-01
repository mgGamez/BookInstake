"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [state, setState] = useState<"loading" | "retry">("loading");

  useEffect(() => {
    let active = true;
    async function completeSignIn() {
      try {
        const supabase = createSupabaseBrowserClient();
        const existing = await supabase.auth.getSession();
        if (existing.data.session) { router.replace("/"); return; }

        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const tokenHash = url.searchParams.get("token_hash");
        const type = url.searchParams.get("type");
        const fragment = new URLSearchParams(url.hash.slice(1));
        let success = false;

        if (fragment.get("access_token") && fragment.get("refresh_token")) {
          const { error } = await supabase.auth.setSession({ access_token: fragment.get("access_token")!, refresh_token: fragment.get("refresh_token")! });
          success = !error;
        } else if (tokenHash && type) {
          const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as "magiclink" });
          success = !error;
        } else if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          success = !error;
        }

        if (success) { router.replace("/"); return; }
        if (active) setState("retry");
      } catch { if (active) setState("retry"); }
    }
    void completeSignIn();
    return () => { active = false; };
  }, [router]);

  if (state === "retry") return <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-5"><section className="panel w-full p-6 sm:p-8"><CheckCircle2 size={22} className="text-[var(--accent)]" /><h1 className="mt-5 text-2xl font-semibold tracking-[-.04em] text-white">Request a fresh sign-in link</h1><p className="mt-3 text-sm leading-7 text-[var(--muted)]">This one-time link could not be completed in this browser. Request a new link and open it once in the browser where you want to use BookInstake.</p><Link href="/sign-in" className="primary-action mt-7">Return to sign in</Link></section></main>;

  return <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-5"><section className="panel w-full p-6 sm:p-8"><LoaderCircle size={22} className="animate-spin text-[var(--accent)]" /><h1 className="mt-5 text-2xl font-semibold tracking-[-.04em] text-white">Signing you in</h1><p className="mt-3 text-sm leading-7 text-[var(--muted)]">Your secure session is being prepared.</p></section></main>;
}
