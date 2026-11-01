import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/lib/supabase/config";

export function createSupabaseBrowserClient() {
  const { url, key } = getSupabaseConfig();
  return createBrowserClient(url, key, { auth: { flowType: "implicit", detectSessionInUrl: true, persistSession: true } });
}
