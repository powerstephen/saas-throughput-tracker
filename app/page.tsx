"use client";

import React, { useState } from "react";
import BenchmarksPanel, { Benchmarks } from "@/components/BenchmarksPanel";
import MainDashboard from "@/components/MainDashboard";

const defaultBenchmarks: Benchmarks = {
  // ARR / timeframe
  targetArr: 10_000_000,
  currentArr: 3_000_000,
  timeframeWeeks: 52,

  // funnel conversion targets
  mqlToSql: 0.35,
  sqlToOpp: 0.35,
  oppToProposal: 0.55,
  proposalToWin: 0.25,

  // commercial benchmarks
  acv: 50_000,
  monthlyChurn: 0.01,
  expansion: 0.2,
  nrr: 1.2,
};

export default function Home() {
  const [benchmarks, setBenchmarks] = useState<Benchmarks>(defaultBenchmarks);
  const [showBenchmarks, setShowBenchmarks] = useState(true);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        <header className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-slate-50">
              SaaS Throughput & ARR Tracker
            </h1>
            <p className="text-sm text-slate-400">
              Set realistic benchmarks, plug in a recent period, and see how the
              funnel performs against your ARR goals.
            </p>
          </div>

          <button
            onClick={() => setShowBenchmarks((prev) => !prev)}
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors
              ${
                showBenchmarks
                  ? "border-slate-700 text-slate-200 hover:border-sky-500"
                  : "border-sky-500 bg-sky-500 text-slate-950 hover:bg-sky-400"
              }`}
          >
            {showBenchmarks ? "Hide Benchmarks" : "Enter Benchmarks"}
          </button>
        </header>

        {/* Benchmarks configuration (toggleable) */}
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
