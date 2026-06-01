"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  id?: string;
  className?: string;
};

export function AnalyticsSearchInput({ value, onChange, placeholder, id, className = "" }: Props) {
  return (
    <div className={`relative ${className}`}>
      <svg
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
        />
      </svg>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
      />
    </div>
  );
}
