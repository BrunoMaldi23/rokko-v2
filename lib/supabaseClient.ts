import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

const createSupabaseBrowserClient = () =>
  createBrowserClient(supabaseUrl!, supabaseAnonKey!);

type BrowserSupabaseClient = ReturnType<typeof createSupabaseBrowserClient>;

const browserGlobal = globalThis as typeof globalThis & {
  __rokkoSupabaseClient?: BrowserSupabaseClient;
};

export const supabase = hasSupabaseConfig
  ? browserGlobal.__rokkoSupabaseClient ||
    (browserGlobal.__rokkoSupabaseClient = createSupabaseBrowserClient())
  : null;

export function clearSupabaseAuthStorage() {
  if (typeof window === "undefined") return;

  for (let i = window.localStorage.length - 1; i >= 0; i -= 1) {
    const key = window.localStorage.key(i);
    if (key && key.startsWith("sb-") && key.includes("auth-token")) {
      window.localStorage.removeItem(key);
    }
  }

  for (let i = window.sessionStorage.length - 1; i >= 0; i -= 1) {
    const key = window.sessionStorage.key(i);
    if (key && key.startsWith("sb-") && key.includes("auth-token")) {
      window.sessionStorage.removeItem(key);
    }
  }
}
