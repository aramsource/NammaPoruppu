"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "@/context/language-context";

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((ev: { error?: string; message?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: { length: number; [index: number]: { isFinal: boolean; [index: number]: { transcript: string } } };
};

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

async function detectBraveBrowser(): Promise<boolean> {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { brave?: { isBrave?: () => Promise<boolean> } };
  if (!nav.brave?.isBrave) return false;
  try {
    return await nav.brave.isBrave();
  } catch {
    return true;
  }
}

function mapSpeechError(
  code: string | undefined,
  isBrave: boolean,
  t: (key: string) => string,
): string | null {
  if (!code || code === "aborted") return null;
  if (isBrave || code === "network" || code === "service-not-allowed") {
    return isBrave ? t("voice.errorBrave") : t("voice.errorNetwork");
  }
  if (code === "not-allowed" || code === "permission-denied") {
    return t("voice.errorMic");
  }
  if (code === "no-speech") {
    return t("voice.errorNoSpeech");
  }
  return t("voice.error");
}

type Props = {
  onTranscript: (text: string, isFinal: boolean) => void;
  disabled?: boolean;
  /** Larger tap target for quick report flow */
  prominent?: boolean;
};

export function VoiceToTextButton({ onTranscript, disabled, prominent }: Props) {
  const { t, locale } = useTranslation();
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const [isBrave, setIsBrave] = useState(false);
  const [checked, setChecked] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const stoppingRef = useRef(false);
  const hasCtor = typeof window !== "undefined" && Boolean(getSpeechRecognitionCtor());

  useEffect(() => {
    let cancelled = false;
    void detectBraveBrowser().then((brave) => {
      if (!cancelled) {
        setIsBrave(brave);
        setChecked(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const stop = useCallback(() => {
    stoppingRef.current = true;
    const rec = recognitionRef.current;
    recognitionRef.current = null;
    if (rec) {
      try {
        rec.abort();
      } catch {
        try {
          rec.stop();
        } catch {
          /* ignore */
        }
      }
    }
    setListening(false);
    window.setTimeout(() => {
      stoppingRef.current = false;
    }, 100);
  }, []);

  useEffect(() => () => stop(), [stop]);

  async function start() {
    setError("");
    if (isBrave) {
      setError(t("voice.errorBrave"));
      return;
    }

    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setError(t("voice.unsupported"));
      return;
    }

    // Warm up mic permission so failures surface as not-allowed, not opaque network errors.
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
    } catch {
      setError(t("voice.errorMic"));
      return;
    }

    const recognition = new Ctor();
    recognition.lang = locale === "ta" ? "ta-IN" : "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript ?? "";
        if (result.isFinal) final += transcript;
        else interim += transcript;
      }
      if (final) onTranscript(final.trim(), true);
      else if (interim) onTranscript(interim.trim(), false);
    };

    recognition.onerror = (ev) => {
      if (stoppingRef.current) return;
      const msg = mapSpeechError(ev.error, isBrave, t);
      if (msg) setError(msg);
      stop();
    };

    recognition.onend = () => {
      setListening(false);
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setListening(true);
    } catch {
      setError(t("voice.error"));
    }
  }

  if (!hasCtor) {
    return <p className="text-[11px] text-slate-400">{t("voice.unsupported")}</p>;
  }

  if (!checked) {
    return <p className="text-[11px] text-slate-400">{t("common.loading")}</p>;
  }

  if (isBrave) {
    return (
      <p className="max-w-xs text-[11px] leading-relaxed text-amber-800">{t("voice.errorBrave")}</p>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => (listening ? stop() : void start())}
          className={`inline-flex items-center gap-2 rounded-full font-bold transition disabled:opacity-40 ${
            prominent ? "px-4 py-2.5 text-xs shadow-sm" : "px-3 py-1.5 text-[11px]"
          } ${
            listening
              ? "bg-red-100 text-red-800 ring-1 ring-red-200"
              : prominent
                ? "bg-brand-600 text-white hover:bg-brand-700"
                : "bg-slate-100 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200"
          }`}
        >
          <span
            className={`rounded-full ${listening ? "animate-pulse bg-red-500" : prominent ? "bg-white/90" : "bg-brand-500"} ${
              prominent ? "h-2.5 w-2.5" : "h-2 w-2"
            }`}
          />
          {listening ? t("voice.stop") : t("voice.start")}
        </button>
        {listening ? (
          <span className="text-[11px] font-medium text-brand-700">{t("voice.listening")}</span>
        ) : null}
      </div>
      {error && !listening ? (
        <p className="max-w-xs text-right text-[11px] leading-relaxed text-brand-600">{error}</p>
      ) : null}
    </div>
  );
}
