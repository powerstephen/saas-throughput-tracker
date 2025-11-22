"use client";

import { useState } from "react";

export type Benchmarks = {
  marketing: {
    leadToMql: number;
    mqlToSql: number;
    sqlToOpp: number;
    cac: number;
  };
  sales: {
    oppToProposal: number;
    proposalToWin: number;
    acv: number;
  };
  cs: {
    churn: number;
    expansion: number;
    nrr: number;
    grossMargin: number;
  };
  revenue: {
    currentArr: number;
    arrTarget: number;
    timeframeWeeks: number;
  };
};

type Props = {
  benchmarks: Benchmarks;
  onChange: (b: Benchmarks) => void;
};

export default function BenchmarksPanel({ benchmarks, onChange }: Props) {
  const [open, setOpen] = useState(true);

  const handleNumberChange = (
    section: keyof Benchmarks,
    field: string,
    value: string
  ) => {
    const num = Number(value) || 0;
    const clone: Benchmarks = JSON.parse(JSON.stringify(benchmarks));
    // @ts-expect-error index access
    clone[section][field] = num;
    onChange(clone);
  };

  return (
    <section className="border border-slate-800 rounded-2xl bg-slate-900/60 shadow-lg">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 border-b border-slate-800 text-left"
      >
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
            Benchmarks & ARR Targets
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Set your target conversion rates, unit economics, and ARR goal over
            a chosen timeframe (in weeks).
          </p>
        </div>
        <span className="text-xs text-slate-400">
          {open ? "Hide" : "Show"}
        </span>
      </button>

      {open && (
        <div className="p-4 space-y-6">
          {/* MARKETING */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 mb-3 uppercase tracking-[0.18em]">
              Marketing Funnel Targets
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <NumberField
                label="Lead → MQL %"
                value={benchmarks.marketing.leadToMql}
                onChange={(v) => handleNumberChange("marketing", "leadToMql", v)}
              />
              <NumberField
                label="MQL → SQL %"
                value={benchmarks.marketing.mqlToSql}
                onChange={(v) => handleNumberChange("marketing", "mqlToSql", v)}
              />
              <NumberField
                label="SQL → Opp %"
                value={benchmarks.marketing.sqlToOpp}
                onChange={(v) => handleNumberChange("marketing", "sqlToOpp", v)}
              />
              <NumberField
                label="Blended CAC €"
                value={benchmarks.marketing.cac}
                onChange={(v) => handleNumberChange("marketing", "cac", v)}
              />
            </div>
          </div>

          {/* SALES */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 mb-3 uppercase tracking-[0.18em]">
              Sales Funnel Targets
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <NumberField
                label="Opp → Proposal %"
                value={benchmarks.sales.oppToProposal}
                onChange={(v) =>
                  handleNumberChange("sales", "oppToProposal", v)
                }
              />
              <NumberField
                label="Proposal → Win %"
                value={benchmarks.sales.proposalToWin}
                onChange={(v) =>
                  handleNumberChange("sales", "proposalToWin", v)
                }
              />
              <NumberField
                label="ACV €"
                value={benchmarks.sales.acv}
                onChange={(v) => handleNumberChange("sales", "acv", v)}
              />
            </div>
          </div>

          {/* CUSTOMER SUCCESS */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 mb-3 uppercase tracking-[0.18em]">
              Customer Success Targets
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <NumberField
                label="Annual Churn %"
                value={benchmarks.cs.churn}
                onChange={(v) => handleNumberChange("cs", "churn", v)}
              />
              <NumberField
                label="Annual Expansion %"
                value={benchmarks.cs.expansion}
                onChange={(v) => handleNumberChange("cs", "expansion", v)}
              />
              <NumberField
                label="NRR %"
                value={benchmarks.cs.nrr}
                onChange={(v) => handleNumberChange("cs", "nrr", v)}
              />
              <NumberField
                label="Gross Margin %"
                value={benchmarks.cs.grossMargin}
                onChange={(v) => handleNumberChange("cs", "grossMargin", v)}
              />
            </div>
          </div>

          {/* REVENUE TARGET */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 mb-3 uppercase tracking-[0.18em]">
              ARR Targets & Timeframe
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <NumberField
                label="Current ARR €"
                value={benchmarks.revenue.currentArr}
                onChange={(v) =>
                  handleNumberChange("revenue", "currentArr", v)
                }
              />
              <NumberField
                label="ARR Target €"
                value={benchmarks.revenue.arrTarget}
                onChange={(v) => handleNumberChange("revenue", "arrTarget", v)}
              />
              <NumberField
                label="Timeframe (weeks)"
                value={benchmarks.revenue.timeframeWeeks}
                onChange={(v) =>
                  handleNumberChange("revenue", "timeframeWeeks", v)
                }
              />
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Use weeks so you are not bound to fixed quarters. For example,
              set 20 weeks if you are mid-year with a specific board target.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (val: string) => void;
};

function NumberField({ label, value, onChange }: NumberFieldProps) {
  return (
    <label className="block text-xs text-slate-300 space-y-1">
      <span>{label}</span>
      <input
        type="number"
        className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2 py-1.5 text-xs text-slate-50 focus:outline-none focus:ring-1 focus:ring-sky-500"
        value={Number.isNaN(value) ? "" : value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
