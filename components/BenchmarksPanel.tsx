// components/BenchmarksPanel.tsx
"use client";

import React from "react";

export interface Benchmarks {
  // ARR / revenue block
  currentArr: number;
  targetArr: number;
  timeframeWeeks: number;

  // Marketing
  newLeadsPerMonth: number;
  leadsToMql: number; // decimal (e.g. 0.25 = 25%)
  mqlToSql: number;   // decimal

  // Sales
  sqlToOpp: number;        // decimal
  oppToProposal: number;   // decimal
  proposalToWin: number;   // decimal

  // Commercial / CS
  acv: number;        // €
  monthlyChurn: number; // decimal (kept in type but hidden in UI)
  expansion: number;    // decimal (kept in type but hidden in UI)
  nrr: number;        // multiple, e.g. 1.2 = 120%
}

interface BenchmarksPanelProps {
  benchmarks: Benchmarks;
  onChange: (next: Benchmarks) => void;
}

const formatNumber = (value: number) =>
  value.toLocaleString("en-IE", {
    maximumFractionDigits: 0,
  });

export const BenchmarksPanel: React.FC<BenchmarksPanelProps> = ({
  benchmarks,
  onChange,
}) => {
  const handleNumberChange = (
    field: keyof Benchmarks,
    value: string
  ) => {
    const cleaned = value.replace(/[^0-9.-]/g, "");
    const numeric = Number(cleaned);
    onChange({
      ...benchmarks,
      [field]: Number.isFinite(numeric) ? numeric : 0,
    });
  };

  const handlePercentChange = (
    field: keyof Benchmarks,
    value: string
  ) => {
    const cleaned = value.replace(/[^0-9.-]/g, "");
    const numeric = Number(cleaned);
    const decimal = Number.isFinite(numeric) ? numeric / 100 : 0;
    onChange({
      ...benchmarks,
      [field]: decimal,
    });
  };

  return (
    <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 ring-1 ring-sky-500/60 px-6 py-5 text-slate-50">
      <h2 className="text-lg font-semibold">Benchmarks</h2>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* ARR / Revenue column */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-4">
          <h3 className="text-sm font-semibold text-slate-200">ARR Target</h3>
          <p className="mt-1 text-xs text-slate-400">
            Current ARR, Target & Timeframe
          </p>

          <label className="mt-4 block text-xs text-slate-400">
            Current ARR
            <div className="mt-1 flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950 px-2">
              <span className="text-slate-500">€</span>
              <input
                type="text"
                className="w-full bg-transparent py-1 text-sm text-slate-50 outline-none"
                value={formatNumber(benchmarks.currentArr)}
                onChange={(e) =>
                  handleNumberChange("currentArr", e.target.value)
                }
              />
            </div>
          </label>

          <label className="mt-3 block text-xs text-slate-400">
            Target ARR
            <div className="mt-1 flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950 px-2">
              <span className="text-slate-500">€</span>
              <input
                type="text"
                className="w-full bg-transparent py-1 text-sm text-slate-50 outline-none"
                value={formatNumber(benchmarks.targetArr)}
                onChange={(e) =>
                  handleNumberChange("targetArr", e.target.value)
                }
              />
            </div>
          </label>

          <label className="mt-3 block text-xs text-slate-400">
            Timeframe to hit target (weeks)
            <input
              type="number"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-50 outline-none"
              value={benchmarks.timeframeWeeks}
              onChange={(e) =>
                handleNumberChange("timeframeWeeks", e.target.value)
              }
            />
          </label>
        </div>

        {/* Marketing column */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-4">
          <h3 className="text-sm font-semibold text-slate-200">Marketing</h3>
          <p className="mt-1 text-xs text-slate-400">
            Top- and mid-funnel benchmarks.
          </p>

          <label className="mt-4 block text-xs text-slate-400">
            New leads per month
            <input
              type="number"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-50 outline-none"
              value={benchmarks.newLeadsPerMonth}
              onChange={(e) =>
                handleNumberChange("newLeadsPerMonth", e.target.value)
              }
            />
          </label>

          <label className="mt-3 block text-xs text-slate-400">
            Leads → MQL target (%)
            <div className="mt-1 flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950 px-2">
              <input
                type="number"
                className="w-full bg-transparent py-1 text-sm text-slate-50 outline-none"
                value={Math.round(benchmarks.leadsToMql * 100)}
                onChange={(e) =>
                  handlePercentChange("leadsToMql", e.target.value)
                }
              />
              <span className="text-slate-500">%</span>
            </div>
          </label>

          <label className="mt-3 block text-xs text-slate-400">
            MQL → SQL target (%)
            <div className="mt-1 flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950 px-2">
              <input
                type="number"
                className="w-full bg-transparent py-1 text-sm text-slate-50 outline-none"
                value={Math.round(benchmarks.mqlToSql * 100)}
                onChange={(e) =>
                  handlePercentChange("mqlToSql", e.target.value)
                }
              />
              <span className="text-slate-500">%</span>
            </div>
          </label>
        </div>

        {/* Sales column */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-4">
          <h3 className="text-sm font-semibold text-slate-200">Sales</h3>
          <p className="mt-1 text-xs text-slate-400">
            Down-funnel conversion benchmarks.
          </p>

          <label className="mt-4 block text-xs text-slate-400">
            SQL → Opp target (%)
            <div className="mt-1 flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950 px-2">
              <input
                type="number"
                className="w-full bg-transparent py-1 text-sm text-slate-50 outline-none"
                value={Math.round(benchmarks.sqlToOpp * 100)}
                onChange={(e) =>
                  handlePercentChange("sqlToOpp", e.target.value)
                }
              />
              <span className="text-slate-500">%</span>
            </div>
          </label>

          <label className="mt-3 block text-xs text-slate-400">
            Opp → Proposal target (%)
            <div className="mt-1 flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950 px-2">
              <input
                type="number"
                className="w-full bg-transparent py-1 text-sm text-slate-50 outline-none"
                value={Math.round(benchmarks.oppToProposal * 100)}
                onChange={(e) =>
                  handlePercentChange("oppToProposal", e.target.value)
                }
              />
              <span className="text-slate-500">%</span>
            </div>
          </label>

          <label className="mt-3 block text-xs text-slate-400">
            Proposal → Win target (%)
            <div className="mt-1 flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950 px-2">
              <input
                type="number"
                className="w-full bg-transparent py-1 text-sm text-slate-50 outline-none"
                value={Math.round(benchmarks.proposalToWin * 100)}
                onChange={(e) =>
                  handlePercentChange("proposalToWin", e.target.value)
                }
              />
              <span className="text-slate-500">%</span>
            </div>
          </label>
        </div>

        {/* Customer Success column */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-4">
          <h3 className="text-sm font-semibold text-slate-200">
            Customer Success
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Deal value and net revenue retention.
          </p>

          <label className="mt-4 block text-xs text-slate-400">
            ACV target (€)
            <div className="mt-1 flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950 px-2">
              <span className="text-slate-500">€</span>
              <input
                type="text"
                className="w-full bg-transparent py-1 text-sm text-slate-50 outline-none"
                value={formatNumber(benchmarks.acv)}
                onChange={(e) => handleNumberChange("acv", e.target.value)}
              />
            </div>
          </label>

          <label className="mt-3 block text-xs text-slate-400">
            NRR target (%)
            <div className="mt-1 flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950 px-2">
              <input
                type="number"
                className="w-full bg-transparent py-1 text-sm text-slate-50 outline-none"
                value={Math.round(benchmarks.nrr * 100)}
                onChange={(e) => handlePercentChange("nrr", e.target.value)}
              />
              <span className="text-slate-500">%</span>
            </div>
          </label>
        </div>
      </div>
    </section>
  );
};

export default BenchmarksPanel;
