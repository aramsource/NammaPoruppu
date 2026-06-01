"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "@/context/language-context";
import {
  buildIssueShareMessage,
  buildIssueTweetClipboard,
  buildIssueTweetText,
  buildOfficialWhatsAppMessage,
  buildWhatsAppShareMessage,
  shareHashtagsForCategory,
  sharePhotoUrls,
  whatsAppShareUrl,
  xIntentComposeUrl,
  type IssueShareInput,
} from "@/lib/issue-share";
import { buildWhatsAppUrl, getContactForCategory } from "@/lib/civic-contacts";

type IssueSharePanelProps = {
  shareInput: IssueShareInput;
  imageUrls?: string[];
  onQueueAmplify?: () => void;
  amplifyQueueBusy?: boolean;
  canQueueAmplify?: boolean;
  officialAmplifyMailto?: string;
};

export function IssueSharePanel({
  shareInput,
  imageUrls = [],
  onQueueAmplify,
  amplifyQueueBusy = false,
  canQueueAmplify = false,
  officialAmplifyMailto,
}: IssueSharePanelProps) {
  const { t } = useTranslation();
  const [flash, setFlash] = useState<"link" | "message" | "tweet" | null>(null);

  const photos = useMemo(() => sharePhotoUrls(imageUrls), [imageUrls]);
  const shareInputWithPhotos = useMemo(
    () => ({ ...shareInput, imageUrls: photos }),
    [shareInput, photos],
  );

  const fullMessage = useMemo(() => buildIssueShareMessage(shareInputWithPhotos), [shareInputWithPhotos]);
  const tweetText = useMemo(() => buildIssueTweetText(shareInputWithPhotos), [shareInputWithPhotos]);
  const hashtags = useMemo(
    () => shareHashtagsForCategory(shareInput.category, shareInput.cityName),
    [shareInput.category, shareInput.cityName],
  );
  const xHref = useMemo(
    () => xIntentComposeUrl(tweetText, shareInput.reportUrl, hashtags),
    [tweetText, shareInput.reportUrl, hashtags],
  );
  const whatsAppMessage = useMemo(
    () => buildWhatsAppShareMessage(shareInputWithPhotos),
    [shareInputWithPhotos],
  );
  const waHref = useMemo(() => whatsAppShareUrl(whatsAppMessage), [whatsAppMessage]);

  const officialDept = useMemo(
    () => getContactForCategory(shareInput.category, shareInput.cityId ?? "chennai"),
    [shareInput.category, shareInput.cityId],
  );
  const officialWaHref = useMemo(() => {
    if (!officialDept.whatsapp) return null;
    return buildWhatsAppUrl(
      officialDept.whatsapp,
      buildOfficialWhatsAppMessage(shareInputWithPhotos),
    );
  }, [officialDept.whatsapp, shareInputWithPhotos]);
  const tweetClipboard = useMemo(
    () => buildIssueTweetClipboard(shareInputWithPhotos),
    [shareInputWithPhotos],
  );

  async function copy(kind: "link" | "message" | "tweet", text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setFlash(kind);
      window.setTimeout(() => setFlash((cur) => (cur === kind ? null : cur)), 2000);
    } catch {
      // Fallback: user can select from preview
    }
  }

  async function nativeShare() {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: `${shareInput.category} — NammaPoruppu`,
        text: fullMessage,
        url: shareInput.reportUrl,
      });
    } catch {
      // User cancelled or unsupported
    }
  }

  const hasNativeShare = typeof navigator !== "undefined" && Boolean(navigator.share);

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{t("share.title")}</p>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{t("share.previewLabel")}</p>
        <pre className="mt-2 max-h-52 overflow-y-auto whitespace-pre-wrap break-words font-sans text-xs leading-[1.65] text-slate-700">
          {fullMessage}
        </pre>
      </div>

      {photos.length > 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          <p className="text-xs font-semibold text-slate-800">
            {photos.length === 1 ? t("share.attachPhotoHint") : t("share.attachPhotosHint")}
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {photos.map((url, index) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="group block overflow-hidden rounded-lg ring-1 ring-slate-200 transition hover:ring-accent-400"
              >
                <img
                  src={url}
                  alt=""
                  className="aspect-square w-full object-cover transition group-hover:opacity-90"
                />
                <span className="block bg-slate-50 py-1 text-center text-[10px] font-bold text-accent-700 group-hover:bg-accent-50">
                  {t("share.openPhotoN", { n: index + 1 })}
                </span>
              </a>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => void copy("message", fullMessage)}
          className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200 bg-white py-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <CopyIcon copied={flash === "message"} />
          {flash === "message" ? t("share.copied") : t("share.copyMessage")}
        </button>

        <button
          type="button"
          onClick={() => void copy("tweet", tweetClipboard)}
          className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200 bg-white py-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <CopyIcon copied={flash === "tweet"} />
          {flash === "tweet" ? t("share.copied") : t("share.copyTweet")}
        </button>

        <button
          type="button"
          onClick={() => void copy("link", shareInput.reportUrl)}
          className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200 bg-white py-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <LinkIcon copied={flash === "link"} />
          {flash === "link" ? t("share.copied") : t("share.copyLink")}
        </button>

        {officialWaHref ? (
          <a
            href={officialWaHref}
            target="_blank"
            rel="noreferrer"
            className="col-span-2 flex flex-col items-center gap-1.5 rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white transition hover:bg-emerald-700 sm:col-span-1"
          >
            <WhatsAppIcon />
            {t("share.whatsappOfficial", { name: officialDept.shortName })}
          </a>
        ) : null}

        <a
          href={waHref}
          target="_blank"
          rel="noreferrer"
          className={`flex flex-col items-center gap-1.5 rounded-2xl py-3 text-xs font-semibold transition ${
            officialWaHref
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              : "bg-emerald-500 text-white hover:bg-emerald-600"
          } ${officialWaHref ? "col-span-2 sm:col-span-1" : ""}`}
        >
          <WhatsAppIcon />
          {officialWaHref ? t("share.whatsappAnyone") : "WhatsApp"}
        </a>

        <a
          href={xHref}
          target="_blank"
          rel="noreferrer"
          className="col-span-2 flex flex-col items-center gap-1.5 rounded-2xl bg-slate-900 py-3 text-xs font-semibold text-white transition hover:bg-slate-700 sm:col-span-1"
        >
          <XIcon />
          {t("share.postOnX")}
        </a>

        {hasNativeShare ? (
          <button
            type="button"
            onClick={() => void nativeShare()}
            className="col-span-2 flex flex-col items-center gap-1.5 rounded-2xl border-2 border-accent-200 bg-accent-50 py-3 text-xs font-bold text-accent-800 transition hover:bg-accent-100 sm:col-span-3"
          >
            <ShareIcon />
            {t("share.nativeShare")}
          </button>
        ) : null}
      </div>

      {officialWaHref ? (
        <p className="text-center text-[11px] leading-relaxed text-slate-400">{t("share.whatsappOfficialHint")}</p>
      ) : null}
      <p className="text-center text-[11px] leading-relaxed text-slate-400">{t("share.tweetHint")}</p>

      {onQueueAmplify ? (
        <>
          <button
            type="button"
            disabled={amplifyQueueBusy || !canQueueAmplify}
            onClick={onQueueAmplify}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-accent-200 bg-accent-50 py-3 text-xs font-bold text-accent-800 transition hover:bg-accent-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MailIcon />
            {amplifyQueueBusy ? t("share.queueing") : t("share.queueOfficial")}
          </button>
          {officialAmplifyMailto ? (
            <a
              href={officialAmplifyMailto}
              className="block text-center text-[11px] font-semibold text-accent-700 hover:underline"
            >
              {t("share.emailInstead")}
            </a>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function CopyIcon({ copied }: { copied: boolean }) {
  if (copied) {
    return (
      <svg className="h-5 w-5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
      </svg>
    );
  }
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2m-6 12h8a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z" />
    </svg>
  );
}

function LinkIcon({ copied }: { copied: boolean }) {
  if (copied) {
    return (
      <svg className="h-5 w-5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
      </svg>
    );
  }
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.243.283.543.283.865 0 .322-.103.622-.283.865m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  );
}
