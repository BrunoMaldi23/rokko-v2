"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase, hasSupabaseConfig } from "@/lib/supabaseClient";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminPage() {
  const [isAuth, setIsAuth] = useState(false);
  const [initializing, setInitializing] = useState(hasSupabaseConfig);

  useEffect(() => {
    if (!hasSupabaseConfig) return;

    let cancelled = false;
    supabase!.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setIsAuth(!!data.session);
      setInitializing(false);
    });

    return () => { cancelled = true; };
  }, []);

  const handleLogin = useCallback(() => setIsAuth(true), []);

  async function logout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setIsAuth(false);
  }

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-500" />
      </div>
    );
  }

  if (!isAuth) return <AdminLogin onLogin={handleLogin} />;

  return <AdminLayout onLogout={logout} />;
}
