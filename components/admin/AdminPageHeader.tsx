"use client";

import React from "react";

interface AdminPageHeaderProps {
  breadcrumb: string;
  title: string;
  subtitle?: string;
  stats?: Array<{ label: string; value: string | number }>;
}

export function AdminPageHeader({
  breadcrumb,
  title,
  subtitle,
  stats,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-8">
      {/* Breadcrumb */}
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--adm-text-muted)] mb-1">
        {breadcrumb}
      </p>

      {/* Title */}
      <h1 className="text-3xl font-bold text-[var(--adm-text-heading)]">{title}</h1>

      {/* Subtitle */}
      {subtitle && (
        <p className="mt-2 text-sm text-[var(--adm-text-secondary)]">{subtitle}</p>
      )}

      {/* Stats Bar */}
      {stats && stats.length > 0 && (
        <div
          className={`
            mt-6 rounded-[var(--adm-radius-md)] p-6
            bg-gradient-to-r from-[var(--adm-navy-900)] to-[var(--adm-teal-900)]
            dark:bg-[var(--adm-navy-900)]
            grid gap-8
            animate-adm-fade-in
          `}
          style={{
            gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
            animation: "adm-fade-in 300ms ease-out",
          }}
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`
                ${index < stats.length - 1 ? "border-r border-white/15" : ""}
              `}
            >
              <p className="text-xs font-medium uppercase tracking-[0.06em] text-white/55">
                {stat.label}
              </p>
              <p className="mt-1 text-3xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
