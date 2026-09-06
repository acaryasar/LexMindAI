"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "@/i18n/provider";
import { Globe, Check, ChevronDown } from "lucide-react";

const LANG_META: Record<string, { flag: string; label: string }> = {
  en: { flag: "🇬🇧", label: "English" },
  tr: { flag: "🇹🇷", label: "Türkçe" },
};

const locales = ["en", "tr"] as const;
type Locale = (typeof locales)[number];

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (newLocale: Locale) => {
    setLocale(newLocale);
    setOpen(false);
    window.location.reload();
  };

  const current = LANG_META[locale] ?? LANG_META.tr;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      >
        <Globe size={13} className="text-slate-400" />
        <span>{current.flag}</span>
        <span>{locale.toUpperCase()}</span>
        <ChevronDown size={11} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl border border-slate-100 bg-white shadow-lg py-1.5 z-50">
          {locales.map((l) => {
            const meta = LANG_META[l];
            const active = l === locale;
            return (
              <button
                key={l}
                onClick={() => handleSelect(l)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                  active
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="text-base">{meta.flag}</span>
                <span className="flex-1 text-left">{meta.label}</span>
                {active && <Check size={13} className="text-indigo-500 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
