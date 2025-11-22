"use client";

import { useState } from "react";
import {
  Benchmarks,
  BenchmarksPanel,
} from "@/components/BenchmarksPanel";
import MainDashboard, {
  Actuals,
  PeriodPreset,
} from "@/components/MainDashboard";

const defaultBenchmarks: Benchmarks = {
  revenue: {
    currentArr: 1500000,
    arrTarget: 2000000,
    timeframeWeeks: 52,
    blendedCacTarget: 6000,
  },
  marketing: {
    leadToMql: 25,
    mqlToSql: 30,
    sqlToOpp: 40,
  },
  sales: {
    oppToProposal: 55,
    proposalToWin: 25,
  },
  cs: {
    nrr: 115,
    grossMargin: 75,
  },
};

const defaultActuals: Actuals = {
  leads: 1000,
  mqls: 250,
  sqls: 75,
  opps: 30,
  proposals: 15,
  wins: 5,
  newArr: 40000,
  newCustomers: 10,
  periodWeeks: 4,
  preset: "last_month" as PeriodPreset,
  includeCustomerSuccess: true,
};

export default function Page() {
  const [benchmarks, setBenchmarks] =
    useState<Benchmarks>(defaultBenchmarks);
  const [actuals, setActuals] =
    useState<Actuals>(defaultActuals);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <header className="space-y-2">
          <h1 className="text-xl md:text-2xl font-semibold text-slate-50">
            SaaS Throughput & ARR Lab
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-3xl">
            Input your recent funnel performance and ARR numbers,
            then compare them to your benchmarks. Use this as a
            talking tool to diagnose bottlenecks, understand ARR
            run rate vs target, and outline a clear growth path.
          </p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <BenchmarksPanel
              benchmarks={benchmarks}
              onBenchmarksChange={setBenchmarks}
            />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <MainDashboard
              benchmarks={benchmarks}
              actuals={actuals}
              onActualsChange={setActuals}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
