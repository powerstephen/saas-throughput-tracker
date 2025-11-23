// components/BenchmarksPanel.tsx
"use client";

import React from "react";

export interface Benchmarks {
  // Revenue target
  targetArr: number;
  timeframeWeeks: number;

  // Funnel conversion benchmarks
  mqlToSql: number;        // 0–1
  sqlToOpp: number;        // 0–1
  oppToProposal: number;   // 0–1
  proposalToWin: number;   // 0–1

  // Commercial benchmarks
  acvTarget: number;       // €
  churnTarget: number;     // 0–1 monthly churn
  expansionTarget: number; // 0–1 annual expansion
  nrrTarget: number;       // 0–2 (e.g. 1.2 = 120% NRR)

  // Optional flag if you use it elsewhere
  includeCustomerSuccess?: boolean;
}

interface BenchmarksPanelProps {
  benchmarks: Benchmarks;
  onChange: (benchmarks: Benchmarks) => void;
}

export function BenchmarksPanel({ benchmarks, onChange }: BenchmarksPanelProps) {
  const handleNumberChange = (
    field: keyof Benchmarks,
    value: string
  ): void => {
    const numeric = Number(value.replace(/[^0-9.]/g, ""));
    const updated: Benchmarks = { ...benchmarks, [field]: isNaN(numeric) ? 0 : numeric };
    onChange(updated);
  };

  const handlePercentChange = (
    field: keyof Benchmarks,
    value: string
  ): void => {
    const numeric = Number(value.replace(/[^0-9.]/g, ""));
    const decimal = isNaN(numeric) ? 0 : numeric / 100;
    const updated: Benchmarks = { ...benchmarks, [field]: decimal };
    onChange(updated);
  };

  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-700/70 p-6 mb-8">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-50">
            Benchmarks
          </h2>
          <p className="text-sm text-slate-400">
            These benchmarks drive the diagnosis, scenarios, and ARR
            projections across the dashboard.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Revenue targets */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">
            ARR Target
          </h3>
          <div className="space-y-2 text-sm text-slate-300">
            <label className="block">
              <span className="mb-1 block text-slate-400">
                Target ARR for this period
              </span>
              <div className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-3 py-2">
                <span className="text-slate-400">€</span>
                <input
                  type="number"
                  className="w-full bg-transparent text-sm outline-none"
                  value={benchmarks.targetArr}
                  onChange={(e) =>
                    handleNumberChange("targetArr", e.target.value)
                  }
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1 block text-slate-400">
                Timeframe to hit target (weeks)
              </span>
              <input
                type="number"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"
                value={benchmarks.timeframeWeeks}
                onChange={(e) =>
                  handleNumberChange("timeframeWeeks", e.target.value)
                }
              />
            </label>
          </div>
        </div>

        {/* Funnel conversion benchmarks */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">
            Funnel conversions
          </h3>
          <div className="space-y-2 text-sm text-slate-300">
            <label className="block">
              <span className="mb-1 block text-slate-400">
                MQL → SQL target (%)
              </span>
              <input
                type="number"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"
                value={Math.round(benchmarks.mqlToSql * 100)}
                onChange={(e) =>
                  handlePercentChange("mqlToSql", e.target.value)
                }
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-slate-400">
                SQL → Opp target (%)
              </span>
              <input
                type="number"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"
                value={Math.round(benchmarks.sqlToOpp * 100)}
                onChange={(e) =>
                  handlePercentChange("sqlToOpp", e.target.value)
                }
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-slate-400">
                Opp → Proposal target (%)
              </span>
              <input
                type="number"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"
                value={Math.round(benchmarks.oppToProposal * 100)}
                onChange={(e) =>
                  handlePercentChange("oppToProposal", e.target.value)
                }
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-slate-400">
                Proposal → Win target (%)
              </span>
              <input
                type="number"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"
                value={Math.round(benchmarks.proposalToWin * 100)}
                onChange={(e) =>
                  handlePercentChange("proposalToWin", e.target.value)
                }
              />
            </label>
          </div>
        </div>

        {/* Commercial benchmarks */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">
            Commercial benchmarks
          </h3>
          <div className="space-y-2 text-sm text-slate-300">
            <label className="block">
              <span className="mb-1 block text-slate-400">
                ACV target (€)
              </span>
              <div className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-3 py-2">
                <span className="text-slate-400">€</span>
                <input
                  type="number"
                  className="w-full bg-transparent text-sm outline-none"
                  value={benchmarks.acvTarget}
                  onChange={(e) =>
                    handleNumberChange("acvTarget", e.target.value)
                  }
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1 block text-slate-400">
                Monthly churn target (%)
              </span>
              <input
                type="number"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"
                value={Math.round(benchmarks.churnTarget * 100)}
                onChange={(e) =>
                  handlePercentChange("churnTarget", e.target.value)
                }
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-slate-400">
                Expansion target (% / year)
              </span>
              <input
                type="number"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"
                value={Math.round(benchmarks.expansionTarget * 100)}
                onChange={(e) =>
                  handlePercentChange("expansionTarget", e.target.value)
                }
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-slate-400">
                NRR target (%)
              </span>
              <input
                type="number"
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"
                value={Math.round(benchmarks.nrrTarget * 100)}
                onChange={(e) =>
                  handlePercentChange("nrrTarget", e.target.value)
                }
              />
            </label>
          </div>
        </div>

        {/* Helper text */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">
            How to use these
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Use realistic but stretching benchmarks that match how a healthy
            EdgeTier-style funnel should perform. The calculator will compare
            your actuals to these to highlight bottlenecks, quantify ARR
            unlock, and show the impact of improvement scenarios.
          </p>
        </div>
      </div>
    </div>
  );
}
