"use client";

import { useState } from "react";

export type Benchmarks = {
  marketing: {
    leadToMql: number;
    mqlToSql: number;
    sqlToOpp: number;
    leadsPerMonth: number;
  };
  sales: {
    oppToProposal: number;
    proposalToWin: number;
    acv: number;
    salesCycleDays: number;
  };
  cs: {
    churnMonthly: number;
    expansionRate: number;
    nrr: number;
    grossMargin: number;
  };
  arr: {
    currentArr: number;
    arrTarget: number;
    timeframeWeeks: number;
    blendedCac: number;
  };
};

export const defaultBenchmarks: Benchmarks = {
  marketing: {
    leadToMql: 25,
    mqlToSql: 40,
    sqlToOpp: 35,
    leadsPerMonth: 1500,
  },
  sales: {
    oppToProposal: 35,
    proposalToWin: 25,
    acv: 50000,
    salesCycleDays: 90,
  },
  cs: {
    churnMonthly: 1,
    expansionRate: 20,
    nrr: 120,
    grossMargin: 75,
  },
  arr: {
    currentArr: 1500000,
    arrTarget: 2500000,
    timeframeWeeks: 52,
    blendedCac: 25000,
  },
};

type Props = {
  benchmarks: Benchmarks;
  onChange: (b: Benchmarks) => void;
};

export function BenchmarksPanel({ benchmarks, onChange }: Props) {
  const [open, setOpen] = useState(true);

  const handleNumberChange = (
    section: keyof Benchmarks,
    field: string,
    value: string
  ) => {
    const num = Number(value.replace(/\D/g, "")) || 0;
    onChange({
      ...benchmarks,
      [section]: {
        ...(benchmarks as any)[section],
        [field]: num,
      },
    });
  };

  return (
    <section className="rounded-3xl bg-slate-900/80 border border-slate-800 shadow-lg">
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-semibold">Benchmarks</h2>
          <p className="text-xs text-slate-400">
            These benchmarks drive colour-coding and run-rate comparisons across
            the dashboard.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:bg-slate-800"
        >
          {open ? "Hide benchmarks" : "Show benchmarks"}
        </button>
      </div>

      {open && (
        <div className="grid gap-6 p-4 md:grid-cols-4">
          {/* Marketing */}
          <div className="space-y-4 rounded-2xl bg-slate-950/40 p-4 border border-slate-800">
            <h3 className="text-sm font-semibold">Marketing</h3>
            <Field
              label="Leads per month"
              suffix=""
              value={benchmarks.marketing.leadsPerMonth}
              onChange={(v) => handleNumberChange("marketing", "leadsPerMonth", v)}
            />
            <Field
              label="Lead → MQL target"
              suffix="%"
              value={benchmarks.marketing.leadToMql}
              onChange={(v) => handleNumberChange("marketing", "leadToMql", v)}
            />
            <Field
              label="MQL → SQL target"
              suffix="%"
              value={benchmarks.marketing.mqlToSql}
              onChange={(v) => handleNumberChange("marketing", "mqlToSql", v)}
            />
            <Field
              label="SQL → Opp target"
              suffix="%"
              value={benchmarks.marketing.sqlToOpp}
              onChange={(v) => handleNumberChange("marketing", "sqlToOpp", v)}
            />
          </div>

          {/* Sales */}
          <div className="space-y-4 rounded-2xl bg-slate-950/40 p-4 border border-slate-800">
            <h3 className="text-sm font-semibold">Sales</h3>
            <Field
              label="Opp → Proposal target"
              suffix="%"
              value={benchmarks.sales.oppToProposal}
              onChange={(v) =>
                handleNumberChange("sales", "oppToProposal", v)
              }
            />
            <Field
              label="Proposal → Win target"
              suffix="%"
              value={benchmarks.sales.proposalToWin}
              onChange={(v) =>
                handleNumberChange("sales", "proposalToWin", v)
              }
            />
            <Field
              label="ACV target"
              suffix="€"
              value={benchmarks.sales.acv}
              onChange={(v) => handleNumberChange("sales", "acv", v)}
            />
            <Field
              label="Sales cycle"
              suffix="days"
              value={benchmarks.sales.salesCycleDays}
              onChange={(v) =>
                handleNumberChange("sales", "salesCycleDays", v)
              }
            />
          </div>

          {/* Customer Success */}
          <div className="space-y-4 rounded-2xl bg-slate-950/40 p-4 border border-slate-800">
            <h3 className="text-sm font-semibold">Customer Success</h3>
            <Field
              label="Monthly churn target"
              suffix="%"
              value={benchmarks.cs.churnMonthly}
              onChange={(v) =>
                handleNumberChange("cs", "churnMonthly", v)
              }
            />
            <Field
              label="Expansion target"
              suffix="%"
              value={benchmarks.cs.expansionRate}
              onChange={(v) =>
                handleNumberChange("cs", "expansionRate", v)
              }
            />
            <Field
              label="NRR target"
              suffix="%"
              value={benchmarks.cs.nrr}
              onChange={(v) => handleNumberChange("cs", "nrr", v)}
            />
            <Field
              label="Gross margin target"
              suffix="%"
              value={benchmarks.cs.grossMargin}
              onChange={(v) =>
                handleNumberChange("cs", "grossMargin", v)
              }
            />
          </div>

          {/* ARR Target / CAC */}
          <div className="space-y-4 rounded-2xl bg-slate-950/40 p-4 border border-slate-800">
            <h3 className="text-sm font-semibold">ARR Target</h3>
            <Field
              label="Current ARR"
              suffix="€"
              value={benchmarks.arr.currentArr}
              onChange={(v) =>
                handleNumberChange("arr", "currentArr", v)
              }
            />
            <Field
              label="ARR target"
              suffix="€"
              value={benchmarks.arr.arrTarget}
              onChange={(v) =>
                handleNumberChange("arr", "arrTarget", v)
              }
            />
            <Field
              label="Timeframe"
              suffix="weeks"
              value={benchmarks.arr.timeframeWeeks}
              onChange={(v) =>
                handleNumberChange("arr", "timeframeWeeks", v)
              }
            />
            <Field
              label="Blended CAC target"
              suffix="€"
              value={benchmarks.arr.blendedCac}
              onChange={(v) =>
                handleNumberChange("arr", "blendedCac", v)
              }
            />
          </div>
        </div>
      )}
    </section>
  );
}

type FieldProps = {
  label: string;
  suffix: string;
  value: number;
  onChange: (v: string) => void;
};

function Field({ label, suffix, value, onChange }: FieldProps) {
  return (
    <label className="block text-xs text-slate-300 space-y-1">
      <span>{label}</span>
      <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm">
        <input
          className="flex-1 bg-transparent outline-none text-slate-50"
          value={value.toString()}
          onChange={(e) => onChange(e.target.value)}
        />
        {suffix && (
          <span className="ml-2 text-slate-500 text-xs">{suffix}</span>
        )}
      </div>
    </label>
  );
}
