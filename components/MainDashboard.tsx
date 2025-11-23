"use client";

import React, { useState } from "react";
import BenchmarksPanel, { Benchmarks } from "./BenchmarksPanel";

type PeriodLabel = "Last month" | "Last quarter" | "Last year" | "Custom";

type Actuals = {
  periodLabel: PeriodLabel;
  periodWeeks: number;
  marketing: {
    leads: number;
    leadsToMql: number;
    mqlToSql: number;
  };
  sales: {
    sqlToOpp: number;
    oppToProp: number;
    propToWin: number;
  };
  revenue: {
    newArrThisPeriod: number;
  };
};

type FunnelStageKey =
  | "leadsToMql"
  | "mqlToSql"
  | "sqlToOpp"
  | "oppToProp"
  | "propToWin";

type FunnelStageMeta = {
  key: FunnelStageKey;
  label: string;
  section: "marketing" | "sales";
};

const STAGES: FunnelStageMeta[] = [
  { key: "leadsToMql", label: "Leads → MQL", section: "marketing" },
  { key: "mqlToSql", label: "MQL → SQL", section: "marketing" },
  { key: "sqlToOpp", label: "SQL → Opp", section: "sales" },
  { key: "oppToProp", label: "Opp → Proposal", section: "sales" },
  { key: "propToWin", label: "Proposal → Win", section: "sales" },
];

function safeDiv(a: number, b: number) {
  if (!b || Number.isNaN(a) || Number.isNaN(b)) return 0;
  return a / b;
}

export default function MainDashboard() {
  const [benchmarks, setBenchmarks] = useState<Benchmarks>({
    marketing: {
      leadsToMql: 30,
      mqlToSql: 40,
    },
    sales: {
      sqlToOpp: 60,
      oppToProp: 50,
      propToWin: 25,
    },
    cs: {
      nrrTarget: 110,
    },
    revenue: {
      currentArr: 2000000,
      targetArr: 3500000,
      timeframeWeeks: 26,
    },
  });

  const [includeCs, setIncludeCs] = useState(false);
  const [showBenchmarks, setShowBenchmarks] = useState(true);

  const [actuals, setActuals] = useState<Actuals>({
    periodLabel: "Last quarter",
    periodWeeks: 13,
    marketing: {
      leads: 1200,
      leadsToMql: 28,
      mqlToSql: 35,
    },
    sales: {
      sqlToOpp: 55,
      oppToProp: 40,
      propToWin: 20,
    },
    revenue: {
      newArrThisPeriod: 400000,
    },
  });

  // ---------- Derived metrics ----------

  const {
    requiredNewArrTotal,
    requiredNewArrPerWeek,
    actualNewArrPerWeek,
    actualNewArrPerMonth,
    requiredNewArrPerMonth,
  } = computeArrRunRate(benchmarks, actuals, includeCs);

  const {
    bottleneckLabel,
    bottleneckActual,
    bottleneckTarget,
    stagesWithDiff,
  } = computeBottleneck(benchmarks, actuals);

  const {
    winsPerLeadBenchmark,
    estimatedWinsPerLeadActual,
    requiredLeadsTotal,
    requiredLeadsPerWeek,
    currentLeadsPerWeek,
  } = computeLeadRequirements(benchmarks, actuals, requiredNewArrTotal);

  return (
    <div className="space-y-6">
      {/* Heading */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-50">
          SaaS Throughput and ARR Path
        </h1>
        <p className="text-sm text-slate-400">
          Compare your current funnel performance to benchmarks, see your ARR
          run rate versus target, and understand how many leads you need to hit
          your goal.
        </p>
      </header>

      {/* Benchmarks */}
      <BenchmarksPanel
        benchmarks={benchmarks}
        onChange={setBenchmarks}
        show={showBenchmarks}
        onToggleShow={() => setShowBenchmarks((v) => !v)}
      />

      {/* Actuals input card */}
      <section className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Funnel and ARR performance for a recent period
            </h2>
            <p className="text-xs text-slate-400">
              Use a recent period such as last month or last quarter. These
              numbers are compared to your benchmarks and used to estimate your
              run rate.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs text-slate-300 flex flex-col">
              Period label
              <select
                className="mt-1 bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs"
                value={actuals.periodLabel}
                onChange={(e) =>
                  setActuals((prev) => ({
                    ...prev,
                    periodLabel: e.target.value as PeriodLabel,
                  }))
                }
              >
                <option>Last month</option>
                <option>Last quarter</option>
                <option>Last year</option>
                <option>Custom</option>
              </select>
            </label>

            <label className="text-xs text-slate-300 flex flex-col">
              Period length (weeks)
              <input
                type="number"
                className="mt-1 bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs"
                value={actuals.periodWeeks}
                onChange={(e) =>
                  setActuals((prev) => ({
                    ...prev,
                    periodWeeks: Number(e.target.value) || 1,
                  }))
                }
                min={1}
              />
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-300 mt-1">
              <input
                type="checkbox"
                checked={includeCs}
                onChange={(e) => setIncludeCs(e.target.checked)}
              />
              Include Customer Success (NRR) in ARR path
            </label>
          </div>
        </div>

        {/* Actuals inputs: Marketing + Sales + Revenue */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Marketing actuals */}
          <div>
            <h3 className="text-xs font-semibold text-slate-200 mb-2">
              Marketing actuals
            </h3>
            <div className="space-y-2">
              <Field
                label="No. of leads"
                value={actuals.marketing.leads}
                onChange={(v) =>
                  setActuals((prev) => ({
                    ...prev,
                    marketing: { ...prev.marketing, leads: v },
                  }))
                }
              />
              <Field
                label="Leads → MQL (%)"
                value={actuals.marketing.leadsToMql}
                onChange={(v) =>
                  setActuals((prev) => ({
                    ...prev,
                    marketing: { ...prev.marketing, leadsToMql: v },
                  }))
                }
              />
              <Field
                label="MQL → SQL (%)"
                value={actuals.marketing.mqlToSql}
                onChange={(v) =>
                  setActuals((prev) => ({
                    ...prev,
                    marketing: { ...prev.marketing, mqlToSql: v },
                  }))
                }
              />
            </div>
          </div>

          {/* Sales actuals */}
          <div>
            <h3 className="text-xs font-semibold text-slate-200 mb-2">
              Sales actuals
            </h3>
            <div className="space-y-2">
              <Field
                label="SQL → Opp (%)"
                value={actuals.sales.sqlToOpp}
                onChange={(v) =>
                  setActuals((prev) => ({
                    ...prev,
                    sales: { ...prev.sales, sqlToOpp: v },
                  }))
                }
              />
              <Field
                label="Opp → Proposal (%)"
                value={actuals.sales.oppToProp}
                onChange={(v) =>
                  setActuals((prev) => ({
                    ...prev,
                    sales: { ...prev.sales, oppToProp: v },
                  }))
                }
              />
              <Field
                label="Proposal → Win (%)"
                value={actuals.sales.propToWin}
                onChange={(v) =>
                  setActuals((prev) => ({
                    ...prev,
                    sales: { ...prev.sales, propToWin: v },
                  }))
                }
              />
            </div>
          </div>

          {/* Revenue actuals */}
          <div>
            <h3 className="text-xs font-semibold text-slate-200 mb-2">
              New ARR for this period
            </h3>
            <div className="space-y-2">
              <Field
                label={`New ARR in ${actuals.periodLabel} (€)`}
                value={actuals.revenue.newArrThisPeriod}
                onChange={(v) =>
                  setActuals((prev) => ({
                    ...prev,
                    revenue: { ...prev.revenue, newArrThisPeriod: v },
                  }))
                }
              />
              <ReadOnlyField
                label="New ARR per week (€)"
                value={actualNewArrPerWeek}
              />
              <ReadOnlyField
                label="New ARR per month (approx, €)"
                value={actualNewArrPerMonth}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Results: overview cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ARR overview */}
        <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 space-y-2">
          <h3 className="text-sm font-semibold text-slate-100">
            ARR run rate versus target
          </h3>
          <p className="text-xs text-slate-400">
            Based on your new ARR in {actuals.periodLabel} and the timeframe to
            reach your target.
          </p>
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-300">Target new ARR needed</span>
              <span className="font-medium">
                €{Math.round(requiredNewArrTotal).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Required ARR / week</span>
              <span className="font-medium">
                €{Math.round(requiredNewArrPerWeek).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">
                Required ARR / month (approx)
              </span>
              <span className="font-medium">
                €{Math.round(requiredNewArrPerMonth).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-800 mt-2">
              <span className="text-slate-300">
                Current ARR / month (approx)
              </span>
              <span className="font-medium">
                €{Math.round(actualNewArrPerMonth).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Bottleneck card */}
        <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 space-y-2">
          <h3 className="text-sm font-semibold text-slate-100">
            Funnel bottleneck versus benchmarks
          </h3>
          {bottleneckLabel ? (
            <>
              <p className="text-xs text-slate-400">
                This is the weakest conversion step compared to your own
                targets.
              </p>
              <div className="mt-2 text-sm space-y-1">
                <div>
                  <span className="text-slate-300">Stage</span>
                  <div className="font-medium">{bottleneckLabel}</div>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Actual rate</span>
                  <span className="font-medium">
                    {bottleneckActual.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Target rate</span>
                  <span className="font-medium">
                    {bottleneckTarget.toFixed(1)}%
                  </span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-400">
              All stages are close to or above benchmark. In this case, the main
              lever is usually top of funnel volume and NRR.
            </p>
          )}
        </div>

        {/* Lead requirements card */}
        <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 space-y-2">
          <h3 className="text-sm font-semibold text-slate-100">
            Lead volume required to hit target
          </h3>
          <p className="text-xs text-slate-400">
            Based on your target ARR, timeframe, benchmark conversion rates, and
            estimated deal size.
          </p>
          {winsPerLeadBenchmark > 0 && requiredLeadsTotal > 0 ? (
            <div className="mt-2 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-300">Required leads (period)</span>
                <span className="font-medium">
                  {Math.round(requiredLeadsTotal).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Required leads / week</span>
                <span className="font-medium">
                  {requiredLeadsPerWeek.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 mt-2">
                <span className="text-slate-300">
                  Current leads / week (this period)
                </span>
                <span className="font-medium">
                  {currentLeadsPerWeek.toFixed(1)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 mt-2">
              To calculate required leads, we need positive benchmark conversion
              rates and some signal of deal size. Try entering a non-zero target
              ARR, timeframe, and new ARR for this period.
            </p>
          )}
        </div>
      </section>

      {/* Funnel stage comparison list */}
      <section className="bg-slate-900/80 border border-slate-700 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-slate-100 mb-2">
          Funnel performance versus targets
        </h3>
        <p className="text-xs text-slate-400 mb-3">
          Quick view of how each conversion step compares to your benchmarks.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          {stagesWithDiff.map((stage) => (
            <div
              key={stage.label}
              className="border border-slate-700 rounded-lg p-2 bg-slate-950/60"
            >
              <div className="font-semibold text-slate-100">
                {stage.label}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-slate-400">Actual</span>
                <span className="font-medium">
                  {stage.actual.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target</span>
                <span className="font-medium">
                  {stage.target.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-slate-400">Gap</span>
                <span
                  className={
                    stage.diff >= 0
                      ? "text-emerald-400 font-medium"
                      : "text-rose-400 font-medium"
                  }
                >
                  {stage.diff >= 0 ? "+" : ""}
                  {stage.diff.toFixed(1)} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ---------- Helper components ----------

type FieldProps = {
  label: string;
  value: number;
  onChange: (v: number) => void;
};

function Field({ label, value, onChange }: FieldProps) {
  return (
    <label className="flex flex-col gap-1 text-xs text-slate-300">
      <span>{label}</span>
      <input
        type="number"
        inputMode="decimal"
        value={Number.isNaN(value) ? "" : value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
      />
    </label>
  );
}

type ReadOnlyFieldProps = {
  label: string;
  value: number;
};

function ReadOnlyField({ label, value }: ReadOnlyFieldProps) {
  return (
    <div className="flex flex-col gap-1 text-xs text-slate-300">
      <span>{label}</span>
      <div className="bg-slate-950 border border-slate-800 rounded-md px-2 py-1 text-xs text-slate-100">
        €{Math.round(value).toLocaleString()}
      </div>
    </div>
  );
}

// ---------- Calculation helpers ----------

function computeArrRunRate(
  benchmarks: Benchmarks,
  actuals: Actuals,
  includeCs: boolean
) {
  const { currentArr, targetArr, timeframeWeeks } = benchmarks.revenue;
  const { newArrThisPeriod } = actuals.revenue;
  const weeks = actuals.periodWeeks || 1;

  const actualNewArrPerWeek = safeDiv(newArrThisPeriod, weeks);
  const actualNewArrPerMonth = actualNewArrPerWeek * 4.33;

  let requiredNewArrTotal = Math.max(targetArr - currentArr, 0);

  if (includeCs && benchmarks.cs.nrrTarget > 0) {
    const nrrFactor = benchmarks.cs.nrrTarget / 100;
    const yearFraction = timeframeWeeks / 52;
    const baseGrowthFromNrr = currentArr * (nrrFactor - 1) * yearFraction;
    requiredNewArrTotal = Math.max(
      targetArr - (currentArr + baseGrowthFromNrr),
      0
    );
  }

  const requiredNewArrPerWeek = safeDiv(requiredNewArrTotal, timeframeWeeks || 1);
  const requiredNewArrPerMonth = requiredNewArrPerWeek * 4.33;

  return {
    requiredNewArrTotal,
    requiredNewArrPerWeek,
    requiredNewArrPerMonth,
    actualNewArrPerWeek,
    actualNewArrPerMonth,
  };
}

function computeBottleneck(benchmarks: Benchmarks, actuals: Actuals) {
  const stageDiffs: {
    key: FunnelStageKey;
    label: string;
    actual: number;
    target: number;
    diff: number;
  }[] = [];

  STAGES.forEach((stage) => {
    let actualRate = 0;
    let targetRate = 0;

    if (stage.section === "marketing") {
      if (stage.key === "leadsToMql") {
        actualRate = actuals.marketing.leadsToMql;
        targetRate = benchmarks.marketing.leadsToMql;
      } else if (stage.key === "mqlToSql") {
        actualRate = actuals.marketing.mqlToSql;
        targetRate = benchmarks.marketing.mqlToSql;
      }
    } else {
      if (stage.key === "sqlToOpp") {
        actualRate = actuals.sales.sqlToOpp;
        targetRate = benchmarks.sales.sqlToOpp;
      } else if (stage.key === "oppToProp") {
        actualRate = actuals.sales.oppToProp;
        targetRate = benchmarks.sales.oppToProp;
      } else if (stage.key === "propToWin") {
        actualRate = actuals.sales.propToWin;
        targetRate = benchmarks.sales.propToWin;
      }
    }

    const diff = actualRate - targetRate;

    stageDiffs.push({
      key: stage.key,
      label: stage.label,
      actual: actualRate,
      target: targetRate,
      diff,
    });
  });

  const sorted = stageDiffs
    .filter((s) => s.target > 0)
    .sort((a, b) => a.diff - b.diff);

  const worst = sorted[0];

  return {
    bottleneckLabel: worst && worst.diff < 0 ? worst.label : "",
    bottleneckActual: worst && worst.diff < 0 ? worst.actual : 0,
    bottleneckTarget: worst && worst.diff < 0 ? worst.target : 0,
    stagesWithDiff: stageDiffs,
  };
}

function computeLeadRequirements(
  benchmarks: Benchmarks,
  actuals: Actuals,
  requiredNewArrTotal: number
) {
  // Use funnel chain to estimate wins per lead at benchmark level
  const chainBenchmark =
    (benchmarks.marketing.leadsToMql / 100 || 0) *
    (benchmarks.marketing.mqlToSql / 100 || 0) *
    (benchmarks.sales.sqlToOpp / 100 || 0) *
    (benchmarks.sales.oppToProp / 100 || 0) *
    (benchmarks.sales.propToWin / 100 || 0);

  const winsPerLeadBenchmark = chainBenchmark;

  // Estimate current wins per lead using actual funnel
  const chainActual =
    (actuals.marketing.leadsToMql / 100 || 0) *
    (actuals.marketing.mqlToSql / 100 || 0) *
    (actuals.sales.sqlToOpp / 100 || 0) *
    (actuals.sales.oppToProp / 100 || 0) *
    (actuals.sales.propToWin / 100 || 0);

  const estimatedWinsPerLeadActual = chainActual;

  // Estimate average deal size from actuals if possible
  let avgDealSize = 0;
  const estimatedWinsThisPeriod =
    actuals.marketing.leads * estimatedWinsPerLeadActual;

  if (estimatedWinsThisPeriod > 0) {
    avgDealSize = safeDiv(
      actuals.revenue.newArrThisPeriod,
      estimatedWinsThisPeriod
    );
  }

  let requiredLeadsTotal = 0;
  let requiredLeadsPerWeek = 0;

  if (requiredNewArrTotal > 0 && winsPerLeadBenchmark > 0 && avgDealSize > 0) {
    const requiredWins = safeDiv(requiredNewArrTotal, avgDealSize);
    requiredLeadsTotal = safeDiv(requiredWins, winsPerLeadBenchmark);
    requiredLeadsPerWeek = safeDiv(
      requiredLeadsTotal,
      benchmarks.revenue.timeframeWeeks || 1
    );
  }

  const currentLeadsPerWeek = safeDiv(
    actuals.marketing.leads,
    actuals.periodWeeks || 1
  );

  return {
    winsPerLeadBenchmark,
    estimatedWinsPerLeadActual,
    requiredLeadsTotal,
    requiredLeadsPerWeek,
    currentLeadsPerWeek,
  };
}
