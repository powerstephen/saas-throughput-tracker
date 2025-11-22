"use client";

import { useState } from "react";
import BenchmarksPanel, { Benchmarks } from "@/components/BenchmarksPanel";
import MainDashboard, { Actuals } from "@/components/MainDashboard";

const defaultBenchmarks: Benchmarks = {
  marketing: {
    leadToMql: 25,
    mqlToSql: 35,
    sqlToOpp: 30,
    cac: 5000,
  },
  sales: {
    oppToProposal: 60,
    proposalToWin: 25,
    acv: 20000,
  },
  cs: {
    churn: 10,
    expansion: 20,
    nrr: 110,
    grossMargin: 75,
  },
  revenue: {
    currentArr: 1200000,
    arrTarget: 2000000,
    timeframeWeeks: 52,
  },
};

const defaultActuals: Actuals = {
  leads: 1000,
  mqls: 250,
  sqls: 90,
  opps: 40,
  proposals: 20,
  wins: 5,
  newArr: 100000,
  periodWeeks: 12,
  preset: "last_quarter",
  includeCustomerSuccess: true,
};

export default function Page() {
  const [benchmarks, setBenchmarks] = useState<Benchmarks>(defaultBenchmarks);
  const [actuals, setActuals] = useState<Actuals>(defaultActuals);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            SaaS Throughput & ARR Playbook
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Set your targets, plug in recent funnel performance, and get a
            clear view of current ARR run rate, gap to target, and where the
            funnel is leaking.
          </p>
        </header>

        <BenchmarksPanel
          benchmarks={benchmarks}
          onChange={setBenchmarks}
        />

        <MainDashboard
          benchmarks={benchmarks}
          actuals={actuals}
          onActualsChange={setActuals}
        />
      </div>
    </main>
  );
}
