"use client";

import React from "react";

export type Benchmarks = {
  marketing: {
    leadsToMql: number;
    mqlToSql: number;
  };
  sales: {
    sqlToOpp: number;
    oppToProp: number;
    propToWin: number;
  };
  cs: {
    nrrTarget: number; // percentage, eg 110 = 110%
  };
  revenue: {
    currentArr: number;
    targetArr: number;
    timeframeWeeks: number;
  };
};

type BenchmarksPanelProps = {
  benchmarks: Benchmarks;
  onChange: (next: Benchmarks) => void;
  show: boolean;
  onToggleShow: () => void;
};

export default function BenchmarksPanel({
  benchmarks,
  onChange,
  show,
  onToggleShow,
}: BenchmarksPanelProps) {
  const handleChange = (
    section: keyof Benchmarks,
    field: string,
    value: string
  ) => {
    const next: Benchmarks = JSON.parse(JSON.stringify(benchmarks));
    const numeric = Number(value) || 0;

    // @ts-ignore - simple nested assign
    next[section][field] = numeric;
    onChange(next);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-slate-50">
          Benchmarks and Targets
        </h2>
        <button
          type="button"
          onClick={onToggleShow}
          className="text-xs px-3 py-1 rounded border border-slate-700 text-slate-200 hover:bg-slate-800"
        >
          {show ? "Hide benchmarks" : "Show benchmarks"}
        </button>
      </div>

      {show && (
        <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-4 space-y-4">
          {/* Top row: Marketing + Sales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Marketing */}
            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-2">
                Marketing funnel targets
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <LabeledInput
                  label="Leads → MQL (%)"
                  value={benchmarks.marketing.leadsToMql}
                  onChange={(v) => handleChange("marketing", "leadsToMql", v)}
                />
                <LabeledInput
                  label="MQL → SQL (%)"
                  value={benchmarks.marketing.mqlToSql}
                  onChange={(v) => handleChange("marketing", "mqlToSql", v)}
                />
              </div>
            </div>

            {/* Sales */}
            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-2">
                Sales funnel targets
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <LabeledInput
                  label="SQL → Opp (%)"
                  value={benchmarks.sales.sqlToOpp}
                  onChange={(v) => handleChange("sales", "sqlToOpp", v)}
                />
                <LabeledInput
                  label="Opp → Proposal (%)"
                  value={benchmarks.sales.oppToProp}
                  onChange={(v) => handleChange("sales", "oppToProp", v)}
                />
                <LabeledInput
                  label="Proposal → Win (%)"
                  value={benchmarks.sales.propToWin}
                  onChange={(v) => handleChange("sales", "propToWin", v)}
                />
              </div>
            </div>
          </div>

          {/* Bottom row: CS + Revenue */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CS */}
            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-2">
                Customer success (optional)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <LabeledInput
                  label="NRR target (%)"
                  value={benchmarks.cs.nrrTarget}
                  onChange={(v) => handleChange("cs", "nrrTarget", v)}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                If you choose to include CS, this NRR target will be used to
                estimate how much ARR growth comes from the existing base versus
                net new.
              </p>
            </div>

            {/* Revenue */}
            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-2">
                Revenue targets
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <LabeledInput
                  label="Current ARR (€)"
                  value={benchmarks.revenue.currentArr}
                  onChange={(v) => handleChange("revenue", "currentArr", v)}
                />
                <LabeledInput
                  label="Target ARR (€)"
                  value={benchmarks.revenue.targetArr}
                  onChange={(v) => handleChange("revenue", "targetArr", v)}
                />
                <LabeledInput
                  label="Timeframe (weeks)"
                  value={benchmarks.revenue.timeframeWeeks}
                  onChange={(v) =>
                    handleChange("revenue", "timeframeWeeks", v)
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type LabeledInputProps = {
  label: string;
  value: number;
  onChange: (v: string) => void;
};

function LabeledInput({ label, value, onChange }: LabeledInputProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-slate-300">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        value={Number.isNaN(value) ? "" : value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
      />
    </label>
  );
}
