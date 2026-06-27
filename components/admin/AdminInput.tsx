"use client";

import React from "react";

interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const AdminInput = React.forwardRef<HTMLInputElement, AdminInputProps>(
  ({ label, error, hint, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-xs font-medium text-[var(--adm-text-muted)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full rounded-[var(--adm-radius-sm)] border px-3 py-2
            bg-[var(--adm-bg-surface)] text-[var(--adm-text-primary)]
            text-sm font-normal
            border-[var(--adm-border)] placeholder-[var(--adm-text-muted)]
            transition-all duration-150
            focus:outline-none focus:border-[var(--adm-teal-500)]
            focus:ring-4 focus:ring-[rgba(31,168,140,0.15)]
            disabled:bg-[var(--adm-neutral-50)] disabled:text-[var(--adm-text-muted)]
            disabled:cursor-not-allowed
            ${error ? "border-[var(--adm-error)] focus:ring-[rgba(224,53,53,0.15)]" : ""}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-[var(--adm-error)]">{error}</p>}
        {hint && <p className="mt-1 text-xs text-[var(--adm-text-muted)]">{hint}</p>}
      </div>
    );
  }
);

AdminInput.displayName = "AdminInput";
