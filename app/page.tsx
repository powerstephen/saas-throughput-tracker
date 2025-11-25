// app/page.tsx
"use client";

import React, { useState } from "react";
import BenchmarksPanel, {
  Benchmarks,
} from "@/components/BenchmarksPanel";
import MainDashboard from "@/components/MainDashboard";

const HomePage: React.FC = () => {
  const [benchmarks, setBenchmarks] = useState<Benchmarks>({
    // ARR block
    currentArr: 4_000_000, // example current ARR
    targetArr: 10_000_000, // example target ARR
    timeframeWeeks: 52,

    // Marketing
    newLeadsPerMonth: 1_500,
    leadsToMql: 0.25,
    mqlToSql: 0.35,

    // Sales
    sqlToOpp: 0.35,
    oppToProposal: 0.55,
    proposalToWin: 0.25,

    // Commercial
    acv: 50_000,
    monthlyChurn: 0.01, // 1% / month
    expansion: 0.2, // 20% / year
    nrr: 1.2, // 120%
  });

  const [showBenchmarks, setShowBenchmarks] =
    useState<boolean>(false);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        {/* Header */}
        <header className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {/* Lightning logo */}
            <div className="flex h-10 w-10 items-center justify-center text-2xl">
              ⚡
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-100">
                SaaS Throughput & ARR Scenario Model
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Diagnose funnel performance, model scenarios,
                and see the impact on ARR against your target.
              </p>
            </div>
          </div>

          {/* Benchmarks toggle button */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() =>
                setShowBenchmarks((prev) => !prev)
              }
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                showBenchmarks
                  ? "border-sky-500 bg-slate-900 text-sky-300"
                  : "border-slate-700 text-slate-300 hover:border-sky-500 hover:text-sky-300"
              }`}
            >
              {showBenchmarks
                ? "Hide Benchmarks"
                : "Enter Benchmarks"}
            </button>
          </div>
        </header>

        {/* Benchmarks panel (optional) */}
        {showBenchmarks && (
          <BenchmarksPanel
            benchmarks={benchmarks}
            onChange={setBenchmarks}
          />
        )}

        {/* Main dashboard: current funnel + hero metrics + scenarios */}
        <MainDashboard benchmarks={benchmarks} />
      </div>
    </main>
  );
};

export default HomePage;
