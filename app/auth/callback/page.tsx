"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Finishing your secure sign-in…");

  useEffect(() => {
    let active = true;
    async function completeSignIn() {
      try {
        const supabase = createSupabaseBrowserClient();
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const tokenHash = url.searchParams.get("token_hash");
        const type = url.searchParams.get("type");
        const fragment = new URLSearchParams(url.hash.slice(1));
        let error: Error | null = null;

        if (code) ({ error } = await supabase.auth.exchangeCodeForSession(code));
        else if (tokenHash && type) ({ error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as "magiclink" }));
        else if (fragment.get("access_token") && fragment.get("refresh_token")) ({ error } = await supabase.auth.setSession({ access_token: fragment.get("access_token")!, refresh_token: fragment.get("refresh_token")! }));
        else error = new Error("This sign-in link is missing its authentication token.");

        if (error) throw error;
        if (active) router.replace("/");
      } catch (caught) {
        if (active) setMessage(caught instanceof Error ? caught.message : "This sign-in link could not be verified.");
      }
    }
    void completeSignIn();
    return () => { active = false; };
  }, [router]);

  return <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-5"><section className="panel w-full p-6 sm:p-8"><LoaderCircle size={22} className="animate-spin text-[var(--accent)]" /><h1 className="mt-5 text-2xl font-semibold tracking-[-.04em] text-white">Signing you in</h1><p className="mt-3 text-sm leading-7 text-[var(--muted)]">{message}</p></section></main>;
}
