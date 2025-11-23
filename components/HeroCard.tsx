import React from "react";

type HeroCardProps = {
  title: string;
  valueLabel: string;
  value: string;
  description: string;
  statusLabel: string;
  statusTone?: "neutral" | "good" | "bad";
};

const toneClasses: Record<
  NonNullable<HeroCardProps["statusTone"]>,
  string
> = {
  neutral: "bg-slateCardSoft text-slate-200",
  good: "bg-emerald-500/10 text-emerald-300",
  bad: "bg-rose-500/10 text-rose-300"
};

export default function HeroCard({
  title,
  valueLabel,
  value,
  description,
  statusLabel,
  statusTone = "neutral"
}: HeroCardProps) {
  return (
    <div className="flex h-full flex-col rounded-2xl bg-slateCard p-4 shadow-lg shadow-black/40">
      <div className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">
        {title}
      </div>
      <div className="text-sm text-slate-300">{valueLabel}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">
        {value}
      </div>
      <div className="mt-2 text-xs text-slate-300">{description}</div>
      <div
        className={`mt-3 inline-flex items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-medium ${toneClasses[statusTone]}`}
      >
        {statusLabel}
      </div>
    </div>
  );
}
