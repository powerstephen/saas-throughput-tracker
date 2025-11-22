"use client";

import React from "react";
import { BenchmarksState } from "./BenchmarksPanel";

type Props = {
  benchmarks: BenchmarksState;
};

export default function MainDashboard({ benchmarks }: Props) {
  const { currentArr, arrTarget, timeframeWeeks, currency } = benchmarks;

  const arrGap = Math.max(arrTarget - currentArr, 0);
  const weeklyArrNeeded =
    timeframeWeeks > 0 ? Math.round((arrGap / timeframeWeeks) * 100) / 100 : 0;

  const symbol = currencySymbol(currency);

  return (
    <section className="rounded-3xl bg-slate-900/80 p-6 shadow-xl ring-1 ring-slate-800">
      <h2 className="mb-4 text-lg font-semibold">Throughput & ARR Overview</h2>
      <p className="mb-6 text-sm text-slate-300">
        High-level view of where you stand versus target. We can layer in more
        funnel and scenario logic once this base is stable.
      </p>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          label="Current ARR"
          value={`${symbol}${formatNumber(currentArr)}`}
          helper="Baseline at the start of the period."
        />
        <MetricCard
          label="ARR Target"
          value={`${symbol}${formatNumber(arrTarget)}`}
          helper={`${timeframeWeeks} week timeframe`}
        />
        <MetricCard
          label="Gap to Target"
          value={arrGap <= 0 ? "On or above target" : `${symbol}${formatNumber(arrGap)}`}
          helper={arrGap <= 0 ? "You have already reached this target." : "Additional ARR needed."}
        />
        <MetricCard
          label="Required ARR / week"
          value={arrGap <= 0 ? "-" : `${symbol}${formatNumber(weeklyArrNeeded)}`}
          helper={
            arrGap <= 0
              ? "No extra weekly ARR required."
              : "Average incremental ARR needed each week."
          }
        />
      </div>
    </section>
  );
}

type MetricProps = {
  label: string;
  value: string;
  helper?: string;
};

function MetricCard({ label, value, helper }: MetricProps) {
  return (
    <div className="rounded-2xl bg-slate-950/60 p-4 ring-1 ring-slate-800">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-50">{value}</p>
      {helper && <p className="mt-1 text-[11px] text-slate-400">{helper}</p>}
    </div>
  );
}

function currencySymbol(currency: BenchmarksState["currency"]): string {
  switch (currency) {
    case "EUR":
      return "€";
    case "USD":
      return "$";
    case "GBP":
      return "£";
    default:
      return "";
  }
}

function formatNumber(n: number): string {
  return n.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}
