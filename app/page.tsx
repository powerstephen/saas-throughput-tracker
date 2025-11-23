"use client";

import { useState } from "react";
import MainDashboard, {
  Actuals,
  Benchmarks
} from "@/components/MainDashboard";
import BenchmarksPanel from "@/components/BenchmarksPanel";

const defaultBenchmarks: Benchmarks = {
  currentArr: 8500000,
  targetArr: 10000000,
  timeframeWeeks: 52,
  leadToMql: 0.25,
  mqlToSql: 0.35,
  sqlToOpp: 0.35,
  oppToProposal: 0.55,
  proposalToWin: 0.25
};

const defaultActuals: Actuals = {
  timeframeDays: 90,
  leads: 1200,
  mqls: 360,
  sqls: 126,
  opps: 63,
  proposals: 35,
  wins: 9,
  newArr: 790000,
  acv: 87777
};

export default function Page() {
  const [benchmarks, setBenchmarks] = useState<Benchmarks>(defaultBenchmarks);
  const [actuals, setActuals] = useState<Actuals>(defaultActuals);
  const [includeNrr, setIncludeNrr] = useState<boolean>(true);

  return (
    <main className="min-h-screen px-4 py-8 md:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              SaaS Throughput Lab
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-300">
              Diagnose where your SaaS funnel is leaking, see how far you are
              from ARR targets, and model the impact of fixing bottlenecks or
              pulling key growth levers.
            </p>
          </div>
          <div className="rounded-xl bg-slateCard px-4 py-3 text-xs text-slate-300">
            <p className="font-semibold text-slate-100">
              EdgeTier interview edition
            </p>
            <p>
              Use recent period data + target benchmarks to show where
              throughput breaks and how to fix it.
            </p>
          </div>
        </header>

        <BenchmarksPanel
          benchmarks={benchmarks}
          onChange={setBenchmarks}
        />

        <MainDashboard
          benchmarks={benchmarks}
          actuals={actuals}
          onActualsChange={setActuals}
          includeNrr={includeNrr}
          onIncludeNrrChange={setIncludeNrr}
        />
      </div>
    </main>
  );
}
