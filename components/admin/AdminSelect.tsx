"use client";

import React from "react";

interface AdminSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: Array<{ value: string; label: string }>;
}

export const AdminSelect = React.forwardRef<HTMLSelectElement, AdminSelectProps>(
  ({ label, error, hint, options, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-xs font-medium text-[var(--adm-text-muted)]">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`
              w-full rounded-[var(--adm-radius-sm)] border px-3 py-2
              bg-[var(--adm-bg-surface)] text-[var(--adm-text-primary)]
              text-sm font-normal appearance-none
              border-[var(--adm-border)]
              transition-all duration-150
              focus:outline-none focus:border-[var(--adm-teal-500)]
              focus:ring-4 focus:ring-[rgba(31,168,140,0.15)]
              disabled:bg-[var(--adm-neutral-50)] disabled:text-[var(--adm-text-muted)]
              disabled:cursor-not-allowed
              pr-8
              ${error ? "border-[var(--adm-error)] focus:ring-[rgba(224,53,53,0.15)]" : ""}
              ${className}
            `}
            {...props}
          >
            <option value="">Selecciona una opción</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--adm-neutral-500)]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        {error && <p className="mt-1 text-xs text-[var(--adm-error)]">{error}</p>}
        {hint && <p className="mt-1 text-xs text-[var(--adm-text-muted)]">{hint}</p>}
      </div>
    );
  }
);

AdminSelect.displayName = "AdminSelect";
