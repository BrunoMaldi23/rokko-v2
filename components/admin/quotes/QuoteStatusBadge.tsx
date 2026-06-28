"use client";

import { statusConfig } from "./quotesUtils";

export default function QuoteStatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] || statusConfig.pendiente;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black ${cfg.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}