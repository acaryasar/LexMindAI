"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { NextIntlClientProvider } from "next-intl";

import {
  defaultLocale,
  getStoredLocale,
  isLocale,
  LOCALE_STORAGE_KEY,
  messages,
  type Locale,
} from "./config";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const I18nContext = createContext<I18nContextValue>({
  locale: defaultLocale,
  setLocale: () => {},
});

export function useLocale() {
  return useContext(I18nContext);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const stored = getStoredLocale();
    if (stored !== locale) {
      setLocaleState(stored);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLocale = useCallback((nextLocale: Locale) => {
    if (!isLocale(nextLocale)) return;
    localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    document.cookie = `${LOCALE_STORAGE_KEY}=${nextLocale}; path=/; max-age=31536000`;
    setLocaleState(nextLocale);
  }, []);

  return (
    <I18nContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={messages[locale]} timeZone="Europe/Istanbul">
        {children}
      </NextIntlClientProvider>
    </I18nContext.Provider>
  );
}
