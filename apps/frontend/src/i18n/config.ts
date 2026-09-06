import en from "./messages/en.json";
import tr from "./messages/tr.json";

export const locales = ["en", "tr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "tr";
export const LOCALE_STORAGE_KEY = "LexMind-locale";

export const messages: Record<Locale, typeof en> = {
  en,
  tr,
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getStoredLocale(): Locale {
  if (typeof window === "undefined") {
    return defaultLocale;
  }

  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  return stored && isLocale(stored) ? stored : defaultLocale;
}
