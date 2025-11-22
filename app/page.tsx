// app/page.tsx
"use client";

import { useState } from "react";
import BenchmarksPanel, {
  BenchmarksState,
  defaultBenchmarks,
} from "@/components/BenchmarksPanel";
import MainDashboard from "@/components/MainDashboard"; // your existing main section

export default function HomePage() {
  const [benchmarks, setBenchmarks] = useState<BenchmarksState>(
    defaultBenchmarks
  );
  const [showBenchmarks, setShowBenchmarks] = useState(true);
  const [showDashboard, setShowDashboard] = useState(false);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <header className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900">
            <span className="text-3xl">⚡️</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              SaaS Revenue Engine Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Key metrics: throughput, ARR run rate, full-funnel performance &amp;
              forecast intelligence.
            </p>
          </div>
        </header>

        {/* Benchmarks */}
        {showBenchmarks && (
          <BenchmarksPanel
            benchmarks={benchmarks}
            onChange={setBenchmarks}
            onHide={() => setShowBenchmarks(false)}
            onRun={() => setShowDashboard(true)}
          />
        )}

        {/* Main dashboard – hidden until “Run analysis” */}
        {showDashboard && (
          <section className="mt-8">
            <MainDashboard benchmarks={benchmarks} />
          </section>
        )}
      </div>
    </main>
  );
}
