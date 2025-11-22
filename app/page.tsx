"use client";

import { useState } from "react";
import {
  BenchmarksPanel,
  Benchmarks,
  defaultBenchmarks,
} from "@/components/BenchmarksPanel";
import MainDashboard from "@/components/MainDashboard";

export default function HomePage() {
  const [benchmarks, setBenchmarks] = useState<Benchmarks>(defaultBenchmarks);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              SaaS Revenue Engine Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Key metrics: throughput, ARR run rate, full-funnel performance
              and forecast intelligence.
            </p>
          </div>
        </header>

        {/* Benchmarks can be adjusted or hidden, but results are always visible */}
        <BenchmarksPanel
          benchmarks={benchmarks}
          onChange={setBenchmarks}
        />

        <MainDashboard benchmarks={benchmarks} />
      </div>
    </div>
  );
}
