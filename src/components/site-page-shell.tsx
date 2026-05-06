import type { ReactNode } from "react";

export type PageHeroTone = "accent" | "dark" | "brand";

const TONE_BG: Record<PageHeroTone, string> = {
  accent: "bg-accent-600",
  dark: "bg-slate-900",
  brand: "bg-brand-600",
};

const TONE_SUB: Record<PageHeroTone, string> = {
  accent: "text-accent-200",
  dark: "text-slate-400",
  brand: "text-brand-100",
};

const MAX_W = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "5xl": "max-w-5xl",
  "7xl": "max-w-7xl",
} as const;

export type PageMaxWidth = keyof typeof MAX_W;

type PageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  tone?: PageHeroTone;
  actions?: ReactNode;
  /** Inner container max-width (default 5xl) */
  containerWidth?: PageMaxWidth;
};

export function PageHero({
  eyebrow,
  title,
  subtitle,
  tone = "accent",
  actions,
  containerWidth = "5xl",
}: PageHeroProps) {
  return (
    <section className={`${TONE_BG[tone]} px-4 py-12 md:py-16`}>
      <div className={`mx-auto ${MAX_W[containerWidth]}`}>
        <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
          {eyebrow}
        </span>
        <h1 className="mt-4 text-3xl font-black text-white md:text-4xl lg:text-5xl">{title}</h1>
        {subtitle ? (
          <p className={`mt-3 max-w-2xl text-base ${TONE_SUB[tone]}`}>{subtitle}</p>
        ) : null}
        {actions ? <div className="mt-6 flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}

type PageBodyProps = {
  children: ReactNode;
  className?: string;
  maxWidth?: PageMaxWidth;
};

export function PageBody({ children, className = "", maxWidth = "5xl" }: PageBodyProps) {
  return (
    <div className={`bg-slate-50 px-4 py-8 md:py-10 ${className}`}>
      <div className={`mx-auto ${MAX_W[maxWidth]}`}>{children}</div>
    </div>
  );
}
