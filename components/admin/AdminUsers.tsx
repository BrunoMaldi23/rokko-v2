"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
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

type RoleKey = "all" | "admin" | "commercial" | "viewer";

const emptyDraft = {
  id: "",
  email: "",
  name: "",
  role: "admin",
  password: "",
};

const roleMeta: Record<
  Exclude<RoleKey, "all">,
  {
    label: string;
    short: string;
    description: string;
    icon: ReactNode;
  }
> = {
  admin: {
    label: "Administrador",
    short: "Admin",
    description: "Control total del panel, usuarios, catálogo y reglas.",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3l7 4v5c0 4.1-2.8 7.9-7 9-4.2-1.1-7-4.9-7-9V7l7-4z"
        />
      </svg>
    ),
  },
  commercial: {
    label: "Comercial",
    short: "Comercial",
    description: "Gestiona clientes, cotizaciones y seguimiento comercial.",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 19V5m0 14h16M8 15v-4m4 4V8m4 7V6"
        />
      </svg>
    ),
  },
  viewer: {
    label: "Solo lectura",
    short: "Lectura",
    description: "Puede revisar información sin modificar datos.",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"
        />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
};

async function authFetch(path: string, init?: RequestInit) {
  const { data } = await supabase!.auth.getSession();
  const token = data.session?.access_token;

  if (!token) {
    throw new Error("Sesión no disponible.");
  }

  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || "Error inesperado.");
  }

  return json;
}

function roleFor(role: string) {
  return (
    roleMeta[(role as Exclude<RoleKey, "all">) || "viewer"] || roleMeta.viewer
  );
}

function formatDate(value?: string | null) {
  if (!value) return "Sin registro";

  return new Date(value).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitials(user: Pick<AdminUser, "name" | "email">) {
  const source = user.name || user.email || "U";

  return source
    .split(/[ @._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleKey>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      setError(
        err instanceof Error ? err.message : "No se pudieron cargar usuarios.",
      );
    } finally {
      setLoading(false);
    }
  }

  const resetForm = useCallback(() => {
    setEditingId(null);
    setDraft(emptyDraft);
    setError("");
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    resetForm();
  }, [resetForm]);

  const prepareNewUser = useCallback(() => {
    resetForm();
    setIsModalOpen(true);
  }, [resetForm]);

  useEffect(() => {
    let mounted = true;

    fetchUsers()
      .then((data) => {
        if (mounted) setUsers(data);
      })
      .catch((err) => {
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar usuarios.",
          );
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    function handleSearch(event: Event) {
      const customEvent = event as CustomEvent<{
        query?: string;
        tab?: string;
      }>;

      if (customEvent.detail?.tab && customEvent.detail.tab !== "usuarios") {
        return;
      }

      setSearch(customEvent.detail?.query || "");
    }

    function handleQuickAction(event: Event) {
      const customEvent = event as CustomEvent<{
        tab?: string;
      }>;

      if (customEvent.detail?.tab && customEvent.detail.tab !== "usuarios") {
        return;
      }

      prepareNewUser();
    }

    window.addEventListener("rokko-admin-search", handleSearch);
    window.addEventListener("rokko-admin-quick-action", handleQuickAction);

    return () => {
      window.removeEventListener("rokko-admin-search", handleSearch);
      window.removeEventListener("rokko-admin-quick-action", handleQuickAction);
    };
  }, [prepareNewUser]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeModal();
      }
    }

    if (!isModalOpen) return;

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isModalOpen, closeModal]);

  const metrics = useMemo(() => {
    return {
      total: users.length,
      active: users.filter((user) => !user.banned_until).length,
      admin: users.filter((user) => user.role === "admin").length,
      commercial: users.filter((user) => user.role === "commercial").length,
      viewer: users.filter((user) => user.role === "viewer").length,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase().trim();

    return users.filter((user) => {
      const matchesSearch = q
        ? `${user.email} ${user.name} ${user.role}`.toLowerCase().includes(q)
        : true;

      const matchesRole =
        roleFilter === "all" ? true : user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

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
    setIsModalOpen(true);
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

      closeModal();
      await loadUsers();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar el usuario.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteUser(user: AdminUser) {
    if (!confirm(`¿Eliminar usuario ${user.email}?`)) return;

    setSaving(true);
    setError("");

    try {
      await authFetch(`/api/admin/users?id=${encodeURIComponent(user.id)}`, {
        method: "DELETE",
      });

      await loadUsers();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo eliminar el usuario.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <section className="h-[calc(100vh-150px)] min-h-[620px] overflow-hidden">
        <div className="flex h-full min-h-0 flex-col gap-5">
          <section className="overflow-hidden rounded-[28px] border border-[var(--adm-border-default)] bg-[var(--adm-bg-surface)] shadow-[var(--adm-shadow-panel)]">
            <div className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--adm-teal-500)] text-white shadow-[0_14px_28px_rgba(32,184,199,0.22)]">
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>

                <div className="min-w-0">
                  <p className="admin-eyebrow text-[11px] font-black uppercase tracking-[0.2em]">
                    Control de acceso
                  </p>

                  <h2 className="mt-1 text-[26px] font-black leading-none tracking-[-0.04em] text-[var(--adm-text-heading)]">
                    Gestión de usuarios
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[var(--adm-text-secondary)]">
                    Administra usuarios, roles y permisos del panel corporativo
                    en una vista compacta.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <CompactMetric label="Total" value={metrics.total} />
                <CompactMetric label="Activos" value={metrics.active} />
                <CompactMetric label="Admins" value={metrics.admin} />
                <CompactMetric label="Lectura" value={metrics.viewer} />
              </div>
            </div>
          </section>

          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[28px] border border-[var(--adm-border-default)] bg-[var(--adm-bg-surface)] shadow-[var(--adm-shadow-panel)]">
            <div className="border-b border-[var(--adm-border-default)] bg-[var(--adm-bg-surface)] p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="admin-eyebrow text-[11px] font-black uppercase tracking-[0.18em]">
                    Directorio
                  </p>

                  <h3 className="mt-1 text-[24px] font-black leading-none tracking-[-0.03em] text-[var(--adm-text-heading)]">
                    Usuarios del panel
                  </h3>

                  <p className="mt-2 text-sm font-semibold text-[var(--adm-text-secondary)]">
                    Revisa, filtra y administra accesos del sistema.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={prepareNewUser}
                  className="h-11 rounded-2xl bg-[var(--adm-teal-500)] px-5 text-sm font-black text-white shadow-[0_14px_28px_rgba(32,184,199,0.2)] transition hover:bg-[var(--adm-teal-700)]"
                >
                  + Nuevo usuario
                </button>
              </div>

              <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                  <FilterPill
                    active={roleFilter === "all"}
                    label="Todos"
                    count={metrics.total}
                    onClick={() => setRoleFilter("all")}
                  />

                  <FilterPill
                    active={roleFilter === "admin"}
                    label="Admin"
                    count={metrics.admin}
                    onClick={() => setRoleFilter("admin")}
                  />

                  <FilterPill
                    active={roleFilter === "commercial"}
                    label="Comercial"
                    count={metrics.commercial}
                    onClick={() => setRoleFilter("commercial")}
                  />

                  <FilterPill
                    active={roleFilter === "viewer"}
                    label="Lectura"
                    count={metrics.viewer}
                    onClick={() => setRoleFilter("viewer")}
                  />
                </div>

                <div className="relative w-full lg:max-w-[320px]">
                  <svg
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--adm-teal-500)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar usuario..."
                    className="admin-control h-11 w-full rounded-2xl !pl-10 pr-4 text-sm font-semibold outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--adm-bg-surface-hover)] p-4">
              {loading ? (
                <div className="flex h-full min-h-[240px] items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--adm-bg-badge-visible)] border-t-[var(--adm-teal-500)]" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex h-full min-h-[240px] items-center justify-center rounded-[24px] border border-dashed border-[var(--adm-border-default)] bg-[var(--adm-bg-surface)] p-6 text-center">
                  <div>
                    <p className="text-lg font-black text-[var(--adm-text-heading)]">
                      No hay usuarios para mostrar
                    </p>

                    <p className="mt-2 text-sm font-semibold text-[var(--adm-text-secondary)]">
                      Ajusta la búsqueda o crea un nuevo acceso.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden rounded-[26px] border border-[var(--adm-border-default)] bg-[var(--adm-bg-surface)] shadow-sm">
                  <div className="grid grid-cols-[minmax(260px,1.4fr)_150px_150px_120px_150px] items-center border-b border-[var(--adm-border-default)] bg-[var(--adm-bg-surface-hover)] px-5 py-3">
                    <TableHead>Usuario</TableHead>
                    <TableHead>Creado</TableHead>
                    <TableHead>Último acceso</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead align="right">Acciones</TableHead>
                  </div>

                  <div className="divide-y divide-[var(--adm-border-default)]">
                    {filteredUsers.map((user) => {
                      const meta = roleFor(user.role);

                      return (
                        <article
                          key={user.id}
                          className="grid grid-cols-[minmax(260px,1.4fr)_150px_150px_120px_150px] items-center px-5 py-4 transition hover:bg-[var(--adm-bg-surface-hover)]"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--adm-teal-500)] text-sm font-black text-white shadow-[0_10px_22px_rgba(32,184,199,0.18)]">
                              {getInitials(user)}
                            </div>

                            <div className="min-w-0">
                              <div className="flex min-w-0 items-center gap-2">
                                <p className="truncate text-sm font-black text-[var(--adm-text-primary)]">
                                  {user.name || "Sin nombre"}
                                </p>

                                <span className="shrink-0 rounded-full border border-[var(--adm-teal-500)]/20 bg-[var(--adm-bg-badge-visible)] px-2 py-0.5 text-[10px] font-black text-[var(--adm-text-badge-visible)]">
                                  {meta.short}
                                </span>
                              </div>

                              <p className="mt-1 truncate text-xs font-semibold text-[var(--adm-text-secondary)]">
                                {user.email}
                              </p>
                            </div>
                          </div>

                          <TableCell>{formatDate(user.created_at)}</TableCell>

                          <TableCell>
                            {formatDate(user.last_sign_in_at)}
                          </TableCell>

                          <div>
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black ${
                                user.banned_until
                                  ? "border-[var(--adm-error)]/25 bg-[var(--adm-error-bg)] text-[var(--adm-error-dark)]"
                                  : "border-[var(--adm-teal-500)]/25 bg-[var(--adm-bg-badge-visible)] text-[var(--adm-text-badge-visible)]"
                              }`}
                            >
                              {user.banned_until ? "Bloqueado" : "Activo"}
                            </span>
                          </div>

                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => editUser(user)}
                              className="rounded-xl border border-[var(--adm-teal-500)]/25 bg-[var(--adm-bg-badge-visible)] px-3 py-2 text-xs font-black text-[var(--adm-text-badge-visible)] transition hover:border-[var(--adm-teal-500)]"
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteUser(user)}
                              className="rounded-xl border border-[var(--adm-error)]/25 bg-[var(--adm-error-bg)] px-3 py-2 text-xs font-black text-[var(--adm-error-dark)] transition hover:border-[var(--adm-error)]"
                            >
                              Eliminar
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Cerrar modal"
            onClick={closeModal}
            className="absolute inset-0 cursor-default"
          />

          <section className="relative z-10 w-full max-w-[520px] overflow-hidden rounded-[30px] border border-[var(--adm-border-default)] bg-[var(--adm-bg-surface)] shadow-[0_30px_90px_rgba(0,0,0,0.28)]">
            <div className="border-b border-[var(--adm-border-default)] bg-[linear-gradient(135deg,var(--adm-bg-surface)_0%,var(--adm-bg-surface-hover)_100%)] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="admin-eyebrow text-[11px] font-black uppercase tracking-[0.18em]">
                    {editingId ? "Editar acceso" : "Nuevo acceso"}
                  </p>

                  <h3 className="mt-1 text-[28px] font-black leading-none tracking-[-0.04em] text-[var(--adm-text-heading)]">
                    {editingId ? "Actualizar usuario" : "Crear usuario"}
                  </h3>

                  <p className="mt-2 text-sm font-semibold leading-6 text-[var(--adm-text-secondary)]">
                    Define datos, credenciales y permisos del usuario.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[var(--adm-border-default)] bg-[var(--adm-bg-surface)] text-[var(--adm-text-secondary)] transition hover:border-[var(--adm-teal-300)] hover:text-[var(--adm-teal-500)]"
                  aria-label="Cerrar formulario"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.4}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 6l12 12M18 6 6 18"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="max-h-[calc(100vh-260px)] overflow-y-auto p-6">
              <div className="grid gap-4">
                <Field label="Nombre">
                  <input
                    autoFocus
                    value={draft.name}
                    onChange={(e) =>
                      setDraft({ ...draft, name: e.target.value })
                    }
                    placeholder="Equipo Comercial"
                    className="admin-control h-11 w-full rounded-2xl px-4 text-sm font-semibold outline-none"
                  />
                </Field>

                <Field label="Email">
                  <input
                    type="email"
                    value={draft.email}
                    onChange={(e) =>
                      setDraft({ ...draft, email: e.target.value })
                    }
                    placeholder="usuario@rokko.cl"
                    className="admin-control h-11 w-full rounded-2xl px-4 text-sm font-semibold outline-none"
                  />
                </Field>

                <Field
                  label={editingId ? "Nueva contraseña" : "Contraseña inicial"}
                >
                  <input
                    type="password"
                    value={draft.password}
                    onChange={(e) =>
                      setDraft({ ...draft, password: e.target.value })
                    }
                    placeholder={editingId ? "Opcional" : "Mínimo 8 caracteres"}
                    className="admin-control h-11 w-full rounded-2xl px-4 text-sm font-semibold outline-none"
                  />
                </Field>

                <Field label="Rol">
                  <select
                    value={draft.role}
                    onChange={(e) =>
                      setDraft({ ...draft, role: e.target.value })
                    }
                    className="admin-control h-11 w-full rounded-2xl px-4 text-sm font-semibold outline-none"
                  >
                    <option value="admin">Administrador</option>
                    <option value="commercial">Comercial</option>
                    <option value="viewer">Solo lectura</option>
                  </select>
                </Field>

                {error && (
                  <div className="rounded-2xl border border-[var(--adm-error)]/25 bg-[var(--adm-error-bg)] px-4 py-3 text-sm font-bold text-[var(--adm-error-dark)]">
                    {error}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-[var(--adm-border-default)] bg-[var(--adm-bg-surface-hover)] p-5">
              <button
                type="button"
                onClick={closeModal}
                className="h-11 rounded-2xl border border-[var(--adm-border-default)] bg-[var(--adm-bg-surface)] px-5 text-sm font-black text-[var(--adm-text-secondary)] transition hover:border-[var(--adm-teal-300)] hover:text-[var(--adm-teal-500)]"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={saveUser}
                disabled={saving}
                className="h-11 rounded-2xl bg-[var(--adm-teal-500)] px-6 text-sm font-black text-white shadow-[0_14px_28px_rgba(32,184,199,0.2)] transition hover:bg-[var(--adm-teal-700)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Guardando..."
                  : editingId
                    ? "Guardar cambios"
                    : "Crear usuario"}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function CompactMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-[86px] rounded-2xl border border-[var(--adm-border-default)] bg-[var(--adm-bg-surface-hover)] px-3 py-2.5">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--adm-text-muted)]">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black leading-none text-[var(--adm-teal-500)]">
        {value}
      </p>
    </div>
  );
}

function FilterPill({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-black transition ${
        active
          ? "bg-[var(--adm-teal-500)] text-white"
          : "border border-[var(--adm-border-default)] bg-[var(--adm-bg-surface)] text-[var(--adm-text-secondary)] hover:border-[var(--adm-teal-300)] hover:text-[var(--adm-teal-500)]"
      }`}
    >
      <span>{label}</span>

      <span
        className={`rounded-full px-1.5 py-0.5 text-[10px] ${
          active
            ? "bg-white/20 text-white"
            : "bg-[var(--adm-bg-badge-visible)] text-[var(--adm-text-badge-visible)]"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function TableHead({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?: "left" | "right";
}) {
  return (
    <p
      className={`text-[10px] font-black uppercase tracking-[0.14em] text-[var(--adm-text-muted)] ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </p>
  );
}

function TableCell({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm font-black text-[var(--adm-text-primary)]">
      {children}
    </p>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold tracking-wide text-[var(--adm-text-secondary)]">
        {label}
      </span>

      {children}
    </label>
  );
}