"use client";

import { useLanguage } from "@/context/language-context";
import { LOCALES, type Locale } from "@/lib/i18n";

type LanguageSwitcherProps = {
  compact?: boolean;
};

export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      className={`flex items-center rounded-full border border-white/25 bg-white/10 p-0.5 ${
        compact ? "text-[10px]" : "text-xs"
      }`}
      role="group"
      aria-label="Language"
    >
      {LOCALES.map((item) => {
        const active = locale === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setLocale(item.id as Locale)}
            className={`rounded-full px-2.5 py-1 font-bold transition ${
              active
                ? "bg-white text-accent-700 shadow-sm"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
            aria-pressed={active}
          >
            {item.id === "en" ? "EN" : "தமிழ்"}
          </button>
        );
      })}
    </div>
  );
}
