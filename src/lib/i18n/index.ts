import { en, type Messages } from "./en";
import { ta } from "./ta";

export type Locale = "en" | "ta";

export const LOCALES: { id: Locale; label: string }[] = [
  { id: "en", label: "English" },
  { id: "ta", label: "தமிழ்" },
];

const catalogs: Record<Locale, Messages> = { en, ta };

export function getMessages(locale: Locale): Messages {
  return catalogs[locale] ?? en;
}

export function translate(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const parts = key.split(".");
  let cur: unknown = getMessages(locale);
  for (const part of parts) {
    if (cur && typeof cur === "object" && part in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }
  if (typeof cur !== "string") return key;
  if (!vars) return cur;
  return cur.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`));
}

export function categoryLabel(locale: Locale, category: string): string {
  const messages = getMessages(locale);
  const cats = messages.categories as Record<string, string>;
  return cats[category] ?? category;
}

export function statusLabel(locale: Locale, status: string): string {
  const messages = getMessages(locale);
  const statuses = messages.status as Record<string, string>;
  return statuses[status] ?? status;
}
