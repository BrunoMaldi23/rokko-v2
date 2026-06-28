import type { QuoteRecord } from "@/lib/quotes";

export const statusOptions = [
  { value: "todas", label: "Todas" },
  { value: "pendiente", label: "Pendientes" },
  { value: "respondida", label: "Respondidas" },
  { value: "cerrada", label: "Cerradas" },
];

export const statusConfig: Record<
  string,
  {
    label: string;
    className: string;
    dot: string;
  }
> = {
  pendiente: {
    label: "Pendiente",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 [html[data-theme='dark']_&]:border-amber-500/25 [html[data-theme='dark']_&]:bg-amber-500/10 [html[data-theme='dark']_&]:text-amber-300",
    dot: "bg-amber-400",
  },
  enviada: {
    label: "Enviada",
    className:
      "border-blue-200 bg-blue-50 text-blue-700 [html[data-theme='dark']_&]:border-blue-500/25 [html[data-theme='dark']_&]:bg-blue-500/10 [html[data-theme='dark']_&]:text-blue-300",
    dot: "bg-blue-400",
  },
  respondida: {
    label: "Respondida",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 [html[data-theme='dark']_&]:border-emerald-500/25 [html[data-theme='dark']_&]:bg-emerald-500/10 [html[data-theme='dark']_&]:text-emerald-300",
    dot: "bg-emerald-500",
  },
  cerrada: {
    label: "Cerrada",
    className:
      "border-slate-200 bg-slate-50 text-slate-500 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319] [html[data-theme='dark']_&]:text-[#94a3b8]",
    dot: "bg-slate-400",
  },
};

export function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatMoney(value: number) {
  return `$${Number(value || 0).toLocaleString("es-CL")}`;
}

export function getQuoteUnits(quote: QuoteRecord) {
  return quote.items.reduce((sum, item) => sum + item.totalUnits, 0);
}

export function buildQuoteStats(quotes: QuoteRecord[]) {
  const pending = quotes.filter((quote) => quote.status === "pendiente").length;
  const answered = quotes.filter((quote) => quote.status === "respondida").length;
  const closed = quotes.filter((quote) => quote.status === "cerrada").length;
  const revenue = quotes.reduce((sum, quote) => sum + (quote.total || 0), 0);

  return [
    {
      label: "Total",
      value: String(quotes.length),
      detail: "solicitudes",
    },
    {
      label: "Pendientes",
      value: String(pending),
      detail: "requieren acción",
    },
    {
      label: "Respondidas",
      value: String(answered),
      detail: "con seguimiento",
    },
    {
      label: "Cerradas",
      value: String(closed),
      detail: "finalizadas",
    },
    {
      label: "Valor pipeline",
      value: formatMoney(revenue),
      detail: "monto bruto",
      wide: true,
    },
  ];
}

export function getQuotePriority(quote: QuoteRecord) {
  if (quote.status === "cerrada") return "Finalizada";
  if (quote.status === "respondida") return "Seguimiento";
  if ((quote.total || 0) >= 500000) return "Alta";
  if (getQuoteUnits(quote) >= 20) return "Media";

  return "Normal";
}

export function getQuotePriorityClass(priority: string) {
  if (priority === "Alta") {
    return "border-red-200 bg-red-50 text-red-600 [html[data-theme='dark']_&]:border-red-500/25 [html[data-theme='dark']_&]:bg-red-500/10 [html[data-theme='dark']_&]:text-red-300";
  }

  if (priority === "Media") {
    return "border-amber-200 bg-amber-50 text-amber-700 [html[data-theme='dark']_&]:border-amber-500/25 [html[data-theme='dark']_&]:bg-amber-500/10 [html[data-theme='dark']_&]:text-amber-300";
  }

  if (priority === "Seguimiento") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 [html[data-theme='dark']_&]:border-emerald-500/25 [html[data-theme='dark']_&]:bg-emerald-500/10 [html[data-theme='dark']_&]:text-emerald-300";
  }

  if (priority === "Finalizada") {
    return "border-slate-200 bg-slate-50 text-slate-500 [html[data-theme='dark']_&]:border-[#243542] [html[data-theme='dark']_&]:bg-[#0b1319] [html[data-theme='dark']_&]:text-[#94a3b8]";
  }

  return "border-[#bfe8ee] bg-[#e6f8fb] text-[#087381] [html[data-theme='dark']_&]:border-[#00b8c8]/30 [html[data-theme='dark']_&]:bg-[#00b8c8]/10 [html[data-theme='dark']_&]:text-[#00b8c8]";
}