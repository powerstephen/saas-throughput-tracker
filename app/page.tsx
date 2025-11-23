// app/page.tsx
"use client";

import React, { useState } from "react";
import BenchmarksPanel from "@/components/BenchmarksPanel";
import MainDashboard from "@/components/MainDashboard";

// ---- types (local to this file) ----

export interface Benchmarks {
  marketing: {
    leadsPerPeriod: number;
    leadsToMql: number;
    mqlToSql: number;
  };
  sales: {
    sqlToOpp: number;
    oppToProposal: number;
    proposalToWin: number;
  };
  customerSuccess: {
    monthlyChurn: number;
    expansion: number;
    nrr: number;
  };
  revenue: {
    currentArr: number;
    targetArr: number;
    timeframeWeeks: number;
  };
}

export interface Actuals {
  timeframeDays: number; // 30 / 60 / 90
  timeframeLabel: string; // "Last 30 days" etc.
  leads: number;
  mqls: number;
  sqls: number;
  opps: number;
  proposals: number;
  wins: number;
  newArrInPeriod: number;
  includeCustomerSuccess: boolean;
}

// ---- default values ----

const defaultBenchmarks: Benchmarks = {
  marketing: {
    leadsPerPeriod: 2000,
    leadsToMql: 25,
    mqlToSql: 40,
  },
  sales: {
    sqlToOpp: 30,
    oppToProposal: 50,
    proposalToWin: 25,
  },
  customerSuccess: {
    monthlyChurn: 1,
    expansion: 20,
    nrr: 120,
  },
  revenue: {
    currentArr: 8_500_000, // EdgeTier-style baseline
    targetArr: 10_000_000, // Target ARR
    timeframeWeeks: 52, // horizon to hit target
  },
};

const defaultActuals: Actuals = {
  timeframeDays: 90,
  timeframeLabel: "Last 90 days",
  leads: 2000,
  mqls: 500,
  sqls: 200,
  opps: 80,
  proposals: 40,
  wins: 10,
  newArrInPeriod: 500_000,
  includeCustomerSuccess: true,
};

// ---- page component ----

export default function HomePage() {
  const [benchmarks, setBenchmarks] = useState<Benchmarks>(defaultBenchmarks);
  const [actuals, setActuals] = useState<Actuals>(defaultActuals);

  const handleActualsChange = (partial: Partial<Actuals>) => {
    setActuals((prev) => ({ ...prev, ...partial }));
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-8 md:py-10">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-50 md:text-3xl">
              SaaS Revenue Engine Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Throughput, ARR run rate, full-funnel performance and scenario-based
              growth paths.
            </p>
          </div>
        </header>

        {/* Benchmarks on top (hideable inside the component) */}
        <BenchmarksPanel
          benchmarks={benchmarks}
          onChange={setBenchmarks}
        />

        {/* Main dashboard uses benchmarks + period actuals */}
        <MainDashboard
          benchmarks={benchmarks}
          actuals={actuals}
          onActualsChange={handleActualsChange}
        />
      </div>
    </main>
  );
}
