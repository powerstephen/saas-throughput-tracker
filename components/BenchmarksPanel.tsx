"use client";

import React, { useState } from "react";
import type { Benchmarks } from "./MainDashboard";

type Props = {
  benchmarks: Benchmarks;
  onChange: (b: Benchmarks) => void;
};

export default function BenchmarksPanel({ benchmarks, onChange }: Props) {
  const [open, setOpen] = useState<boolean>(true);

  const handleNumberChange = (field: keyof Benchmarks, value: string) => {
    const num = Number(value);
    onChange({
      ...benchmarks,
      [field]: isNaN(num) ? 0 : num
    });
  };

  const handlePercentChange = (
    field: keyof Benchmarks,
    value: string
  ) => {
    const num = Number(value);
    onChange({
      ...benchmarks,
      [field]: isNaN(num) ? 0 : num / 100
    });
  };

  return (
    <section className="rounded-2xl bg-slateCard p-4 shadow-lg shadow-black/40">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">
            Benchmarks & ARR Targets
          </h2>
          <p className="mt-1 text-xs text-slate-300">
            Use target conversion rates and ARR goals as your reference
            model. The scenario engine compares actual performance against
            these.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-200 hover:bg-slate-700"
        >
          {open ? "Hide" : "Show"}
        </button>
      </div>

      {open && (
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* ARR & timeframe */}
          <div className="space-y-2 rounded-xl bg-slateCardSoft p-3 text-xs">
            <div className="font-medium text-slate-200">
              ARR & Timeframe
            </div>
            <label className="flex flex-col gap-1">
              <span className="text-slate-300">Current ARR (€)</span>
              <input
                type="number"
                className="rounded-md border border-slate-700 bg-slateBg px-2 py-1 text-sm"
                value={benchmarks.currentArr}
                onChange={(e) =>
                  handleNumberChange("currentArr", e.target.value)
                }
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-slate-300">Target ARR (€)</span>
              <input
                type="number"
                className="rounded-md border border-slate-700 bg-slateBg px-2 py-1 text-sm"
                value={benchmarks.targetArr}
                onChange={(e) =>
                  handleNumberChange("targetArr", e.target.value)
                }
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-slate-300">Timeframe to target (weeks)</span>
              <input
                type="number"
                className="rounded-md border border-slate-700 bg-slateBg px-2 py-1 text-sm"
                value={benchmarks.timeframeWeeks}
                onChange={(e) =>
                  handleNumberChange("timeframeWeeks", e.target.value)
                }
              />
            </label>
          </div>

          {/* Top-of-funnel */}
          <div className="space-y-2 rounded-xl bg-slateCardSoft p-3 text-xs">
            <div className="font-medium text-slate-200">
              Marketing / Top of Funnel
            </div>
            <label className="flex flex-col gap-1">
              <span className="text-slate-300">Leads → MQL (%)</span>
              <input
                type="number"
                className="rounded-md border border-slate-700 bg-slateBg px-2 py-1 text-sm"
                value={Math.round(benchmarks.leadToMql * 100)}
                onChange={(e) =>
                  handlePercentChange("leadToMql", e.target.value)
                }
              />
            </label>
          </div>

          {/* Mid-funnel */}
          <div className="space-y-2 rounded-xl bg-slateCardSoft p-3 text-xs">
            <div className="font-medium text-slate-200">Sales Funnel</div>

            <label className="flex flex-col gap-1">
              <span className="text-slate-300">MQL → SQL (%)</span>
              <input
                type="number"
                className="rounded-md border border-slate-700 bg-slateBg px-2 py-1 text-sm"
                value={Math.round(benchmarks.mqlToSql * 100)}
                onChange={(e) =>
                  handlePercentChange("mqlToSql", e.target.value)
                }
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-slate-300">SQL → Opp (%)</span>
              <input
                type="number"
                className="rounded-md border border-slate-700 bg-slateBg px-2 py-1 text-sm"
                value={Math.round(benchmarks.sqlToOpp * 100)}
                onChange={(e) =>
                  handlePercentChange("sqlToOpp", e.target.value)
                }
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-slate-300">Opp → Proposal (%)</span>
              <input
                type="number"
                className="rounded-md border border-slate-700 bg-slateBg px-2 py-1 text-sm"
                value={Math.round(benchmarks.oppToProposal * 100)}
                onChange={(e) =>
                  handlePercentChange("oppToProposal", e.target.value)
                }
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-slate-300">Proposal → Win (%)</span>
              <input
                type="number"
                className="rounded-md border border-slate-700 bg-slateBg px-2 py-1 text-sm"
                value={Math.round(benchmarks.proposalToWin * 100)}
                onChange={(e) =>
                  handlePercentChange("proposalToWin", e.target.value)
                }
              />
            </label>
          </div>
        </div>
      )}
    </section>
  );
}
