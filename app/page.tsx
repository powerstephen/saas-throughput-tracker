// app/page.tsx
"use client";

import { useState } from "react";
import {
  Benchmarks,
  BenchmarksPanel,
} from "@/components/BenchmarksPanel";
import MainDashboard from "@/components/MainDashboard";

const defaultBenchmarks: Benchmarks = {
  // ARR target + timeframe
  targetArr: 10_000_000,
  timeframeWeeks: 52,

  // Funnel conversion targets
  mqlToSql: 0.35,
  sqlToOpp: 0.35,
  oppToProposal: 0.55,
  proposalToWin: 0.25,

  // Commercial targets
  acvTarget: 50_000,
  churnTarget: 0.01,
  expansionTarget: 0.2,
  nrrTarget: 1.2,

  includeCustomerSuccess: true,
};

export default function Page() {
  const [benchmarks, setBenchmarks] =
    useState<Benchmarks>(defaultBenchmarks);
  const [showBenchmarks, setShowBenchmarks] = useState(true);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              SaaS Throughput & ARR Tracker
            </h1>
            <p className="text-sm text-slate-400">
              Set realistic benchmarks, plug in a recent period, and see your
              path to the ARR target.
            </p>
          </div>
          <button
            onClick={() => setShowBenchmarks((v) => !v)}
            className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 transition-colors hover:border-slate-500 hover:bg-slate-800"
          >
            {showBenchmarks ? "Hide benchmarks" : "Show benchmarks"}
          </button>
        </header>

        {/* Benchmarks config */}
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
