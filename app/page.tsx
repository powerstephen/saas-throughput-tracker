"use client";

import { useState } from "react";
import MainDashboard from "@/components/MainDashboard";
import { BenchmarksPanel, type Benchmarks } from "@/components/BenchmarksPanel";

const defaultBenchmarks: Benchmarks = {
  marketing: {
    leadToMql: 0.25, // 25%
    mqlToSql: 0.4,   // 40%
  },
  sales: {
    sqlToOpp: 0.3,   // 30%
    oppToProp: 0.5,  // 50%
    propToWin: 0.25, // 25%
  },
  cs: {
    monthlyChurnTarget: 0.01, // 1% churn / month
    expansionTarget: 0.15,    // 15% annual expansion
    nrrTarget: 1.20,          // 120% NRR
  },
  revenue: {
    currentArr: 8_500_000, // €8.5m current ARR
    arrTarget: 10_000_000, // €10m target ARR
    timeframeWeeks: 52,    // ~12 months
    blendedCacTarget: 25_000,
  },
};

export default function Page() {
  const [benchmarks, setBenchmarks] = useState<Benchmarks>(defaultBenchmarks);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-xl font-semibold tracking-tight text-slate-50">
            SaaS Throughput & ARR Path Calculator
          </h1>
          <p className="max-w-2xl text-xs text-slate-400">
            Set realistic benchmarks, plug in recent funnel performance, and see your
            ARR run rate, gap to target, and how much impact you get by fixing
            bottlenecks or increasing lead volume.
          </p>
        </header>

        {/* Benchmarks config */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4">
          <BenchmarksPanel
            benchmarks={benchmarks}
            onChange={setBenchmarks}
          />
        </section>

        {/* Main dashboard */}
        <section>
          <MainDashboard benchmarks={benchmarks} />
        </section>
      </div>
    </main>
  );
}
