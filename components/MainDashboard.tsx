"use client";

import React, { useMemo, useState } from "react";
import HeroCard from "./HeroCard";

export type Timeframe = 30 | 60 | 90;

export type Actuals = {
  timeframeDays: Timeframe;
  leads: number;
  mqls: number;
  sqls: number;
  opps: number;
  proposals: number;
  wins: number;
  newArr: number; // ARR closed in this timeframe
  acv: number; // auto-calculated from newArr / wins (if wins > 0)
};

export type Benchmarks = {
  currentArr: number;
  targetArr: number;
  timeframeWeeks: number;
  leadToMql: number;
  mqlToSql: number;
  sqlToOpp: number;
  oppToProposal: number;
  proposalToWin: number;
};

type ConversionBenchmark = {
  label: string;
  fromKey: keyof Actuals;
  toKey: keyof Actuals;
  targetRate: number;
};

type ScenarioApplyType =
  | { kind: "fixStage"; label: string; targetRate: number; actualRate: number }
  | { kind: "increaseLeads"; multiplier: number }
  | { kind: "increaseAcv"; multiplier: number };

type Scenario = {
  id: string;
  title: string;
  subtitle: string;
  impactLabel: string;
  impactDeltaArr: number;
  applyType: ScenarioApplyType;
};

type Props = {
  benchmarks: Benchmarks;
  actuals: Actuals;
  onActualsChange: (a: Actuals) => void;
  includeNrr: boolean;
  onIncludeNrrChange: (v: boolean) => void;
};

function computeBaseMetrics(
  actuals: Actuals,
  benchmarks: Benchmarks,
  includeNrr: boolean
) {
  const monthsInPeriod = actuals.timeframeDays / 30;
  const currentArr = benchmarks.currentArr;
  const targetArr = benchmarks.targetArr;
  const timeframeMonths = benchmarks.timeframeWeeks / 4.345; // rough

  const currentRunRateMonthly = actuals.newArr / (monthsInPeriod || 1);

  const forecastArr = currentArr + currentRunRateMonthly * timeframeMonths;

  const gapToTarget = forecastArr - targetArr;

  const requiredRunRateMonthly =
    targetArr <= currentArr
      ? 0
      : (targetArr - currentArr) / timeframeMonths;

  return {
    currentRunRateMonthly,
    forecastArr,
    gapToTarget,
    requiredRunRateMonthly,
    targetArr
  };
}

const conversionBenchmarks = (benchmarks: Benchmarks): ConversionBenchmark[] => [
  {
    label: "Leads → MQL",
    fromKey: "leads",
    toKey: "mqls",
    targetRate: benchmarks.leadToMql
  },
  {
    label: "MQL → SQL",
    fromKey: "mqls",
    toKey: "sqls",
    targetRate: benchmarks.mqlToSql
  },
  {
    label: "SQL → Opp",
    fromKey: "sqls",
    toKey: "opps",
    targetRate: benchmarks.sqlToOpp
  },
  {
    label: "Opp → Proposal",
    fromKey: "opps",
    toKey: "proposals",
    targetRate: benchmarks.oppToProposal
  },
  {
    label: "Proposal → Win",
    fromKey: "proposals",
    toKey: "wins",
    targetRate: benchmarks.proposalToWin
  }
];

function buildScenarios(
  actuals: Actuals,
  benchmarks: Benchmarks
): Scenario[] {
  const convBenchmarks = conversionBenchmarks(benchmarks);
  const baseNewArr = actuals.newArr || 0;

  if (baseNewArr <= 0) return [];

  const underperformers: {
    label: string;
    actualRate: number;
    targetRate: number;
    impactDeltaArr: number;
  }[] = [];

  for (const bm of convBenchmarks) {
    const from = actuals[bm.fromKey] as number;
    const to = actuals[bm.toKey] as number;
    if (!from || from <= 0) continue;

    const actualRate = to / from;
    const targetRate = bm.targetRate;

    if (actualRate < targetRate && targetRate > 0) {
      const multiplier = targetRate / actualRate;
      const scenarioArr = baseNewArr * multiplier;
      const delta = scenarioArr - baseNewArr;

      underperformers.push({
        label: bm.label,
        actualRate,
        targetRate,
        impactDeltaArr: delta
      });
    }
  }

  underperformers.sort((a, b) => b.impactDeltaArr - a.impactDeltaArr);

  const scenarios: Scenario[] = [];

  const topStageScenarios = underperformers.slice(0, 3);
  for (const u of topStageScenarios) {
    scenarios.push({
      id: `fix-${u.label}`,
      title: `Fix ${u.label}`,
      subtitle: `Actual ${Math.round(
        u.actualRate * 100
      )}% vs target ${Math.round(u.targetRate * 100)}%`,
      impactLabel: `If this stage performs at target, ARR in this timeframe increases by approx. €${u.impactDeltaArr.toLocaleString()}.`,
      impactDeltaArr: u.impactDeltaArr,
      applyType: {
        kind: "fixStage",
        label: u.label,
        targetRate: u.targetRate,
        actualRate: u.actualRate
      }
    });
  }

  if (scenarios.length === 0) {
    const leadBoost20 = baseNewArr * 0.2;
    const acvBoost10 = baseNewArr * 0.1;

    scenarios.push(
      {
        id: "growth-leads-20",
        title: "Increase lead volume by 20%",
        subtitle: "Assumes conversion rates stay at current levels.",
        impactLabel: `Approx. +€${leadBoost20.toLocaleString()} ARR in this timeframe.`,
        impactDeltaArr: leadBoost20,
        applyType: { kind: "increaseLeads", multiplier: 1.2 }
      },
      {
        id: "growth-acv-10",
        title: "Increase ACV by 10%",
        subtitle:
          "Move up-market or improve pricing / packaging to capture more value per deal.",
        impactLabel: `Approx. +€${acvBoost10.toLocaleString()} ARR in this timeframe.`,
        impactDeltaArr: acvBoost10,
        applyType: { kind: "increaseAcv", multiplier: 1.1 }
      }
    );
  }

  return scenarios;
}

export default function MainDashboard({
  benchmarks,
  actuals,
  onActualsChange,
  includeNrr,
  onIncludeNrrChange
}: Props) {
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(
    null
  );

  // auto-calc ACV whenever wins + newArr change
  const derivedActuals = useMemo<Actuals>(() => {
    if (actuals.wins > 0) {
      return {
        ...actuals,
        acv: actuals.newArr / actuals.wins
      };
    }
    return actuals;
  }, [actuals]);

  const baseMetrics = computeBaseMetrics(
    derivedActuals,
    benchmarks,
    includeNrr
  );

  const scenarios = buildScenarios(derivedActuals, benchmarks);

  const activeMetrics = useMemo(() => {
    if (!activeScenario) return baseMetrics;

    let scenarioActuals: Actuals = { ...derivedActuals };

    if (activeScenario.applyType.kind === "increaseLeads") {
      scenarioActuals = {
        ...scenarioActuals,
        leads: Math.round(
          scenarioActuals.leads * activeScenario.applyType.multiplier
        ),
        newArr:
          scenarioActuals.newArr * activeScenario.applyType.multiplier
      };
    } else if (activeScenario.applyType.kind === "increaseAcv") {
      scenarioActuals = {
        ...scenarioActuals,
        acv: scenarioActuals.acv * activeScenario.applyType.multiplier,
        newArr:
          scenarioActuals.newArr * activeScenario.applyType.multiplier
      };
    } else if (activeScenario.applyType.kind === "fixStage") {
      scenarioActuals = {
        ...scenarioActuals,
        newArr:
          scenarioActuals.newArr + activeScenario.impactDeltaArr
      };
    }

    return computeBaseMetrics(scenarioActuals, benchmarks, includeNrr);
  }, [activeScenario, baseMetrics, derivedActuals, benchmarks, includeNrr]);

  const handleActualNumberChange = (
    field: keyof Actuals,
    value: string
  ) => {
    const num = Number(value);
    onActualsChange({
      ...actuals,
      [field]: isNaN(num) ? 0 : num
    });
  };

  const handleTimeframeChange = (value: string) => {
    const v = Number(value) as Timeframe;
    onActualsChange({
      ...actuals,
      timeframeDays: v
    });
  };

  const formatCurrency = (n: number) =>
    `€${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  const statusForGap = (gap: number) => {
    if (gap > 0) return { tone: "good" as const, label: "Ahead of target" };
    if (gap < 0) return { tone: "bad" as const, label: "Behind target" };
    return { tone: "neutral" as const, label: "Exactly on target" };
  };

  const gapStatus = statusForGap(activeMetrics.gapToTarget);

  return (
    <section className="space-y-6">
      {/* Funnel performance inputs */}
      <div className="rounded-2xl bg-slateCard p-4 shadow-lg shadow-black/40">
        <div className="mb-3 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">
              Funnel and ARR performance for a recent period
            </h2>
            <p className="mt-1 text-xs text-slate-300">
              Drop in last month, quarter, or 90-day performance. The model
              compares this against your benchmarks and ARR target.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-300">
              <span>Timeframe</span>
              <select
                value={actuals.timeframeDays}
                onChange={(e) => handleTimeframeChange(e.target.value)}
                className="rounded-md border border-slate-700 bg-slateBg px-2 py-1 text-xs"
              >
                <option value={30}>Last 30 days</option>
                <option value={60}>Last 60 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={includeNrr}
                onChange={(e) => onIncludeNrrChange(e.target.checked)}
                className="h-3 w-3"
              />
              <span>Include Customer Success (NRR) in ARR path</span>
            </label>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-6">
          {/* Top-of-funnel row */}
          <div className="space-y-2 rounded-xl bg-slateCardSoft p-3 text-xs lg:col-span-6">
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Funnel volume
            </div>
            <div className="grid gap-3 md:grid-cols-5">
              <label className="flex flex-col gap-1">
                <span className="text-slate-300">Leads</span>
                <input
                  type="number"
                  className="rounded-md border border-slate-700 bg-slateBg px-2 py-1 text-sm"
                  value={actuals.leads}
                  onChange={(e) =>
                    handleActualNumberChange("leads", e.target.value)
                  }
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-slate-300">MQLs</span>
                <input
                  type="number"
                  className="rounded-md border border-slate-700 bg-slateBg px-2 py-1 text-sm"
                  value={actuals.mqls}
                  onChange={(e) =>
                    handleActualNumberChange("mqls", e.target.value)
                  }
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-slate-300">SQLs</span>
                <input
                  type="number"
                  className="rounded-md border border-slate-700 bg-slateBg px-2 py-1 text-sm"
                  value={actuals.sqls}
                  onChange={(e) =>
                    handleActualNumberChange("sqls", e.target.value)
                  }
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-slate-300">Opportunities</span>
                <input
                  type="number"
                  className="rounded-md border border-slate-700 bg-slateBg px-2 py-1 text-sm"
                  value={actuals.opps}
                  onChange={(e) =>
                    handleActualNumberChange("opps", e.target.value)
                  }
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-slate-300">Proposals</span>
                <input
                  type="number"
                  className="rounded-md border border-slate-700 bg-slateBg px-2 py-1 text-sm"
                  value={actuals.proposals}
                  onChange={(e) =>
                    handleActualNumberChange("proposals", e.target.value)
                  }
                />
              </label>
            </div>
          </div>

          {/* Wins + ARR row */}
          <div className="space-y-2 rounded-xl bg-slateCardSoft p-3 text-xs lg:col-span-4">
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Closed won and ARR in this timeframe
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <label className="flex flex-col gap-1">
                <span className="text-slate-300">Wins</span>
                <input
                  type="number"
                  className="rounded-md border border-slate-700 bg-slateBg px-2 py-1 text-sm"
                  value={actuals.wins}
                  onChange={(e) =>
                    handleActualNumberChange("wins", e.target.value)
                  }
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-slate-300">
                  New ARR in this timeframe (€)
                </span>
                <input
                  type="number"
                  className="rounded-md border border-slate-700 bg-slateBg px-2 py-1 text-sm"
                  value={actuals.newArr}
                  onChange={(e) =>
                    handleActualNumberChange("newArr", e.target.value)
                  }
                />
              </label>
              <div className="flex flex-col gap-1">
                <span className="text-slate-300">ACV (auto-calculated)</span>
                <div className="flex h-8 items-center rounded-md border border-slate-700 bg-slateBg px-2 text-sm text-slate-200">
                  {derivedActuals.wins > 0
                    ? formatCurrency(derivedActuals.acv)
                    : "—"}
                </div>
              </div>
            </div>
          </div>

          {/* Conversion snapshot */}
          <div className="space-y-2 rounded-xl bg-slateCardSoft p-3 text-xs lg:col-span-2">
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Conversion snapshot
            </div>
            <ul className="space-y-1 text-[11px] text-slate-300">
              {conversionBenchmarks(benchmarks).map((bm) => {
                const from = derivedActuals[bm.fromKey] as number;
                const to = derivedActuals[bm.toKey] as number;
                const actualRate = from ? (to / from) * 100 : 0;
                const targetRate = bm.targetRate * 100;
                const diff = actualRate - targetRate;
                const tone =
                  diff >= 2 ? "text-emerald-300" : diff <= -2 ? "text-rose-300" : "text-slate-300";

                return (
                  <li key={bm.label} className="flex justify-between">
                    <span>{bm.label}</span>
                    <span className={tone}>
                      {actualRate.toFixed(1)}% (target {targetRate.toFixed(
                        1
                      )}%)
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Hero metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <HeroCard
          title="Target ARR"
          valueLabel="Goal you are working towards"
          value={formatCurrency(baseMetrics.targetArr)}
          description="Total ARR target for the selected timeframe."
          statusLabel="Strategic north star"
          statusTone="neutral"
        />
        <HeroCard
          title="Forecast ARR"
          valueLabel="Based on current run rate"
          value={formatCurrency(activeMetrics.forecastArr)}
          description="Where you are likely to land if this period's performance repeats."
          statusLabel={gapStatus.label}
          statusTone={gapStatus.tone}
        />
        <HeroCard
          title="Gap to target ARR"
          valueLabel="Ahead or behind target"
          value={formatCurrency(Math.abs(activeMetrics.gapToTarget))}
          description={
            activeMetrics.gapToTarget >= 0
              ? "Positive means you are ahead of target based on current trend."
              : "Negative means you are behind target and need to unlock more throughput."
          }
          statusLabel={gapStatus.label}
          statusTone={gapStatus.tone}
        />
        <HeroCard
          title="Current run rate"
          valueLabel="Average new ARR per month"
          value={formatCurrency(activeMetrics.currentRunRateMonthly)}
          description="New ARR contributed per month at current performance."
          statusLabel="Based on recent period"
          statusTone="neutral"
        />
        <HeroCard
          title="Required run rate"
          valueLabel="Average new ARR needed"
          value={formatCurrency(activeMetrics.requiredRunRateMonthly)}
          description="Monthly ARR needed to reach target from today."
          statusLabel={
            activeMetrics.requiredRunRateMonthly <=
            activeMetrics.currentRunRateMonthly
              ? "Current run rate is sufficient"
              : "Run rate needs to increase"
          }
          statusTone={
            activeMetrics.requiredRunRateMonthly <=
            activeMetrics.currentRunRateMonthly
              ? "good"
              : "bad"
          }
        />
      </div>

      {/* Scenario engine */}
      <div className="rounded-2xl bg-slateCard p-4 shadow-lg shadow-black/40">
        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">
              Priority scenarios to improve outcome
            </h2>
            <p className="mt-1 text-xs text-slate-300">
              The model highlights the weakest stages versus target and shows
              the ARR impact of fixing them. Click a scenario to see how the
              5 hero metrics change.
            </p>
          </div>
          {activeScenario && (
            <button
              type="button"
              onClick={() => setActiveScenario(null)}
              className="rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-200 hover:bg-slate-700"
            >
              Reset to actuals
            </button>
          )}
        </div>

        {scenarios.length === 0 ? (
          <p className="text-xs text-slate-400">
            Add period data above to generate scenario suggestions.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className={`flex flex-col justify-between rounded-xl border border-slate-700 bg-slateCardSoft p-3 text-xs transition ${
                  activeScenario?.id === scenario.id
                    ? "ring-2 ring-accentGreen"
                    : ""
                }`}
              >
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Scenario
                  </div>
                  <div className="text-sm font-semibold text-slate-100">
                    {scenario.title}
                  </div>
                  <div className="text-xs text-slate-300">
                    {scenario.subtitle}
                  </div>
                  <div className="mt-2 text-[11px] font-medium text-emerald-300">
                    {scenario.impactLabel}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveScenario(scenario)}
                    className="rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-semibold text-slate-900 hover:bg-emerald-400"
                  >
                    Show scenario impact
                  </button>
                  {activeScenario?.id === scenario.id && (
                    <span className="text-[10px] uppercase tracking-wide text-emerald-300">
                      Scenario active
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
