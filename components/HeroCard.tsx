"use client";

import React from "react";
import clsx from "clsx";

type HeroCardProps = {
  title: string;
  value: string;
  description: string;
  statusText: string;
  tone?: "good" | "warn" | "bad" | "neutral";
};

export default function HeroCard({
  title,
  value,
  description,
  statusText,
  tone = "neutral",
}: HeroCardProps) {
  const toneClasses = {
    good: "border-emerald-600/60 bg-emerald-950/40 text-emerald-100",
    warn: "border-amber-600/60 bg-amber-950/40 text-amber-100",
    bad: "border-rose-600/60 bg-rose-950/40 text-rose-100",
    neutral: "border-slate-700/80 bg-slate-900/70 text-slate-100",
  }[tone];

  const pillClasses = {
    good: "border-emerald-500/70 bg-emerald-900/70 text-emerald-100",
    warn: "border-amber-400/80 bg-amber-900/80 text-amber-50",
    bad: "border-rose-500/80 bg-rose-950/80 text-rose-100",
    neutral: "border-slate-600/70 bg-slate-800/80 text-slate-100",
  }[tone];

  return (
    <div
      className={clsx(
        "flex h-full flex-col justify-between rounded-2xl px-5 py-5 shadow-sm",
        "border bg-gradient-to-b from-slate-950/80 to-slate-900/80",
        toneClasses
      )}
    >
      {/* Title */}
      <h3 className="h-6 text-sm font-medium tracking-tight text-slate-100">
        {title}
      </h3>

      {/* Number (aligned across all cards) */}
      <div className="flex h-9 items-end text-2xl font-semibold tabular-nums text-slate-50">
        {value}
      </div>

      {/* Description */}
      <p className="h-10 text-xs leading-snug text-slate-300">
        {description}
      </p>

      {/* Status pill */}
      <div className="mt-3 h-6">
        <span
          className={clsx(
            "inline-flex h-6 items-center rounded-full border px-3 text-[11px] font-medium",
            "shadow-sm backdrop-blur",
            pillClasses
          )}
        >
          {statusText}
        </span>
      </div>
    </div>
  );
}
