"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/context/language-context";

const DISMISS_KEY = "np_pwa_install_dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function PwaInstallPrompt() {
  const { t } = useTranslation();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || isStandalone()) return;
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    setIos(isIos());

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onBip);

    if (isIos()) {
      const timer = window.setTimeout(() => setVisible(true), 2500);
      return () => {
        window.clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", onBip);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
    setDeferred(null);
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    dismiss();
  }

  if (!visible || isStandalone()) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-[900] mx-auto max-w-md rounded-2xl bg-slate-900 p-4 text-white shadow-2xl ring-1 ring-white/10 md:left-auto md:right-6"
      role="dialog"
      aria-label={t("pwa.title")}
    >
      <p className="text-sm font-bold">{t("pwa.title")}</p>
      <p className="mt-1 text-xs text-slate-300">{t("pwa.subtitle")}</p>
      {ios && !deferred ? (
        <p className="mt-2 text-xs text-amber-200">{t("pwa.iosHint")}</p>
      ) : null}
      <div className="mt-3 flex gap-2">
        {deferred ? (
          <button
            type="button"
            onClick={() => void install()}
            className="flex-1 rounded-full bg-brand-600 py-2.5 text-xs font-bold transition hover:bg-brand-700"
          >
            {t("pwa.install")}
          </button>
        ) : null}
        <button
          type="button"
          onClick={dismiss}
          className={`rounded-full border border-white/20 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10 ${
            deferred ? "flex-1" : "w-full"
          }`}
        >
          {t("pwa.dismiss")}
        </button>
      </div>
    </div>
  );
}
