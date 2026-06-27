"use client";

import React from "react";

type BadgeVariant = "visible" | "hidden" | "pending" | "error" | "info" | "active" | "neutral";

interface AdminBadgeProps {
  variant?: BadgeVariant;
  label?: string;
  withDot?: boolean;
  children?: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  visible: "admin-badge-visible",
  hidden: "admin-badge-neutral",
  pending: "admin-badge-pending",
  error: "admin-badge-error",
  info: "admin-badge-info",
  active: "admin-badge-active",
  neutral: "admin-badge-neutral",
};

export function AdminBadge({
  variant = "neutral",
  label,
  withDot = false,
  children,
}: AdminBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${variantStyles[variant]}`}
    >
      {withDot && (
        <span className="admin-status-dot inline-block h-2 w-2 rounded-full bg-[var(--adm-teal-500)]" />
      )}
      {children || label}
    </span>
  );
}
