// components/BenchmarksPanel.tsx
"use client";

import React from "react";

export interface Benchmarks {
  targetArr: number;
  timeframeWeeks: number;

  // funnel conversion targets (stored as decimals, e.g. 0.35 = 35%)
  mqlToSql: number;
  sqlToOpp: number;
  oppToProposal: number;
  proposalToWin: number;

  // commercial benchmarks
  acv: number; // €
  monthlyChurn: number; // decimal, e.g. 0.01 = 1%
  expansion: number; // decimal per year, e.g. 0.2 = 20%
  nrr: number; // multiple, e.g. 1.2 = 120%
}

interface BenchmarksPanelProps {
  benchmarks: Benchmarks;
  onChange: (next: Benchmarks) => void;
}

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
      [field]: isNaN(numeric) ? 0 : numeric,
    });
  };

  const handlePercentChange = (
    field: keyof Benchmarks,
    value: string
  ) => {
    const cleaned = value.replace(/[^0-9.-]/g, "");
    const numeric = Number(cleaned);
    const decimal = isNaN(numeric) ? 0 : numeric / 100;
    onChange({
      ...benchmarks,
      [field]: decimal,
    });
  };

  return (
    <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 px-6 py-5 text-slate-50">
      <h2 className="text-lg font-semibold">Benchmarks</h2>
      <p className="mt-1 text-sm text-slate-400">
        These benchmarks drive the diagnosis, scenarios, and ARR
        projections across the dashboard.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* ARR / Revenue column */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-4">
          <h3 className="text-sm font-semibold text-slate-200">
            ARR Target
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Target ARR and timeframe for this model.
          </p>

          <label className="mt-4 block text-xs text-slate-400">
            Target ARR for this period
            <div className="mt-1 flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950 px-2">
              <span className="text-slate-500">€</span>
              <input
                type="text"
                className="w-full bg-transparent py-1 text-sm text-slate-50 outline-none"
                value={benchmarks.targetArr.toLocaleString(
                  "en-IE",
                  { maximumFractionDigits: 0 }
                )}
                onChange={(e) =>
                  handleNumberChange(
                    "targetArr",
                    e.target.value
                  )
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
                handleNumberChange(
                  "timeframeWeeks",
                  e.target.value
                )
              }
            />
          </label>
        </div>

        {/* Marketing column */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-4">
          <h3 className="text-sm font-semibold text-slate-200">
            Marketing
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Top- and mid-funnel conversion targets.
          </p>

          <label className="mt-4 block text-xs text-slate-400">
            MQL → SQL target (%)
            <div className="mt-1 flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950 px-2">
              <input
                type="number"
                className="w-full bg-transparent py-1 text-sm text-slate-50 outline-none"
                value={Math.round(
                  benchmarks.mqlToSql * 100
                )}
                onChange={(e) =>
                  handlePercentChange(
                    "mqlToSql",
                    e.target.value
                  )
                }
              />
              <span className="text-slate-500">%</span>
            </div>
          </label>

          <label className="mt-3 block text-xs text-slate-400">
            SQL → Opp target (%)
            <div className="mt-1 flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950 px-2">
              <input
                type="number"
                className="w-full bg-transparent py-1 text-sm text-slate-50 outline-none"
                value={Math.round(
                  benchmarks.sqlToOpp * 100
                )}
                onChange={(e) =>
                  handlePercentChange(
                    "sqlToOpp",
                    e.target.value
                  )
                }
              />
              <span className="text-slate-500">%</span>
            </div>
          </label>
        </div>

        {/* Sales column */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-4">
          <h3 className="text-sm font-semibold text-slate-200">
            Sales
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Down-funnel conversion and deal value.
          </p>

          <label className="mt-4 block text-xs text-slate-400">
            Opp → Proposal target (%)
            <div className="mt-1 flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950 px-2">
              <input
                type="number"
                className="w-full bg-transparent py-1 text-sm text-slate-50 outline-none"
                value={Math.round(
                  benchmarks.oppToProposal * 100
                )}
                onChange={(e) =>
                  handlePercentChange(
                    "oppToProposal",
                    e.target.value
                  )
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
                value={Math.round(
                  benchmarks.proposalToWin * 100
                )}
                onChange={(e) =>
                  handlePercentChange(
                    "proposalToWin",
                    e.target.value
                  )
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
                type="text"
                className="w-full bg-transparent py-1 text-sm text-slate-50 outline-none"
                value={benchmarks.acv.toLocaleString(
                  "en-IE",
                  { maximumFractionDigits: 0 }
                )}
                onChange={(e) =>
                  handleNumberChange("acv", e.target.value)
                }
              />
            </div>
          </label>
        </div>

        {/* Customer Success column */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-4">
          <h3 className="text-sm font-semibold text-slate-200">
            Customer Success
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Retention, expansion and NRR benchmarks.
          </p>

          <label className="mt-4 block text-xs text-slate-400">
            Monthly churn target (%)
            <div className="mt-1 flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950 px-2">
              <input
                type="number"
                className="w-full bg-transparent py-1 text-sm text-slate-50 outline-none"
                value={Math.round(
                  benchmarks.monthlyChurn * 100
                )}
                onChange={(e) =>
                  handlePercentChange(
                    "monthlyChurn",
                    e.target.value
                  )
                }
              />
              <span className="text-slate-500">%</span>
            </div>
          </label>

          <label className="mt-3 block text-xs text-slate-400">
            Expansion target (% / year)
            <div className="mt-1 flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950 px-2">
              <input
                type="number"
                className="w-full bg-transparent py-1 text-sm text-slate-50 outline-none"
                value={Math.round(
                  benchmarks.expansion * 100
                )}
                onChange={(e) =>
                  handlePercentChange(
                    "expansion",
                    e.target.value
                  )
                }
              />
              <span className="text-slate-500">%</span>
            </div>
          </label>

          <label className="mt-3 block text-xs text-slate-400">
            NRR target (%)
            <div className="mt-1 flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950 px-2">
              <input
                type="number"
                className="w-full bg-transparent py-1 text-sm text-slate-50 outline-none"
                value={Math.round(benchmarks.nrr * 100)}
                onChange={(e) =>
                  handlePercentChange(
                    "nrr",
                    e.target.value
                  )
                }
              />
              <span className="text-slate-500">%</span>
            </div>
          </label>
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Use realistic but stretching benchmarks that match
        how a healthy EdgeTier-style funnel should perform.
        The calculator will compare your actuals to these to
        highlight bottlenecks, quantify ARR unlock, and show
        the impact of improvement scenarios.
      </p>
    </section>
  );
};

export default BenchmarksPanel;
