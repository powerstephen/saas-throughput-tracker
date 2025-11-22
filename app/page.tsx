"use client";

import { useState } from "react";
import { BenchmarksPanel, Benchmarks } from "@/components/BenchmarksPanel";
import { ThroughputDashboard } from "@/components/ThroughputDashboard";

const defaultBenchmarks: Benchmarks = {
  marketing: {
    leadsTarget: 2000,
    leadToMql: 25,
    mqlToSql: 40,
    sqlToOpp: 35,
  },
  sales: {
    oppToProposal: 50,
    proposalToWin: 25,
    acvTarget: 50000,
  },
  cs: {
    monthlyChurn: 1,
    expansion: 20,
    nrr: 120,
    grossMargin: 75,
  },
  arr: {
    currentArr: 1500000,
    targetArr: 2500000,
    timeframeWeeks: 52,
    blendedCacTarget: 25000,
    currency: "EUR",
  },
};

export default function Page() {
  const [benchmarks, setBenchmarks] = useState<Benchmarks>(defaultBenchmarks);
  const [showResults, setShowResults] = useState(false);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-6 py-8 flex flex-col gap-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            SaaS Revenue Engine Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Key metrics: throughput, ARR run rate, full-funnel performance and forecast intelligence.
          </p>
        </div>
      </header>

      <BenchmarksPanel
        benchmarks={benchmarks}
        onChange={setBenchmarks}
        onRunAnalysis={() => setShowResults(true)}
      />

      {showResults && <ThroughputDashboard benchmarks={benchmarks} />}
    </main>
  );
}
