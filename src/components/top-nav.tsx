"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCity } from "@/context/city-context";
import { useAuth } from "@/context/auth-context";
import { useTranslation } from "@/context/language-context";
import { LanguageSwitcher } from "@/components/language-switcher";
import { CITIES, City } from "@/lib/cities";

const GITHUB_URL = "https://github.com/aramsource/NammaPoruppu";

function CityPicker() {
  const { city, setCity, locationState, detectLocation } = useCity();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSelect = (c: City) => {
    if (!c.active) return;
    setCity(c);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/25"
      >
        <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.757.433 5.737 5.737 0 00.282.14l.018.008.006.003zM10 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" clipRule="evenodd" />
        </svg>
        {city.name}
        <svg className={`h-3 w-3 text-white/70 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-[2000] w-[min(16rem,calc(100vw-1rem))] overflow-hidden rounded-2xl bg-white ring-2 ring-slate-200">
          {/* Header */}
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-xs font-bold text-slate-900">{t("city.pickerTitle")}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{t("city.pickerSubtitle")}</p>
          </div>

          {/* Detect location */}
          <button
            type="button"
            onClick={() => { detectLocation(); setOpen(false); }}
            disabled={locationState === "detecting"}
            className="flex w-full items-center gap-2.5 border-b border-slate-100 px-4 py-3 text-left text-xs font-semibold text-brand-600 transition hover:bg-brand-50 disabled:opacity-50"
          >
            <svg className={`h-4 w-4 shrink-0 ${locationState === "detecting" ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            {locationState === "detecting" ? t("city.detecting") : t("city.detectLocation")}
          </button>

          {/* City list */}
          <ul className="py-1">
            {CITIES.map((c) => {
              const isSelected = city.id === c.id;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(c)}
                    disabled={!c.active}
                    className={`flex w-full items-center justify-between px-4 py-2.5 text-left transition ${
                      !c.active
                        ? "cursor-not-allowed opacity-40"
                        : isSelected
                        ? "bg-brand-50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${isSelected ? "bg-brand-500" : "bg-slate-200"}`} />
                      <span>
                        <span className={`block text-sm font-semibold ${isSelected ? "text-brand-700" : "text-slate-800"}`}>
                          {c.name}
                        </span>
                      </span>
                    </span>
                    {!c.active && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                        {t("city.soon")}
                      </span>
                    )}
                    {isSelected && (
                      <svg className="h-4 w-4 text-brand-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export function TopNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, loading, signOut } = useAuth();
  const { t } = useTranslation();

  const navItems = [
    { href: "/report-issue", label: t("nav.reportIssue"), primary: true },
    { href: "/explore-map", label: t("nav.exploreMap"), primary: false },
    { href: "/my-reports", label: t("nav.myReports"), primary: false },
  ];

  return (
    <>
      <header className="sticky top-0 z-[1000] border-b border-white/15 bg-accent-600">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-4 py-3 min-w-0">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <Image
              src="/logo/navLogo.png"
              alt="NammaPoruppu logo"
              width={36}
              height={36}
              className="h-9 w-9 rounded-md object-cover"
            />
            <span className="hidden text-base font-bold tracking-tight text-white md:inline">NammaPoruppu</span>
          </Link>

          {/* Desktop: city picker + nav links - all on the right */}
          <div className="hidden items-center gap-2 md:flex">
            <LanguageSwitcher />
            <CityPicker />
            <div className="mx-1 h-5 w-px bg-white/25" />
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold transition-all whitespace-nowrap ${
                    item.primary
                      ? "bg-brand-600 text-white hover:bg-brand-700"
                      : active
                      ? "bg-white/20 text-white"
                      : "text-white/90 hover:bg-white/15 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold text-white/65 transition hover:text-white/90"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.426 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.866-.014-1.7-2.782.605-3.369-1.344-3.369-1.344-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.607.069-.607 1.004.071 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.202 2.398.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.579.688.481A10.02 10.02 0 0 0 22 12.017C22 6.484 17.523 2 12 2Z" />
              </svg>
              {t("nav.github")}
            </a>
            {!loading && user ? (
              <button
                type="button"
                onClick={() => void signOut()}
                className="rounded-full border border-white/35 bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/20"
              >
                {t("nav.signOut")}
              </button>
            ) : (
              <Link
                href="/auth"
                className="rounded-full border border-white/35 bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/20"
              >
                {t("nav.signIn")}
              </Link>
            )}
          </div>

          {/* Mobile: city pill + hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher compact />
            <CityPicker />
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white transition hover:bg-white/15"
              aria-label={t("nav.toggleMenu")}
            >
              {open ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile slide-down menu */}
        {open && (
          <div className="border-t border-slate-200 bg-white px-4 pb-4 md:hidden overflow-hidden">
            <ul className="mt-2 space-y-1">
              {navItems.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <li key={item.href}>
                      <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex w-full items-center rounded-xl px-4 py-3 text-sm font-bold transition ${
                        item.primary
                          ? "bg-brand-600 text-white hover:bg-brand-700"
                          : active
                          ? "bg-accent-50 text-accent-700"
                          : "text-slate-800 hover:bg-slate-100"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
              <li className="pt-1">
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  {t("nav.github")}
                </a>
              </li>
              <li className="pt-1">
                {!loading && user ? (
                  <button
                    type="button"
                    onClick={() => { void signOut(); setOpen(false); }}
                    className="flex w-full items-center rounded-xl px-4 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-100"
                  >
                    {t("nav.signOut")}
                  </button>
                ) : (
                  <Link
                    href="/auth"
                    onClick={() => setOpen(false)}
                    className="flex w-full items-center rounded-xl px-4 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-100"
                  >
                    {t("nav.signIn")}
                  </Link>
                )}
              </li>
            </ul>
          </div>
        )}
      </header>
    </>
  );
}
