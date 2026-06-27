"use client";

import React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  loading?: boolean;
  children?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-[var(--adm-btn-primary-bg)] text-[var(--adm-btn-primary-text)]
    hover:bg-[var(--adm-btn-primary-hover)]
    focus:outline-none focus:ring-4 focus:ring-[rgba(45,95,160,0.25)]
  `,
  secondary: `
    bg-[var(--adm-bg-surface)] text-[var(--adm-text-primary)] border border-[var(--adm-border)]
    hover:bg-[var(--adm-bg-surface-hover)] hover:border-[var(--adm-border-strong)]
    focus:outline-none focus:ring-4 focus:ring-[rgba(45,95,160,0.25)]
  `,
  ghost: `
    bg-transparent border-none text-[var(--adm-text-secondary)]
    hover:text-[var(--adm-text-primary)] hover:bg-[var(--adm-bg-surface-hover)]
    focus:outline-none focus:ring-4 focus:ring-[rgba(31,168,140,0.25)]
  `,
  danger: `
    bg-[var(--adm-btn-danger-bg)] text-[var(--adm-btn-danger-text)]
    hover:border hover:border-[var(--adm-error)]
    focus:outline-none focus:ring-4 focus:ring-[rgba(224,53,53,0.25)]
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs font-medium",
  md: "px-4 py-2 text-sm font-medium",
};

export function AdminButton({
  variant = "primary",
  size = "md",
  leftIcon,
  loading = false,
  disabled = false,
  children,
  className = "",
  ...props
}: AdminButtonProps) {
  return (
    <button
      disabled={loading || disabled}
      className={`
        inline-flex items-center gap-2 rounded-[var(--adm-radius-sm)]
        transition-all duration-150
        disabled:cursor-not-allowed disabled:opacity-50
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
          <path
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : leftIcon ? (
        leftIcon
      ) : null}
      {children}
    </button>
  );
}
