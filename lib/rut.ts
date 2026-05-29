export function formatRut(value: string): string {
  const clean = value.replace(/[^0-9kK]/g, "").toUpperCase();

  if (!clean) return "";

  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);

  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return dv ? `${formattedBody}-${dv}` : formattedBody;
}

export function unformatRut(value: string): string {
  return value.replace(/[^0-9kK]/g, "").toUpperCase();
}
