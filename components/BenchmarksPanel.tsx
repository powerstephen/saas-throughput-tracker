// components/BenchmarksPanel.tsx
"use client";

import React, { useState } from "react";
import type { Benchmarks } from "@/app/page";

interface Props {
  benchmarks: Benchmarks;
  onChange: (b: Benchmarks) => void;
}

const BenchmarksPanel: React.FC<Props> = ({ benchmarks, onChange }) => {
  const [open, setOpen] = useState(true);

  const handleNumberChange = (
    section: keyof Benchmarks,
    field: string,
    value: string
  ) => {
    const numeric = Number(value.replace(/[^0-9.]/g, "")) || 0;
    const updated: Benchmarks = JSON.parse(JSON.stringify(benchmarks));
    // @ts-expect-error dynamic access
    updated[section][field] = numeric;
    onChange(updated);
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4 shadow-sm md:px-6 md:py-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium text-slate-100">
            Benchmarks & ARR target
          </h2>
          <p className="text-xs text-slate-400">
            Targets for conversion rates, NRR and ARR horizon. These drive
            diagnostics, colour-coding and scenario impact.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-100 hover:bg-slate-800"
        >
          {open ? "Hide" : "Show"}
        </button>
      </div>

      {!open ? null : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Marketing */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Marketing
            </h3>

            <label className="mb-3 block text-xs text-slate-300">
              No. leads per period
              <input
                type="number"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
                value={benchmarks.marketing.leadsPerPeriod}
                onChange={(e) =>
                  handleNumberChange(
                    "marketing",
                    "leadsPerPeriod",
                    e.target.value
                  )
                }
              />
            </label>

            <label className="mb-3 block text-xs text-slate-300">
              Leads → MQL target (%)
              <input
                type="number"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
                value={benchmarks.marketing.leadsToMql}
                onChange={(e) =>
                  handleNumberChange("marketing", "leadsToMql", e.target.value)
                }
              />
            </label>

            <label className="block text-xs text-slate-300">
              MQL → SQL target (%)
              <input
                type="number"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
                value={benchmarks.marketing.mqlToSql}
                onChange={(e) =>
                  handleNumberChange("marketing", "mqlToSql", e.target.value)
                }
              />
            </label>
          </div>

          {/* Sales */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Sales
            </h3>

            <label className="mb-3 block text-xs text-slate-300">
              SQL → Opp target (%)
              <input
                type="number"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
                value={benchmarks.sales.sqlToOpp}
                onChange={(e) =>
                  handleNumberChange("sales", "sqlToOpp", e.target.value)
                }
              />
            </label>

            <label className="mb-3 block text-xs text-slate-300">
              Opp → Proposal target (%)
              <input
                type="number"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
                value={benchmarks.sales.oppToProposal}
                onChange={(e) =>
                  handleNumberChange(
                    "sales",
                    "oppToProposal",
                    e.target.value
                  )
                }
              />
            </label>

            <label className="block text-xs text-slate-300">
              Proposal → Win target (%)
              <input
                type="number"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
                value={benchmarks.sales.proposalToWin}
                onChange={(e) =>
                  handleNumberChange(
                    "sales",
                    "proposalToWin",
                    e.target.value
                  )
                }
              />
            </label>
          </div>

          {/* Customer Success */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Customer Success
            </h3>

            <label className="mb-3 block text-xs text-slate-300">
              Monthly churn target (%)
              <input
                type="number"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
                value={benchmarks.customerSuccess.monthlyChurn}
                onChange={(e) =>
                  handleNumberChange(
                    "customerSuccess",
                    "monthlyChurn",
                    e.target.value
                  )
                }
              />
            </label>

            <label className="mb-3 block text-xs text-slate-300">
              Expansion target (%)
              <input
                type="number"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
                value={benchmarks.customerSuccess.expansion}
                onChange={(e) =>
                  handleNumberChange(
                    "customerSuccess",
                    "expansion",
                    e.target.value
                  )
                }
              />
            </label>

            <label className="block text-xs text-slate-300">
              NRR target (%)
              <input
                type="number"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
                value={benchmarks.customerSuccess.nrr}
                onChange={(e) =>
                  handleNumberChange("customerSuccess", "nrr", e.target.value)
                }
              />
            </label>
          </div>

          {/* Revenue */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Revenue / ARR horizon
            </h3>

            <label className="mb-3 block text-xs text-slate-300">
              Current ARR (€)
              <input
                type="number"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
                value={benchmarks.revenue.currentArr}
                onChange={(e) =>
                  handleNumberChange("revenue", "currentArr", e.target.value)
                }
              />
            </label>

            <label className="mb-3 block text-xs text-slate-300">
              Target ARR (€)
              <input
                type="number"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
                value={benchmarks.revenue.targetArr}
                onChange={(e) =>
                  handleNumberChange("revenue", "targetArr", e.target.value)
                }
              />
            </label>

            <label className="block text-xs text-slate-300">
              Timeframe to target (weeks)
              <input
                type="number"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
                value={benchmarks.revenue.timeframeWeeks}
                onChange={(e) =>
                  handleNumberChange(
                    "revenue",
                    "timeframeWeeks",
                    e.target.value
                  )
                }
              />
            </label>
          </div>
        </div>
      )}
    </section>
  );
};

export default BenchmarksPanel;
