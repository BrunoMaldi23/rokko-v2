export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (!digits || digits === "9" || digits === "569") return "+56 9";

  const withCode = digits.startsWith("56") ? digits : `56${digits}`;
  const limited = withCode.slice(0, 11);

  if (limited.length <= 3) return `+${limited}`;

  const rest = limited.slice(2);

  if (rest.startsWith("9")) {
    return `+569 ${rest.slice(1, 9)}`;
  }

  return `+56 ${rest}`;
}
