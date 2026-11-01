import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requestedNext = url.searchParams.get("next");
  const next = requestedNext?.startsWith("/") ? requestedNext : "/";
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  if (!isSupabaseConfigured() || (!code && (!tokenHash || !type))) return NextResponse.redirect(new URL("/sign-in?error=auth", url.origin));
  const supabase = await createSupabaseServerClient();
  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({ token_hash: tokenHash!, type: type as EmailOtpType });
  return NextResponse.redirect(new URL(error ? "/sign-in?error=auth" : next, url.origin));
}
