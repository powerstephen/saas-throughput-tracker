"use client";

import React from "react";

export type Benchmarks = {
  revenue: {
    currentArr: number;
    arrTarget: number;
    timeframeWeeks: number;
    blendedCacTarget: number;
  };
  marketing: {
    leadToMql: number;
    mqlToSql: number;
    sqlToOpp: number;
  };
  sales: {
    oppToProposal: number;
    proposalToWin: number;
  };
  cs: {
    nrr: number;
    grossMargin: number;
  };
};

type Props = {
  benchmarks: Benchmarks;
  onBenchmarksChange: (b: Benchmarks) => void;
};

export function BenchmarksPanel({
  benchmarks,
  onBenchmarksChange,
}: Props) {
  const { revenue, marketing, sales, cs } = benchmarks;

  const handleChange = (
    section: keyof Benchmarks,
    field: string,
    value: string
  ) => {
    const num = Number(value) || 0;
    const updated: Benchmarks = JSON.parse(
      JSON.stringify(benchmarks)
    );

    // @ts-ignore simple nested assignment
    updated[section][field] = num;
    onBenchmarksChange(updated);
  };

  return (
    <section className="border border-slate-800 rounded-2xl bg-slate-900/80 shadow-lg p-4 space-y-4">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
          Benchmark Settings
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Set your guardrails for ARR, CAC, funnel conversion, and
          Customer Success. The main dashboard compares actuals
          against these targets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Revenue benchmarks */}
        <div className="border border-slate-800 rounded-2xl bg-slate-950/40 p-3 space-y-2">
          <h3 className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-300">
            Revenue
          </h3>
          <NumberField
            label="Current ARR (€)"
            value={revenue.currentArr}
            onChange={(v) =>
              handleChange("revenue", "currentArr", v)
            }
          />
          <NumberField
            label="ARR target (€)"
            value={revenue.arrTarget}
            onChange={(v) =>
              handleChange("revenue", "arrTarget", v)
            }
          />
          <NumberField
            label="Timeframe (weeks)"
            value={revenue.timeframeWeeks}
            onChange={(v) =>
              handleChange("revenue", "timeframeWeeks", v)
            }
          />
          <NumberField
            label="Blended CAC target (€)"
            value={revenue.blendedCacTarget}
            onChange={(v) =>
              handleChange("revenue", "blendedCacTarget", v)
            }
          />
        </div>

        {/* Marketing conversion */}
        <div className="border border-slate-800 rounded-2xl bg-slate-950/40 p-3 space-y-2">
          <h3 className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-300">
            Marketing Funnel
          </h3>
          <NumberField
            label="Lead → MQL (%)"
            value={marketing.leadToMql}
            onChange={(v) =>
              handleChange("marketing", "leadToMql", v)
            }
          />
          <NumberField
            label="MQL → SQL (%)"
            value={marketing.mqlToSql}
            onChange={(v) =>
              handleChange("marketing", "mqlToSql", v)
            }
          />
          <NumberField
            label="SQL → Opp (%)"
            value={marketing.sqlToOpp}
            onChange={(v) =>
              handleChange("marketing", "sqlToOpp", v)
            }
          />
        </div>

        {/* Sales funnel */}
        <div className="border border-slate-800 rounded-2xl bg-slate-950/40 p-3 space-y-2">
          <h3 className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-300">
            Sales Funnel
          </h3>
          <NumberField
            label="Opp → Proposal (%)"
            value={sales.oppToProposal}
            onChange={(v) =>
              handleChange("sales", "oppToProposal", v)
            }
          />
          <NumberField
            label="Proposal → Win (%)"
            value={sales.proposalToWin}
            onChange={(v) =>
              handleChange("sales", "proposalToWin", v)
            }
          />
        </div>

        {/* CS */}
        <div className="border border-slate-800 rounded-2xl bg-slate-950/40 p-3 space-y-2">
          <h3 className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-300">
            Customer Success
          </h3>
          <NumberField
            label="NRR target (%)"
            value={cs.nrr}
            onChange={(v) =>
              handleChange("cs", "nrr", v)
            }
          />
          <NumberField
            label="Gross margin (%)"
            value={cs.grossMargin}
            onChange={(v) =>
              handleChange("cs", "grossMargin", v)
            }
          />
        </div>
      </div>
    </section>
  );
}

type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (val: string) => void;
};

function NumberField({
  label,
  value,
  onChange,
}: NumberFieldProps) {
  return (
    <label className="block text-[0.7rem] text-slate-300 space-y-1">
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
