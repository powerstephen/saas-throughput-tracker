// components/HeroCard.tsx
"use client";

import React from "react";

type StatusTone = "good" | "bad" | "warning" | "neutral";

type HeroCardProps = {
  title: string;
  value: string;
  subtitle: string;
  statusLabel?: string;
  statusTone: StatusTone;
};

const toneStyles: Record<
  StatusTone,
  {
    border: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  good: {
    border: "border-emerald-500/60",
    badgeBg: "bg-emerald-500/15",
    badgeText: "text-emerald-300",
  },
  bad: {
    border: "border-rose-500/60",
    badgeBg: "bg-rose-500/15",
    badgeText: "text-rose-300",
  },
  warning: {
    border: "border-amber-500/60",
    badgeBg: "bg-amber-500/15",
    badgeText: "text-amber-300",
  },
  neutral: {
    border: "border-slate-700",
    badgeBg: "bg-slate-700/40",
    badgeText: "text-slate-200",
  },
};

const HeroCard: React.FC<HeroCardProps> = ({
  title,
  value,
  subtitle,
  statusLabel,
  statusTone,
}) => {
  const tone = toneStyles[statusTone];

  return (
    <div
      className={`flex flex-col justify-between rounded-2xl border bg-slate-900/80 p-4 shadow-lg shadow-slate-950/40 ${tone.border}`}
    >
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-slate-200">
          {title}
        </h3>
        <div className="text-lg font-semibold text-slate-50">
          {value}
        </div>
        <p className="text-xs text-slate-400">
          {subtitle}
        </p>
      </div>

      {statusLabel && (
        <div className="mt-3 flex items-center justify-between">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${tone.badgeBg} ${tone.badgeText}`}
          >
            {statusLabel}
          </span>
        </div>
      )}
    </div>
  );
};

export default HeroCard;
