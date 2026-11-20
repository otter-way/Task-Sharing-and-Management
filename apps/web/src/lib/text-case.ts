// Uppercase with the interface language's rules: in Turkish "i" becomes "İ"
// and "ı" becomes "I", which plain `toUpperCase()` gets wrong. The language
// comes from <html lang>, which the i18n provider keeps current.
function interfaceLocale(): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.documentElement.lang || undefined;
}

export function toUpperText(value: string, locale?: string): string {
  return value.toLocaleUpperCase(locale || interfaceLocale());
}

export function capitalizeText(value: string, locale?: string): string {
  const [first = "", ...rest] = Array.from(value);
  return toUpperText(first, locale) + rest.join("");
}
