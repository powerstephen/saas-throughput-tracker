// components/BenchmarksPanel.tsx
"use client";

import React from "react";

export interface Benchmarks {
  // ARR / Revenue
  currentArr: number;
  targetArr: number;
  timeframeWeeks: number;

  // Marketing benchmarks
  newLeadsPerMonth: number; // monthly top-of-funnel volume
  leadsToMql: number;       // decimal, e.g. 0.25 = 25%
  mqlToSql: number;         // decimal

  // Sales benchmarks
  sqlToOpp: number;         // decimal
  oppToProposal: number;    // decimal
  proposalToWin: number;    // decimal

  // Customer Success benchmarks
  acv: number;              // €
  nrr: number;              // multiple, e.g. 1.2 = 120% NRR (per year)
}

interface BenchmarksPanelProps {
  benchmarks: Benchmarks;
  onChange: (next: Benchmarks) => void;
}

const BenchmarksPanel: React.FC<BenchmarksPanelProps> = ({
  benchmarks,
  onChange,
}) => {
  const handleNumberChange = (
    field: keyof Benchmarks,
    value: string
  ) => {
    const numeric = Number(value.replace(/[^0-9.-]/g, ""));
    onChange({
      ...benchmarks,
      [field]: isNaN(numeric) ? 0 : numeric,
    });
  };

  const handlePercentChange = (
    field: keyof Benchmarks,
    value: string
  ) => {
    const numeric = Number(value.replace(/[^0-9.-]/g, ""));
    const decimal = isNaN(numeric) ? 0 : numeric / 100;
    onChange({
      ...benchmarks,
      [field]: decimal,
    });
  };

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* ARR / Revenue */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-4">
          <h3 className="text-sm font-semibold text-slate-200">
            ARR Targets
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Define where you are today and where you want to get to.
          </p>

          <label className="mt-4 block text-xs text-slate-400">
            Current ARR
            <div className="mt-1 flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950 px-2">
              <span className="text-slate-500">€</span>
              <input
                type="number"
                className="w-full bg-transparent py-1 text-sm text-slate-50 outline-none"
                value={benchmarks.currentArr}
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
                type="number"
                className="w-full bg-transparent py-1 text-sm text-slate-50 outline-none"
                value={benchmarks.targetArr}
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

        {/* Marketing */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-4">
          <h3 className="text-sm font-semibold text-slate-200">
            Marketing
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Top and mid-funnel volume and conversion targets.
          </p>

          <label className="mt-4 block text-xs text-slate-400">
            New Leads per month
            <div className="mt-1 flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950 px-2">
              <input
                type="number"
                className="w-full bg-transparent py-1 text-sm text-slate-50 outline-none"
                value={benchmarks.newLeadsPerMonth}
                onChange={(e) =>
                  handleNumberChange("newLeadsPerMonth", e.target.value)
                }
              />
            </div>
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

        {/* Sales */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-4">
          <h3 className="text-sm font-semibold text-slate-200">
            Sales
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Down-funnel conversion and deal closing performance.
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

        {/* Customer Success */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-4">
          <h3 className="text-sm font-semibold text-slate-200">
            Customer Success
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Expansion and NRR impact on your ARR path.
          </p>

          <label className="mt-4 block text-xs text-slate-400">
            NRR target (%)
            <div className="mt-1 flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950 px-2">
              <input
                type="number"
                className="w-full bg-transparent py-1 text-sm text-slate-50 outline-none"
                value={Math.round(benchmarks.nrr * 100)}
                onChange={(e) =>
                  handlePercentChange("nrr", e.target.value)
                }
              />
              <span className="text-slate-500">%</span>
            </div>
          </label>

          <label className="mt-3 block text-xs text-slate-400">
            ACV target (€)
            <div className="mt-1 flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950 px-2">
              <span className="text-slate-500">€</span>
              <input
                type="number"
                className="w-full bg-transparent py-1 text-sm text-slate-50 outline-none"
                value={benchmarks.acv}
                onChange={(e) => handleNumberChange("acv", e.target.value)}
              />
            </div>
          </label>
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Use realistic but stretching benchmarks that match how a healthy
        EdgeTier-style funnel should perform. The calculator will compare
        your actuals to these to highlight bottlenecks, quantify ARR unlock,
        and show the impact of improvement scenarios.
      </p>
    </div>
  );
};

export default BenchmarksPanel;
