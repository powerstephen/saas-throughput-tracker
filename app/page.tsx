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
  const [showBenchmarks, setShowBenchmarks] =
    useState<boolean>(true);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-xl md:text-2xl font-semibold text-slate-50">
            SaaS Throughput & ARR Lab
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-3xl">
            Input your recent funnel performance and ARR numbers,
            compare them to your benchmarks, and use the output
            as a talking tool to diagnose bottlenecks, understand
            ARR run rate vs target, and outline a clear growth path.
          </p>
        </header>

        {/* Benchmarks toggle + panel */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                Benchmarks
              </h2>
              <p className="text-xs text-slate-400">
                Set or adjust your guardrails for ARR, CAC and
                funnel conversion. You can hide this once you are
                happy with the inputs.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setShowBenchmarks((prev) => !prev)
              }
              className="text-[0.7rem] px-3 py-1.5 rounded-full border border-slate-700 bg-slate-900/70 hover:bg-slate-800 transition-colors"
            >
              {showBenchmarks
                ? "Hide benchmarks"
                : "Show benchmarks"}
            </button>
          </div>

          {showBenchmarks && (
            <BenchmarksPanel
              benchmarks={benchmarks}
              onBenchmarksChange={setBenchmarks}
            />
          )}
        </section>

        {/* Main dashboard (Funnel Performance + results) */}
        <section>
          <MainDashboard
            benchmarks={benchmarks}
            actuals={actuals}
            onActualsChange={setActuals}
          />
        </section>
      </div>
    </main>
  );
}
