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
    nrrTarget: number;
  };
  revenue: {
    currentArr: number;
    targetArr: number;
    timeframeWeeks: number;
    avgDealSizeTarget: number; // ACV benchmark
  };
};

type Props = {
  benchmarks: Benchmarks;
  onChange: (b: Benchmarks) => void;
  show: boolean;
  onToggleShow: () => void;
};

export default function BenchmarksPanel({
  benchmarks,
  onChange,
  show,
  onToggleShow,
}: Props) {
  const handleChange =
    (path: (string | number)[]) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value) || 0;
      onChange(updateNested(benchmarks, path, value));
    };

  return (
    <section className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            Benchmarks and targets
          </h2>
          <p className="text-xs text-slate-400">
            Set your own benchmark conversion rates and ARR targets. These act as
            the “ideal state” the calculator compares your recent performance against.
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleShow}
          className="text-xs px-2 py-1 rounded border border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-200"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>

      {show && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 text-xs">
          {/* Marketing benchmarks */}
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-200">Marketing</h3>
            <Field
              label="Leads → MQL (%)"
              value={benchmarks.marketing.leadsToMql}
              onChange={handleChange(["marketing", "leadsToMql"])}
            />
            <Field
              label="MQL → SQL (%)"
              value={benchmarks.marketing.mqlToSql}
              onChange={handleChange(["marketing", "mqlToSql"])}
            />
          </div>

          {/* Sales benchmarks */}
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-200">Sales</h3>
            <Field
              label="SQL → Opp (%)"
              value={benchmarks.sales.sqlToOpp}
              onChange={handleChange(["sales", "sqlToOpp"])}
            />
            <Field
              label="Opp → Proposal (%)"
              value={benchmarks.sales.oppToProp}
              onChange={handleChange(["sales", "oppToProp"])}
            />
            <Field
              label="Proposal → Win (%)"
              value={benchmarks.sales.propToWin}
              onChange={handleChange(["sales", "propToWin"])}
            />
          </div>

          {/* CS benchmarks */}
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-200">Customer Success</h3>
            <Field
              label="NRR target (%)"
              value={benchmarks.cs.nrrTarget}
              onChange={handleChange(["cs", "nrrTarget"])}
              helper="e.g. 110% for strong net retention"
            />
          </div>

          {/* Revenue benchmarks */}
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-200">Revenue</h3>
            <Field
              label="Current ARR (€)"
              value={benchmarks.revenue.currentArr}
              onChange={handleChange(["revenue", "currentArr"])}
            />
            <Field
              label="Target ARR (€)"
              value={benchmarks.revenue.targetArr}
              onChange={handleChange(["revenue", "targetArr"])}
            />
            <Field
              label="Time to target (weeks)"
              value={benchmarks.revenue.timeframeWeeks}
              onChange={handleChange(["revenue", "timeframeWeeks"])}
              helper="e.g. 26 weeks ≈ 6 months"
            />
            <Field
              label="Target ACV (€)"
              value={benchmarks.revenue.avgDealSizeTarget}
              onChange={handleChange(["revenue", "avgDealSizeTarget"])}
              helper="Benchmark average contract value"
            />
          </div>
        </div>
      )}
    </section>
  );
}

type FieldProps = {
  label: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  helper?: string;
};

function Field({ label, value, onChange, helper }: FieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-slate-200">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        className="bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
        value={Number.isNaN(value) ? "" : value}
        onChange={onChange}
      />
      {helper && <span className="text-[10px] text-slate-500">{helper}</span>}
    </label>
  );
}

// small immutable update helper
function updateNested<T>(obj: T, path: (string | number)[], value: number): T {
  if (path.length === 0) return obj;
  const [head, ...rest] = path;
  return {
    ...(obj as any),
    [head]:
      rest.length === 0
        ? value
        : updateNested((obj as any)[head], rest, value),
  } as T;
}
