// app/page.tsx
"use client";

import React, { useState } from "react";
import MainDashboard from "@/components/MainDashboard";
import BenchmarksPanel, {
  Benchmarks,
} from "@/components/BenchmarksPanel";

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

    // Customer Success
    acv: 50_000,
    nrr: 1.2, // 120%
  });

  const [showBenchmarks, setShowBenchmarks] = useState(true);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        {/* Header with lightning icon + Benchmarks toggle */}
        <header className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Bigger lightning icon, no background */}
            <span className="text-3xl">⚡</span>
            <div>
              <h1 className="text-xl font-semibold">
                SaaS Throughput & ARR Planner
              </h1>
              <p className="text-xs text-slate-400">
                Model funnel velocity, ARR trajectory, and high-impact scenarios in one view.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowBenchmarks((v) => !v)}
            className={`mt-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              showBenchmarks
                ? "border-sky-500 bg-sky-500/10 text-sky-300"
                : "border-slate-700 bg-slate-900 text-slate-200 hover:border-sky-500 hover:text-sky-300"
            }`}
          >
            {showBenchmarks ? "Hide Benchmarks" : "Enter Benchmarks"}
          </button>
        </header>

        {/* Benchmarks panel – only shows as a box when open */}
        {showBenchmarks && (
          <section className="rounded-2xl border border-sky-500/40 bg-slate-950/90 px-4 py-4">
            <BenchmarksPanel
              benchmarks={benchmarks}
              onChange={setBenchmarks}
            />
          </section>
        )}

        {/* Main dashboard */}
        <MainDashboard benchmarks={benchmarks} />
      </div>
    </main>
  );
};

export default HomePage;
