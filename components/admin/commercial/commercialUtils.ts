export type CommercialRules = {
  discount: string;
  wholesaleMin: string;
  vat: string;
  validity: string;
  terms: string;
};

export type CommercialSummaryItem = {
  id: string;
  label: string;
  value: string;
  detail: string;
};

export const defaultRules: CommercialRules = {
  discount: "0",
  wholesaleMin: "15",
  vat: "19",
  validity: "7",
  terms:
    "Valores con IVA incluido. Logo pecho incluido en precio base. Stock sujeto a disponibilidad.",
};

export function buildCommercialSummary(
  rules: CommercialRules,
): CommercialSummaryItem[] {
  return [
    {
      id: "discount",
      label: "Descuento",
      value: `${rules.discount || 0}%`,
      detail: "Aplicado al total de la cotización.",
    },
    {
      id: "wholesale",
      label: "Mayorista desde",
      value: `${rules.wholesaleMin || 0} und.`,
      detail: "Cantidad mínima para precio mayorista.",
    },
    {
      id: "vat",
      label: "IVA",
      value: `${rules.vat || 0}%`,
      detail: "Impuesto visible en condiciones comerciales.",
    },
    {
      id: "validity",
      label: "Validez",
      value: `${rules.validity || 0} días`,
      detail: "Duración de la propuesta comercial.",
    },
  ];
}

export function buildCommercialPreviewLines(rules: CommercialRules) {
  return [
    `Cotización válida por ${rules.validity || 0} días.`,
    `IVA aplicado: ${rules.vat || 0}%.`,
    `Mayorista desde ${rules.wholesaleMin || 0} unidades.`,
    `Descuento global configurado: ${rules.discount || 0}%.`,
  ];
}

export function parseCommercialNumber(value: string) {
  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) return 0;

  return Math.max(0, numberValue);
}