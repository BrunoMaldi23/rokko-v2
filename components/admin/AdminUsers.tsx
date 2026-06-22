"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type AdminUser = {
  id: string;
  email: string;
  role: string;
  name: string;
  created_at: string;
  confirmed_at: string | null;
  last_sign_in_at: string | null;
  banned_until?: string | null;
};

const emptyDraft = {
  id: "",
  email: "",
  name: "",
  role: "admin",
  password: "",
};

const roleMeta: Record<
  string,
  {
    label: string;
    description: string;
    chip: string;
    tile: string;
    icon: string;
  }
> = {
  admin: {
    label: "Administrador",
    description: "Control total del panel, usuarios, catalogo y reglas.",
    chip: "border-sky-200 bg-sky-50 text-sky-700",
    tile: "from-sky-400 to-cyan-500",
    icon: "M12 3l7 4v5c0 4.1-2.8 7.9-7 9-4.2-1.1-7-4.9-7-9V7l7-4z",
  },
  commercial: {
    label: "Comercial",
    description: "Gestiona cotizaciones, clientes y seguimiento.",
    chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
    tile: "from-emerald-400 to-teal-500",
    icon: "M4 19V5m0 14h16M8 15v-4m4 4V8m4 7V6",
  },
  viewer: {
    label: "Solo lectura",
    description: "Puede revisar informacion sin modificar datos.",
    chip: "border-violet-200 bg-violet-50 text-violet-700",
    tile: "from-violet-400 to-fuchsia-500",
    icon: "M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z M12 15a3 3 0 100-6 3 3 0 000 6z",
  },
};

async function authFetch(path: string, init?: RequestInit) {
  const { data } = await supabase!.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Sesion no disponible.");

  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Error inesperado.");
  return json;
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function initials(user: AdminUser) {
  const source = user.name || user.email || "U";
  return source
    .split(/[ @._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function roleFor(role: string) {
  return roleMeta[role] || roleMeta.viewer;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function fetchUsers(): Promise<AdminUser[]> {
    const data = await authFetch("/api/admin/users");
    return data.users || [];
  }

  async function loadUsers() {
    setLoading(true);
    setError("");
    try {
      setUsers(await fetchUsers());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar usuarios.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    fetchUsers()
      .then((data) => {
        if (mounted) setUsers(data);
      })
      .catch((err) => {
        if (mounted) {
          setError(err instanceof Error ? err.message : "No se pudieron cargar usuarios.");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return users;
    return users.filter((user) =>
      `${user.email} ${user.name} ${user.role}`.toLowerCase().includes(q),
    );
  }, [users, search]);

  const activeUsers = users.filter((user) => !user.banned_until).length;
  const adminUsers = users.filter((user) => user.role === "admin").length;
  const commercialUsers = users.filter((user) => user.role === "commercial").length;
  const viewerUsers = users.filter((user) => user.role === "viewer").length;

  function editUser(user: AdminUser) {
    setEditingId(user.id);
    setDraft({
      id: user.id,
      email: user.email,
      name: user.name || "",
      role: user.role || "admin",
      password: "",
    });
    setError("");
  }

  function resetForm() {
    setEditingId(null);
    setDraft(emptyDraft);
    setError("");
  }

  async function saveUser() {
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await authFetch("/api/admin/users", {
          method: "PATCH",
          body: JSON.stringify(draft),
        });
      } else {
        await authFetch("/api/admin/users", {
          method: "POST",
          body: JSON.stringify(draft),
        });
      }
      resetForm();
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el usuario.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteUser(user: AdminUser) {
    if (!confirm(`Eliminar usuario ${user.email}?`)) return;
    setSaving(true);
    setError("");
    try {
      await authFetch(`/api/admin/users?id=${encodeURIComponent(user.id)}`, {
        method: "DELETE",
      });
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar el usuario.");
    } finally {
      setSaving(false);
    }
  }

  const activeRole = roleFor(draft.role);

  return (
    <div className="animate-fade-in space-y-6">
      <section className="overflow-hidden rounded-lg border border-cyan-100 bg-white shadow-[0_22px_70px_rgba(45,52,54,0.08)]">
        <div className="grid gap-6 border-b border-cyan-100 bg-[linear-gradient(135deg,#e4f7fa_0%,#ffffff_52%,#edf7ff_100%)] px-6 py-6 xl:grid-cols-[1fr_420px] xl:items-end">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-sky-500 text-white shadow-[0_16px_34px_rgba(70,185,200,0.28)]">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 4v5c0 4.1-2.8 7.9-7 9-4.2-1.1-7-4.9-7-9V7l7-4z" />
              </svg>
            </div>
            <div>
              <p className="admin-eyebrow">Control de acceso</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-text">
                Usuarios y permisos
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Administra quienes entran al panel, asigna permisos y rota claves sin almacenar contrasenas en la aplicacion.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-4">
            <Metric label="Total" value={users.length} tone="cyan" />
            <Metric label="Activos" value={activeUsers} tone="emerald" />
            <Metric label="Admins" value={adminUsers} tone="sky" />
            <Metric label="Lectura" value={viewerUsers} tone="violet" />
          </div>
        </div>

        <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_310px]">
          <div className="border-b border-cyan-100 p-6 xl:border-b-0 xl:border-r">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-600">
                  {editingId ? "Modo edicion" : "Alta de usuario"}
                </p>
                <h3 className="mt-1 text-xl font-black text-text">
                  {editingId ? "Actualizar acceso existente" : "Crear nuevo acceso"}
                </h3>
              </div>
              {editingId && (
                <button onClick={resetForm} className="rounded-lg border border-border bg-white px-3 py-2 text-xs font-black text-muted transition hover:border-cyan-300 hover:text-cyan-700">
                  Cancelar edicion
                </button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field label="Nombre">
                <input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="Equipo Comercial"
                  className="admin-control bg-white"
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={draft.email}
                  onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                  placeholder="usuario@rokko.cl"
                  className="admin-control bg-white"
                />
              </Field>
              <Field label={editingId ? "Nueva contrasena" : "Contrasena inicial"}>
                <input
                  type="password"
                  value={draft.password}
                  onChange={(e) => setDraft({ ...draft, password: e.target.value })}
                  placeholder={editingId ? "Opcional" : "Minimo 8 caracteres"}
                  className="admin-control bg-white"
                />
              </Field>
              <Field label="Rol">
                <select
                  value={draft.role}
                  onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                  className="admin-control bg-white"
                >
                  <option value="admin">Administrador</option>
                  <option value="commercial">Comercial</option>
                  <option value="viewer">Solo lectura</option>
                </select>
              </Field>
            </div>

            {error && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                {error}
              </div>
            )}
          </div>

          <aside className="bg-surface-2/45 p-6">
            <div className={`rounded-lg bg-gradient-to-br ${activeRole.tile} p-4 text-white shadow-[0_18px_42px_rgba(45,52,54,0.12)]`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/70">
                    Rol seleccionado
                  </p>
                  <p className="mt-2 text-xl font-black">{activeRole.label}</p>
                </div>
                <svg className="h-8 w-8 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={activeRole.icon} />
                </svg>
              </div>
              <p className="mt-4 text-sm font-medium leading-6 text-white/82">
                {activeRole.description}
              </p>
            </div>

            <button
              onClick={saveUser}
              disabled={saving}
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand-dark px-4 text-sm font-black text-white shadow-[0_16px_34px_rgba(45,52,54,0.18)] transition hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                <path strokeLinecap="round" strokeLinejoin="round" d={editingId ? "M5 13l4 4L19 7" : "M12 5v14m7-7H5"} />
              </svg>
              {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear usuario"}
            </button>
          </aside>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-cyan-100 bg-white shadow-[0_18px_60px_rgba(45,52,54,0.07)]">
        <div className="flex flex-col gap-4 border-b border-cyan-100 bg-white px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="admin-eyebrow">Directorio</p>
            <h3 className="mt-1 text-xl font-black text-text">Usuarios del panel</h3>
          </div>
          <div className="relative w-full lg:w-[400px]">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-600/70"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5-5M10 18a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por email, nombre o rol..."
              className="admin-control !pl-10 bg-white"
            />
          </div>
        </div>

        <div className="grid gap-3 border-b border-cyan-100 bg-surface-2/35 px-6 py-4 md:grid-cols-3">
          <RoleSummary role="admin" count={adminUsers} />
          <RoleSummary role="commercial" count={commercialUsers} />
          <RoleSummary role="viewer" count={viewerUsers} />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-soft border-t-accent" />
          </div>
        ) : (
          <div className="grid gap-3 bg-surface-2/30 p-4">
            {filteredUsers.map((user) => {
              const meta = roleFor(user.role);
              return (
                <article
                  key={user.id}
                  className="grid gap-4 rounded-lg border border-border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-[0_16px_42px_rgba(70,185,200,0.12)] lg:grid-cols-[minmax(260px,1.2fr)_170px_130px_130px_120px_150px] lg:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${meta.tile} text-sm font-black text-white shadow-sm`}>
                      {initials(user)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-black text-text">{user.name || "Sin nombre"}</p>
                      <p className="mt-0.5 truncate text-xs font-semibold text-muted">{user.email}</p>
                    </div>
                  </div>

                  <div>
                    <p className="mb-1 text-[10px] font-black uppercase tracking-[0.12em] text-muted lg:hidden">Rol</p>
                    <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black ${meta.chip}`}>
                      {meta.label}
                    </span>
                  </div>

                  <Info label="Creado" value={formatDate(user.created_at)} />
                  <Info label="Ultimo acceso" value={formatDate(user.last_sign_in_at)} />

                  <div>
                    <p className="mb-1 text-[10px] font-black uppercase tracking-[0.12em] text-muted lg:hidden">Estado</p>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black ${
                        user.banned_until
                          ? "border-red-200 bg-red-50 text-red-600"
                          : "border-cyan-200 bg-cyan-50 text-cyan-700"
                      }`}
                    >
                      {user.banned_until ? "Bloqueado" : "Activo"}
                    </span>
                  </div>

                  <div className="flex justify-start gap-2 lg:justify-end">
                    <button
                      onClick={() => editUser(user)}
                      className="rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-black text-cyan-700 transition hover:bg-cyan-100"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deleteUser(user)}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-100"
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              );
            })}

            {filteredUsers.length === 0 && (
              <div className="rounded-lg border border-dashed border-cyan-200 bg-white px-6 py-16 text-center">
                <p className="font-black text-text">No hay usuarios para mostrar.</p>
                <p className="mt-1 text-sm text-muted">Prueba con otra busqueda o crea un acceso nuevo.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "cyan" | "emerald" | "sky" | "violet";
}) {
  const classes = {
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    sky: "border-sky-200 bg-sky-50 text-sky-700",
    violet: "border-violet-200 bg-violet-50 text-violet-700",
  }[tone];

  return (
    <div className={`rounded-lg border px-3 py-3 ${classes}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.12em] opacity-75">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function RoleSummary({ role, count }: { role: string; count: number }) {
  const meta = roleFor(role);
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-white px-4 py-3">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${meta.tile} text-white`}>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d={meta.icon} />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-black text-text">{meta.label}</p>
        <p className="text-xs font-semibold text-muted">{count} usuario{count === 1 ? "" : "s"}</p>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-black uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="text-sm font-black text-text">{value}</p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold tracking-wide text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
