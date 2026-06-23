type AuthMetadataUser = {
  app_metadata?: Record<string, unknown> | null;
  user_metadata?: Record<string, unknown> | null;
};

export const ADMIN_ROLE = "admin";
export const ADMIN_PERMISSION_ERROR =
  "Permisos insuficientes. El usuario autenticado debe tener role=admin en Supabase Auth.";

export function readAuthRole(user: AuthMetadataUser) {
  const appRole = user.app_metadata?.role;
  const userRole = user.user_metadata?.role;

  if (typeof appRole === "string" && appRole.trim()) {
    return appRole.trim().toLowerCase();
  }

  if (typeof userRole === "string" && userRole.trim()) {
    return userRole.trim().toLowerCase();
  }

  return "user";
}

export function isAdminUser(user: AuthMetadataUser) {
  return readAuthRole(user) === ADMIN_ROLE;
}
