"use client";

import React from "react";

export type Currency = "EUR" | "USD" | "GBP";

export type BenchmarksState = {
  // Marketing
  leadToMql: number;
  mqlToSql: number;
  sqlToOppMarketing: number;
  blendedCAC: number;

  // Sales
  sqlToOppSales: number;
  oppToProposal: number;
  proposalToWin: number;
  acv: number;

  // Customer Success
  monthlyChurn: number;
  expansion: number;
  nrr: number;
  grossMargin: number;

  // ARR target
  currentArr: number;
  arrTarget: number;
  timeframeWeeks: number;
  currency: Currency;
};

export const defaultBenchmarks: BenchmarksState = {
  // Marketing
  leadToMql: 25,
  mqlToSql: 40,
  sqlToOppMarketing: 35,
  blendedCAC: 25000,

  // Sales
  sqlToOppSales: 35,
  oppToProposal: 50,
  proposalToWin: 25,
  acv: 50000,

  // Customer Success
  monthlyChurn: 1,
  expansion: 20,
  nrr: 120,
  grossMargin: 75,

  // ARR Target
  currentArr: 1500000,
  arrTarget: 2500000,
  timeframeWeeks: 52,
  currency: "EUR",
};

type Props = {
  benchmarks: BenchmarksState;
  onChange: (value: BenchmarksState) => void;
  onHide: () => void;
  onRun: () => void;
};

export default function BenchmarksPanel({
  benchmarks,
  onChange,
  onHide,
  onRun,
}: Props) {
  const handleNumberChange = (
    key: keyof BenchmarksState,
    value: string
  ): void => {
    const numeric = Number(value.replace(/[^0-9.]/g, ""));
    onChange({ ...benchmarks, [key]: isNaN(numeric) ? 0 : numeric });
  };

  const setCurrency = (currency: Currency) => {
    onChange({ ...benchmarks, currency });
  };

  return (
    <section className="relative rounded-3xl bg-slate-900/80 p-6 shadow-xl ring-1 ring-slate-800">
      {/* Top row */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Benchmarks</h2>
          <p className="text-xs text-slate-400">
            These benchmarks drive colour-coding and run-rate comparisons across
            the dashboard.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Currency toggle */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Display currency:</span>
            <div className="flex rounded-full bg-slate-800 p-1">
              {(["EUR", "USD", "GBP"] as Currency[]).map((cur) => {
                const isActive = benchmarks.currency === cur;
                return (
                  <button
                    key={cur}
                    type="button"
                    onClick={() => setCurrency(cur)}
                    className={
                      "rounded-full px-3 py-1 text-xs font-medium transition " +
                      (isActive
                        ? "bg-sky-500 text-white"
                        : "text-slate-300 hover:bg-slate-700")
                    }
                  >
                    {cur}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={onHide}
            className="rounded-full border border-slate-700 px-4 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800"
          >
            Hide benchmarks
          </button>
        </div>
      </div>

      {/* Four columns: Marketing / Sales / CS / ARR */}
      <div className="grid gap-6 md:grid-cols-4">
        {/* Marketing */}
        <Card title="Marketing">
          <Field
            label="Lead → MQL target"
            suffix="%"
            value={benchmarks.leadToMql}
            onChange={(v) => handleNumberChange("leadToMql", v)}
          />
          <Field
            label="MQL → SQL target"
            suffix="%"
            value={benchmarks.mqlToSql}
            onChange={(v) => handleNumberChange("mqlToSql", v)}
          />
          <Field
            label="SQL → Opp target"
            suffix="%"
            value={benchmarks.sqlToOppMarketing}
            onChange={(v) => handleNumberChange("sqlToOppMarketing", v)}
          />
          <Field
            label="Blended CAC target"
            suffix={currencySymbol(benchmarks.currency)}
            value={benchmarks.blendedCAC}
            onChange={(v) => handleNumberChange("blendedCAC", v)}
          />
        </Card>

        {/* Sales */}
        <Card title="Sales">
          <Field
            label="SQL → Opp target"
            suffix="%"
            value={benchmarks.sqlToOppSales}
            onChange={(v) => handleNumberChange("sqlToOppSales", v)}
          />
          <Field
            label="Opp → Proposal target"
            suffix="%"
            value={benchmarks.oppToProposal}
            onChange={(v) => handleNumberChange("oppToProposal", v)}
          />
          <Field
            label="Proposal → Win target"
            suffix="%"
            value={benchmarks.proposalToWin}
            onChange={(v) => handleNumberChange("proposalToWin", v)}
          />
          <Field
            label="ACV target"
            suffix={currencySymbol(benchmarks.currency)}
            value={benchmarks.acv}
            onChange={(v) => handleNumberChange("acv", v)}
          />
        </Card>

        {/* Customer Success */}
        <Card title="Customer Success">
          <Field
            label="Monthly churn target"
            suffix="%"
            value={benchmarks.monthlyChurn}
            onChange={(v) => handleNumberChange("monthlyChurn", v)}
          />
          <Field
            label="Expansion target"
            suffix="%"
            value={benchmarks.expansion}
            onChange={(v) => handleNumberChange("expansion", v)}
          />
          <Field
            label="NRR target"
            suffix="%"
            value={benchmarks.nrr}
            onChange={(v) => handleNumberChange("nrr", v)}
          />
          <Field
            label="Gross margin target"
            suffix="%"
            value={benchmarks.grossMargin}
            onChange={(v) => handleNumberChange("grossMargin", v)}
          />
        </Card>

        {/* ARR Target */}
        <Card title="ARR Target">
          <Field
            label="Current ARR"
            suffix={currencySymbol(benchmarks.currency)}
            value={benchmarks.currentArr}
            onChange={(v) => handleNumberChange("currentArr", v)}
          />
          <Field
            label="ARR target"
            suffix={currencySymbol(benchmarks.currency)}
            value={benchmarks.arrTarget}
            onChange={(v) => handleNumberChange("arrTarget", v)}
          />
          <Field
            label="Timeframe"
            suffix="weeks"
            value={benchmarks.timeframeWeeks}
            onChange={(v) => handleNumberChange("timeframeWeeks", v)}
          />
        </Card>
      </div>

      {/* Run analysis */}
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onRun}
          className="rounded-xl bg-sky-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-sky-400"
        >
          Run analysis
        </button>
      </div>
    </section>
  );
}

type CardProps = {
  title: string;
  children: React.ReactNode;
};

function Card({ title, children }: CardProps) {
  return (
    <div className="rounded-2xl bg-slate-950/60 p-4 ring-1 ring-slate-800">
      <h3 className="mb-3 text-sm font-semibold text-slate-100">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

type FieldProps = {
  label: string;
  suffix?: string;
  value: number;
  onChange: (val: string) => void;
};

function Field({ label, suffix, value, onChange }: FieldProps) {
  return (
    <label className="block text-xs">
      <span className="mb-1 block text-slate-400">{label}</span>
      <div className="flex items-center rounded-xl bg-slate-900 px-3 py-2 ring-1 ring-slate-700 focus-within:ring-sky-500">
        <input
          className="flex-1 bg-transparent text-sm text-slate-50 outline-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {suffix && (
          <span className="ml-2 text-xs text-slate-400">{suffix}</span>
        )}
      </div>
    </label>
  );
}

function currencySymbol(currency: Currency): string {
  switch (currency) {
    case "EUR":
      return "€";
    case "USD":
      return "$";
    case "GBP":
      return "£";
    default:
      return "";
  }
}
