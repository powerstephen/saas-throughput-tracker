"use client";

import React, { useState } from "react";
import MainDashboard from "@/components/MainDashboard";
import BenchmarksPanel, {
  Benchmarks,
} from "@/components/BenchmarksPanel";

const defaultBenchmarks: Benchmarks = {
  targetArr: 10_000_000,
  timeframeWeeks: 52,
  mqlToSql: 0.35,
  sqlToOpp: 0.35,
  oppToProposal: 0.55,
  proposalToWin: 0.25,
  acv: 50_000,
  monthlyChurn: 0.01,
  expansion: 0.2,
  nrr: 1.2,
};

export default function HomePage() {
  const [benchmarks, setBenchmarks] =
    useState<Benchmarks>(defaultBenchmarks);
  const [showBenchmarks, setShowBenchmarks] =
    useState(true);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* ⚡ Logo – bigger, no border */}
            <div className="flex h-14 w-14 items-center justify-center">
              <span
                className="text-3xl"
                aria-hidden="true"
              >
                ⚡
              </span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-50">
                SaaS Throughput &amp; ARR Tracker
              </h1>
              <p className="text-xs text-slate-400">
                Diagnose the full funnel, model
                scenarios, and align marketing, sales and
                CS with your ARR target.
              </p>
            </div>
          </div>

          {/* Benchmarks toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setShowBenchmarks((s) => !s)
              }
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                showBenchmarks
                  ? "border-sky-500 bg-sky-500/10 text-sky-200"
                  : "border-slate-700 bg-slate-900 text-slate-200 hover:border-sky-500/60 hover:text-sky-200"
              }`}
            >
              {showBenchmarks
                ? "Hide Benchmarks"
                : "Enter Benchmarks"}
            </button>
          </div>
        </header>

        {/* Benchmarks */}
        {showBenchmarks && (
          <BenchmarksPanel
            benchmarks={benchmarks}
            onChange={setBenchmarks}
          />
        )}

        {/* Main dashboard */}
        <MainDashboard benchmarks={benchmarks} />
      </div>
    </main>
  );
}
