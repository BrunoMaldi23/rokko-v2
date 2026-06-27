"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clearSupabaseAuthStorage,
  hasSupabaseConfig,
  isInvalidRefreshTokenError,
  supabase,
} from "@/lib/supabaseClient";
import AdminLogin from "@/components/admin/AdminLogin";
import { AdminSidebar, AdminTab } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminCategories from "@/components/admin/AdminCategories";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminCommercial from "@/components/admin/AdminCommercial";
import AdminQuotes from "@/components/admin/AdminQuotes";
import AdminBranding from "@/components/admin/AdminBranding";
import AdminUsers from "@/components/admin/AdminUsers";

type AdminUser = {
  name: string;
  email: string;
};

function getDisplayNameFromSession(session: unknown): AdminUser {
  const safeSession = session as
    | {
        user?: {
          email?: string;
          user_metadata?: {
            name?: string;
            full_name?: string;
            display_name?: string;
          };
        };
      }
    | null
    | undefined;

  const email = safeSession?.user?.email ?? "admin@rokko.cl";

  const metadata = safeSession?.user?.user_metadata;

  const name =
    metadata?.name ||
    metadata?.full_name ||
    metadata?.display_name ||
    email.split("@")[0] ||
    "Administrador";

  return {
    name,
    email,
  };
}

export default function AdminPage() {
  const [isAuth, setIsAuth] = useState(false);
  const [initializing, setInitializing] = useState(() => Boolean(hasSupabaseConfig));
  const [activeTab, setActiveTab] = useState<AdminTab>("resumen");
  const [adminUser, setAdminUser] = useState<AdminUser>({
    name: "Administrador",
    email: "admin@rokko.cl",
  });

  useEffect(() => {
    if (!hasSupabaseConfig) return;

    let cancelled = false;

    supabase!.auth
      .getSession()
      .then((result: { data: { session: unknown } }) => {
        if (cancelled) return;

        const session = result.data.session;

        setIsAuth(!!session);

        if (session) {
          setAdminUser(getDisplayNameFromSession(session));
        }

        setInitializing(false);
      })
      .catch((error: unknown) => {
        if (cancelled) return;

        if (isInvalidRefreshTokenError(error)) {
          clearSupabaseAuthStorage();
          void supabase?.auth.signOut({ scope: "local" }).catch(() => undefined);
        } else {
          console.error("Error inicializando sesión admin:", error);
        }

        setIsAuth(false);
        setInitializing(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogin = useCallback(async () => {
    setIsAuth(true);

    if (!supabase) return;

    const { data } = await supabase.auth.getSession();

    if (data.session) {
      setAdminUser(getDisplayNameFromSession(data.session));
    }
  }, []);

  async function logout() {
    if (!supabase) {
      clearSupabaseAuthStorage();
      setIsAuth(false);
      return;
    }

    await supabase.auth.signOut().catch((error: unknown) => {
      if (!isInvalidRefreshTokenError(error)) throw error;
    });

    clearSupabaseAuthStorage();
    setIsAuth(false);
  }

  function handleQuickAction(tab: AdminTab) {
    switch (tab) {
      case "resumen":
        window.location.reload();
        return;

      case "productos":
      case "categorias":
      case "comercial":
      case "cotizaciones":
      case "branding":
      case "usuarios":
        window.dispatchEvent(
          new CustomEvent("rokko-admin-quick-action", {
            detail: {
              tab,
            },
          }),
        );
        return;

      default:
        return;
    }
  }

  function handleSearch(query: string) {
    window.dispatchEvent(
      new CustomEvent("rokko-admin-search", {
        detail: {
          query,
          tab: activeTab,
        },
      }),
    );
  }

  function renderContent() {
    switch (activeTab) {
      case "resumen":
        return <AdminOverview />;
      case "categorias":
        return <AdminCategories />;
      case "productos":
        return <AdminProducts />;
      case "comercial":
        return <AdminCommercial />;
      case "cotizaciones":
        return <AdminQuotes />;
      case "branding":
        return <AdminBranding />;
      case "usuarios":
        return <AdminUsers />;
      default:
        return <AdminOverview />;
    }
  }

  if (initializing) {
    return (
      <div
        className="admin-shell flex min-h-screen items-center justify-center bg-[var(--adm-bg-page)]"
        data-admin
      >
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#e8fafc] border-t-[#20b8c7]" />
      </div>
    );
  }

  if (!isAuth) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div
      className="admin-root flex min-h-screen bg-[var(--adm-bg-page)]"
      data-admin
    >
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={logout}
      />

      <main className="min-w-0 flex-1 overflow-y-auto bg-[var(--adm-bg-page)]">
        <AdminTopbar
          activeTab={activeTab}
          userName={adminUser.name}
          userEmail={adminUser.email}
          onLogout={logout}
          onQuickAction={() => handleQuickAction(activeTab)}
          onSearch={handleSearch}
        />

        <div className="w-full px-5 py-6 lg:px-8 lg:py-8 xl:px-10">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}