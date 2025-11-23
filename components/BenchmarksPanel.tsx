"use client";

import React, { useState } from "react";
import clsx from "clsx";

export type Benchmarks = {
  marketing: {
    leadToMql: number; // decimal (0.25 = 25%)
    mqlToSql: number;  // decimal
  };
  sales: {
    sqlToOpp: number;  // decimal
    oppToProp: number; // decimal
    propToWin: number; // decimal
  };
  cs: {
    monthlyChurnTarget: number; // decimal (0.01 = 1%)
    expansionTarget: number;    // decimal (0.15 = 15% annual)
    nrrTarget: number;          // multiple (1.2 = 120%)
  };
  revenue: {
    currentArr: number;
    arrTarget: number;
    timeframeWeeks: number;
    blendedCacTarget: number;
  };
};

type BenchmarksPanelProps = {
  benchmarks: Benchmarks;
  onChange: (value: Benchmarks) => void;
};

export function BenchmarksPanel({ benchmarks, onChange }: BenchmarksPanelProps) {
  const [open, setOpen] = useState(true);

  const handlePercentChange = (
    section: keyof Benchmarks,
    field: string,
    raw: string
  ) => {
    const num = Number(raw);
    const decimal = isNaN(num) ? 0 : num / 100;

    const updated: Benchmarks = JSON.parse(JSON.stringify(benchmarks));
    // @ts-expect-error dynamic index
    updated[section][field] = decimal;
    onChange(updated);
  };

  const handleNumberChange = (
    section: keyof Benchmarks,
    field: string,
    raw: string
  ) => {
    const num = Number(raw);
    const value = isNaN(num) ? 0 : num;

    const updated: Benchmarks = JSON.parse(JSON.stringify(benchmarks));
    // @ts-expect-error dynamic index
    updated[section][field] = value;
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "flex w-full items-center justify-between rounded-xl border px-3 py-2 text-xs font-medium",
          "border-slate-700/80 bg-slate-900/80 text-slate-100 hover:border-sky-500 hover:text-sky-100"
        )}
      >
        <span>Benchmark settings</span>
        <span className="text-[11px] text-slate-400">
          {open ? "Hide" : "Show"}
        </span>
      </button>

      {open && (
        <div className="space-y-4 text-xs text-slate-100">
          {/* Marketing + Sales */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Marketing */}
            <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">
              <h3 className="text-[11px] font-semibold tracking-tight text-slate-200">
                Marketing benchmarks
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] text-slate-300">
                    Leads → MQL (%)
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-slate-700/80 bg-slate-900/80 px-2 py-1.5 text-[11px] text-slate-50 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    value={Math.round(benchmarks.marketing.leadToMql * 100)}
                    onChange={(e) =>
                      handlePercentChange("marketing", "leadToMql", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-slate-300">
                    MQL → SQL (%)
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-slate-700/80 bg-slate-900/80 px-2 py-1.5 text-[11px] text-slate-50 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    value={Math.round(benchmarks.marketing.mqlToSql * 100)}
                    onChange={(e) =>
                      handlePercentChange("marketing", "mqlToSql", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Sales */}
            <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">
              <h3 className="text-[11px] font-semibold tracking-tight text-slate-200">
                Sales benchmarks
              </h3>
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-[11px] text-slate-300">
                    SQL → Opp (%)
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-slate-700/80 bg-slate-900/80 px-2 py-1.5 text-[11px] text-slate-50 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    value={Math.round(benchmarks.sales.sqlToOpp * 100)}
                    onChange={(e) =>
                      handlePercentChange("sales", "sqlToOpp", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-slate-300">
                    Opp → Prop (%)
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-slate-700/80 bg-slate-900/80 px-2 py-1.5 text-[11px] text-slate-50 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    value={Math.round(benchmarks.sales.oppToProp * 100)}
                    onChange={(e) =>
                      handlePercentChange("sales", "oppToProp", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-slate-300">
                    Prop → Win (%)
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-slate-700/80 bg-slate-900/80 px-2 py-1.5 text-[11px] text-slate-50 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    value={Math.round(benchmarks.sales.propToWin * 100)}
                    onChange={(e) =>
                      handlePercentChange("sales", "propToWin", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CS + Revenue */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* CS */}
            <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">
              <h3 className="text-[11px] font-semibold tracking-tight text-slate-200">
                Customer Success benchmarks
              </h3>
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-[11px] text-slate-300">
                    Monthly churn (%)
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-slate-700/80 bg-slate-900/80 px-2 py-1.5 text-[11px] text-slate-50 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    value={Math.round(benchmarks.cs.monthlyChurnTarget * 100)}
                    onChange={(e) =>
                      handlePercentChange("cs", "monthlyChurnTarget", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-slate-300">
                    Expansion / year (%)
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-slate-700/80 bg-slate-900/80 px-2 py-1.5 text-[11px] text-slate-50 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    value={Math.round(benchmarks.cs.expansionTarget * 100)}
                    onChange={(e) =>
                      handlePercentChange("cs", "expansionTarget", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-slate-300">
                    NRR target (%)
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-slate-700/80 bg-slate-900/80 px-2 py-1.5 text-[11px] text-slate-50 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    value={Math.round(benchmarks.cs.nrrTarget * 100)}
                    onChange={(e) =>
                      handleNumberChange("cs", "nrrTarget", String(Number(e.target.value) / 100))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Revenue */}
            <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">
              <h3 className="text-[11px] font-semibold tracking-tight text-slate-200">
                Revenue & timeframe
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] text-slate-300">
                    Current ARR (€)
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-slate-700/80 bg-slate-900/80 px-2 py-1.5 text-[11px] text-slate-50 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    value={benchmarks.revenue.currentArr}
                    onChange={(e) =>
                      handleNumberChange("revenue", "currentArr", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-slate-300">
                    Target ARR (€)
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-slate-700/80 bg-slate-900/80 px-2 py-1.5 text-[11px] text-slate-50 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    value={benchmarks.revenue.arrTarget}
                    onChange={(e) =>
                      handleNumberChange("revenue", "arrTarget", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-slate-300">
                    Time to target (weeks)
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-slate-700/80 bg-slate-900/80 px-2 py-1.5 text-[11px] text-slate-50 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    value={benchmarks.revenue.timeframeWeeks}
                    onChange={(e) =>
                      handleNumberChange("revenue", "timeframeWeeks", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-slate-300">
                    Blended CAC target (€)
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-slate-700/80 bg-slate-900/80 px-2 py-1.5 text-[11px] text-slate-50 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    value={benchmarks.revenue.blendedCacTarget}
                    onChange={(e) =>
                      handleNumberChange("revenue", "blendedCacTarget", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
