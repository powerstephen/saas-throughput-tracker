"use client";

import { useState } from "react";
import MainDashboard from "@/components/MainDashboard";
import BenchmarksPanel, { Benchmarks } from "@/components/BenchmarksPanel";

export default function HomePage() {
  const [showBenchmarks, setShowBenchmarks] = useState(true);

  // SINGLE source of truth for all benchmark defaults
  const [benchmarks, setBenchmarks] = useState<Benchmarks>({
    // ARR target
    targetArr: 10_000_000,
    timeframeWeeks: 52,

    // Funnel conversion targets (decimals: 0.35 = 35%)
    mqlToSql: 0.35,
    sqlToOpp: 0.35,
    oppToProposal: 0.55,
    proposalToWin: 0.25,

    // Commercial benchmarks
    acv: 50_000,          // €
    monthlyChurn: 0.01,   // 1% / month
    expansion: 0.2,       // 20% / year
    nrr: 1.2,             // 120% NRR
  });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Page header */}
        <header className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              SaaS Throughput &amp; ARR Tracker
            </h1>
            <p className="mt-1 text-sm text-slate-400 max-w-2xl">
              Set realistic benchmarks, plug in a recent period, and see your
              throughput, run rate, and path to the ARR target.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowBenchmarks((prev) => !prev)}
            className="mt-3 inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-4 py-1.5 text-xs font-medium text-slate-200 shadow-sm transition hover:border-slate-500 hover:bg-slate-800 md:mt-0"
          >
            {showBenchmarks ? "Hide benchmarks" : "Show benchmarks"}
          </button>
        </header>

        {/* Benchmarks panel */}
        {showBenchmarks && (
          <BenchmarksPanel
            benchmarks={benchmarks}
            onChange={setBenchmarks}
          />
        )}

        {/* Main dashboard: current-period inputs, hero metrics, scenarios */}
        <MainDashboard benchmarks={benchmarks} />
      </div>
    </main>
  );
}
