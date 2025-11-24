// components/MainDashboard.tsx
"use client";

import React, { useMemo, useState } from "react";
import HeroCard from "@/components/HeroCard";
import { Benchmarks } from "@/components/BenchmarksPanel";

type Timeframe = "30" | "60" | "90";

type Actuals = {
  timeframe: Timeframe;
  leads: number;
  mqls: number;
  sqls: number;
  opps: number;
  proposals: number;
  wins: number;
  newArr: number;
  includeNrr: boolean;
  nrrPercent: number; // e.g. 120 = 120%
};

type ScenarioId = "weakest-stage" | "lift-acv" | "boost-leads" | null;

type ScenarioMetrics = {
  forecastArr: number;
  gapToTarget: number;
  currentRunRate: number;
};

const formatCurrency = (value: number) =>
  `€${value.toLocaleString("en-IE", {
    maximumFractionDigits: 0,
  })}`;

const formatPercent = (value: number) =>
  `${(value * 100).toFixed(1)}%`;

function getMonthsFromTimeframe(timeframe: Timeframe): number {
  const days = parseInt(timeframe, 10);
  return days / 30;
}

function clampNumber(num: number) {
  return Number.isFinite(num) ? num : 0;
}

const MainDashboard: React.FC<{ benchmarks: Benchmarks }> = ({
  benchmarks,
}) => {
  const [actuals, setActuals] = useState<Actuals>({
    timeframe: "90",
    leads: 1300,
    mqls: 400,
    sqls: 150,
    opps: 90,
    proposals: 60,
    wins: 25,
    newArr: 900_000,
    includeNrr: true,
    nrrPercent: 120,
  });

  const [activeScenario, setActiveScenario] =
    useState<ScenarioId>(null);
  const [scenarioMetrics, setScenarioMetrics] =
    useState<ScenarioMetrics | null>(null);

  const monthsInPeriod = useMemo(
    () => getMonthsFromTimeframe(actuals.timeframe),
    [actuals.timeframe]
  );

  // Base ACV – from actuals if possible, otherwise benchmark ACV
  const baseAcv = useMemo(() => {
    if (actuals.wins > 0) {
      const acv = actuals.newArr / actuals.wins;
      return clampNumber(acv);
    }
    return benchmarks.acv;
  }, [actuals.newArr, actuals.wins, benchmarks.acv]);

  // Base (non-scenario) metrics
  const baseMetrics = useMemo(() => {
    const currentRunRate =
      monthsInPeriod > 0
        ? actuals.newArr / monthsInPeriod
        : 0;

    const weeksInTimeframe = benchmarks.timeframeWeeks;
    const monthsInTargetPeriod = weeksInTimeframe / 4.345;

    let forecastArr =
      currentRunRate * monthsInTargetPeriod;

    // NRR could be layered later; for now we keep the forecast simple
    // if (actuals.includeNrr) { ... }

    const gapToTarget = forecastArr - benchmarks.targetArr;

    const requiredRunRate =
      monthsInTargetPeriod > 0
        ? benchmarks.targetArr / monthsInTargetPeriod
        : 0;

    return {
      currentRunRate: clampNumber(currentRunRate),
      forecastArr: clampNumber(forecastArr),
      gapToTarget: clampNumber(gapToTarget),
      requiredRunRate: clampNumber(requiredRunRate),
    };
  }, [actuals.newArr, monthsInPeriod, benchmarks, actuals.includeNrr]);

  const selectedMetrics = scenarioMetrics || baseMetrics;

  // Actual conversion rates from the current period
  const conversionRates = useMemo(() => {
    const leadToMql =
      actuals.leads > 0 ? actuals.mqls / actuals.leads : 0;
    const mqlToSql =
      actuals.mqls > 0 ? actuals.sqls / actuals.mqls : 0;
    const sqlToOpp =
      actuals.sqls > 0 ? actuals.opps / actuals.sqls : 0;
    const oppToProposal =
      actuals.opps > 0
        ? actuals.proposals / actuals.opps
        : 0;
    const proposalToWin =
      actuals.proposals > 0
        ? actuals.wins / actuals.proposals
        : 0;

    return {
      leadToMql,
      mqlToSql,
      sqlToOpp,
      oppToProposal,
      proposalToWin,
    };
  }, [actuals]);

  // Helper to compare a step vs benchmark (for mini indicators under boxes)
  const compareRate = (
    actual: number,
    target?: number
  ) => {
    if (!target || target <= 0) {
      return {
        label: "",
        toneClass: "text-slate-500",
      };
    }
    const diff = actual - target;
    const diffPp = diff * 100;
    const sign = diffPp > 0 ? "+" : "";
    let toneClass = "text-slate-400";
    if (diffPp > 0.5) toneClass = "text-emerald-400";
    else if (diffPp < -0.5) toneClass = "text-rose-400";

    return {
      label: `${(actual * 100).toFixed(
        1
      )}% vs ${(target * 100).toFixed(
        1
      )}% (${sign}${diffPp.toFixed(1)}pp)`,
      toneClass,
    };
  };

  const mqlToSqlCompare = compareRate(
    conversionRates.mqlToSql,
    benchmarks.mqlToSql
  );
  const sqlToOppCompare = compareRate(
    conversionRates.sqlToOpp,
    benchmarks.sqlToOpp
  );
  const oppToProposalCompare = compareRate(
    conversionRates.oppToProposal,
    benchmarks.oppToProposal
  );
  const proposalToWinCompare = compareRate(
    conversionRates.proposalToWin,
    benchmarks.proposalToWin
  );

  // Find the weakest stage vs target
  const weakestStage = useMemo(() => {
    const stages = [
      {
        id: "mqlToSql" as const,
        label: "MQL → SQL",
        actual: conversionRates.mqlToSql,
        target: benchmarks.mqlToSql,
      },
      {
        id: "sqlToOpp" as const,
        label: "SQL → Opp",
        actual: conversionRates.sqlToOpp,
        target: benchmarks.sqlToOpp,
      },
      {
        id: "oppToProposal" as const,
        label: "Opp → Proposal",
        actual: conversionRates.oppToProposal,
        target: benchmarks.oppToProposal,
      },
      {
        id: "proposalToWin" as const,
        label: "Proposal → Win",
        actual: conversionRates.proposalToWin,
        target: benchmarks.proposalToWin,
      },
    ];

    const withGap = stages.map((s) => ({
      ...s,
      gap: s.target - s.actual,
    }));

    const underperforming = withGap.filter(
      (s) => s.gap > 0.001
    );
    if (!underperforming.length) return null;

    underperforming.sort((a, b) => b.gap - a.gap);
    return underperforming[0];
  }, [conversionRates, benchmarks]);

  const weeksInTimeframe = benchmarks.timeframeWeeks;
  const monthsInTargetPeriod = weeksInTimeframe / 4.345;

  type ScenarioPreview = (ScenarioMetrics & {
    arrDelta: number;
  }) | null;

  type StageId =
    | "mqlToSql"
    | "sqlToOpp"
    | "oppToProposal"
    | "proposalToWin";

  const computeStageScenario = (
    stageId: StageId,
    newRate: number
  ): ScenarioPreview => {
    let { leads, mqls, sqls, opps, proposals } = actuals;
    let wins = actuals.wins;

    // Rebuild the pipeline from the adjusted stage downward
    if (stageId === "mqlToSql") {
      const newSqls = Math.round(mqls * newRate);
      const newOpps = conversionRates.sqlToOpp * newSqls;
      const newProposals =
        conversionRates.oppToProposal * newOpps;
      const newWins =
        conversionRates.proposalToWin * newProposals;
      wins = newWins;
    } else if (stageId === "sqlToOpp") {
      const newOpps = Math.round(sqls * newRate);
      const newProposals =
        conversionRates.oppToProposal * newOpps;
      const newWins =
        conversionRates.proposalToWin * newProposals;
      wins = newWins;
    } else if (stageId === "oppToProposal") {
      const newProposals = Math.round(opps * newRate);
      const newWins =
        conversionRates.proposalToWin * newProposals;
      wins = newWins;
    } else if (stageId === "proposalToWin") {
      const newWins = Math.round(
        proposals * newRate
      );
      wins = newWins;
    }

    const newArr = wins * baseAcv;
    const currentRunRate =
      monthsInPeriod > 0
        ? newArr / monthsInPeriod
        : 0;
    const forecastArr =
      currentRunRate * monthsInTargetPeriod;
    const gapToTarget =
      forecastArr - benchmarks.targetArr;
    const arrDelta =
      forecastArr - baseMetrics.forecastArr;

    return {
      forecastArr: clampNumber(forecastArr),
      gapToTarget: clampNumber(gapToTarget),
      currentRunRate: clampNumber(currentRunRate),
      arrDelta: clampNumber(arrDelta),
    };
  };

  // Weakest-stage or max-impact scenario
  let weakestPreview: ScenarioPreview = null;
  let scenarioStageLabel: string | null = null;
  let scenarioStageActual: number | null = null;
  let scenarioStageTarget: number | null = null;
  let scenarioIsMaxImpact = false;

  if (weakestStage) {
    weakestPreview = computeStageScenario(
      weakestStage.id,
      weakestStage.target
    );
    scenarioStageLabel = weakestStage.label;
    scenarioStageActual = weakestStage.actual;
    scenarioStageTarget = weakestStage.target;
  } else {
    // All stages at / above target → pick the max-impact stage
    const candidates: {
      id: StageId;
      label: string;
      actual: number;
    }[] = [
      {
        id: "mqlToSql",
        label: "MQL → SQL",
        actual: conversionRates.mqlToSql,
      },
      {
        id: "sqlToOpp",
        label: "SQL → Opp",
        actual: conversionRates.sqlToOpp,
      },
      {
        id: "oppToProposal",
        label: "Opp → Proposal",
        actual: conversionRates.oppToProposal,
      },
      {
        id: "proposalToWin",
        label: "Proposal → Win",
        actual: conversionRates.proposalToWin,
      },
    ];

    let bestPreview: ScenarioPreview = null;
    let bestLabel: string | null = null;
    let bestActual: number | null = null;
    let bestTargetRate: number | null = null;

    for (const c of candidates) {
      if (!c.actual || c.actual <= 0) continue;
      const upliftRate = Math.min(c.actual * 1.1, 1); // +10% relative uplift
      const preview = computeStageScenario(
        c.id,
        upliftRate
      );
      if (!preview) continue;
      if (
        !bestPreview ||
        preview.arrDelta > bestPreview.arrDelta
      ) {
        bestPreview = preview;
        bestLabel = c.label;
        bestActual = c.actual;
        bestTargetRate = upliftRate;
      }
    }

    if (bestPreview && bestLabel != null) {
      weakestPreview = bestPreview;
      scenarioStageLabel = bestLabel;
      scenarioStageActual = bestActual;
      scenarioStageTarget = bestTargetRate;
      scenarioIsMaxImpact = true;
    }
  }

  let liftAcvPreview: ScenarioPreview = null;
  {
    const improvedAcv = baseAcv * 1.1;
    const newArr = actuals.wins * improvedAcv;
    const currentRunRate =
      monthsInPeriod > 0
        ? newArr / monthsInPeriod
        : 0;
    const forecastArr =
      currentRunRate * monthsInTargetPeriod;
    const gapToTarget =
      forecastArr - benchmarks.targetArr;
    const arrDelta =
      forecastArr - baseMetrics.forecastArr;

    liftAcvPreview = {
      forecastArr: clampNumber(forecastArr),
      gapToTarget: clampNumber(gapToTarget),
      currentRunRate: clampNumber(currentRunRate),
      arrDelta: clampNumber(arrDelta),
    };
  }

  let boostLeadsPreview: ScenarioPreview = null;
  {
    const boostedLeads = actuals.leads * 1.2;
    const mqls =
      boostedLeads * conversionRates.leadToMql;
    const sqls =
      mqls * conversionRates.mqlToSql;
    const opps =
      sqls * conversionRates.sqlToOpp;
    const proposals =
      opps * conversionRates.oppToProposal;
    const wins =
      proposals * conversionRates.proposalToWin;

    const newArr = wins * baseAcv;
    const currentRunRate =
      monthsInPeriod > 0
        ? newArr / monthsInPeriod
        : 0;
    const forecastArr =
      currentRunRate * monthsInTargetPeriod;
    const gapToTarget =
      forecastArr - benchmarks.targetArr;
    const arrDelta =
      forecastArr - baseMetrics.forecastArr;

    boostLeadsPreview = {
      forecastArr: clampNumber(forecastArr),
      gapToTarget: clampNumber(gapToTarget),
      currentRunRate: clampNumber(currentRunRate),
      arrDelta: clampNumber(arrDelta),
    };
  }

  // When you click a scenario, apply it and push the metrics into the hero cards
  const applyScenario = (scenario: ScenarioId) => {
    if (!scenario) {
      setActiveScenario(null);
      setScenarioMetrics(null);
      return;
    }

    if (scenario === "weakest-stage") {
      if (!weakestPreview) {
        setActiveScenario(null);
        setScenarioMetrics(null);
        return;
      }
      setActiveScenario("weakest-stage");
      setScenarioMetrics({
        forecastArr: weakestPreview.forecastArr,
        gapToTarget: weakestPreview.gapToTarget,
        currentRunRate:
          weakestPreview.currentRunRate,
      });
      return;
    }

    if (scenario === "lift-acv" && liftAcvPreview) {
      setActiveScenario("lift-acv");
      setScenarioMetrics({
        forecastArr: liftAcvPreview.forecastArr,
        gapToTarget: liftAcvPreview.gapToTarget,
        currentRunRate:
          liftAcvPreview.currentRunRate,
      });
      return;
    }

    if (
      scenario === "boost-leads" &&
      boostLeadsPreview
    ) {
      setActiveScenario("boost-leads");
      setScenarioMetrics({
        forecastArr:
          boostLeadsPreview.forecastArr,
        gapToTarget:
          boostLeadsPreview.gapToTarget,
        currentRunRate:
          boostLeadsPreview.currentRunRate,
      });
      return;
    }
  };

  const handleActualChange = (
    field: keyof Actuals,
    value: string
  ) => {
    // reset scenario when inputs change
    setActiveScenario(null);
    setScenarioMetrics(null);

    setActuals((prev) => {
      if (field === "timeframe") {
        return {
          ...prev,
          timeframe: value as Timeframe,
        };
      }

      if (field === "includeNrr") {
        return {
          ...prev,
          includeNrr: value === "true",
        };
      }

      const num = Number(value) || 0;
      return {
        ...prev,
        [field]: num,
      };
    });
  };

  const gapStatusLabel =
    selectedMetrics.gapToTarget >= 0
      ? "Ahead"
      : "Behind";

  const gapStatusTone =
    selectedMetrics.gapToTarget >= 0
      ? "good"
      : "bad";

  const runRateStatusTone =
    selectedMetrics.currentRunRate >=
    baseMetrics.requiredRunRate
      ? "good"
      : "warning";

  const gapAbs = Math.abs(
    selectedMetrics.gapToTarget
  );

  const avgContractValue = baseAcv;

  return (
    <div className="space-y-6">
      {/* Funnel + ARR inputs */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-slate-950/40">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Funnel and ARR performance for a recent
              period
            </h2>
            <p className="text-xs text-slate-400">
              Plug in a recent 30 / 60 / 90-day period.
              The model will project this performance
              against your ARR target.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-300">
              Timeframe
            </label>
            <select
              className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs"
              value={actuals.timeframe}
              onChange={(e) =>
                handleActualChange(
                  "timeframe",
                  e.target.value
                )
              }
            >
              <option value="30">
                Last 30 days
              </option>
              <option value="60">
                Last 60 days
              </option>
              <option value="90">
                Last 90 days
              </option>
            </select>
          </div>
        </div>

        {/* Top row: Leads → Wins + mini indicators */}
        <div className="grid gap-4 md:grid-cols-6">
          {/* Leads */}
          <div className="md:col-span-1">
            <label className="block text-xs text-slate-300">
              Leads
            </label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
              value={actuals.leads}
              onChange={(e) =>
                handleActualChange(
                  "leads",
                  e.target.value
                )
              }
            />
            <p className="mt-1 text-[10px] text-slate-500">
              Lead volume for this period
            </p>
          </div>

          {/* MQLs */}
          <div className="md:col-span-1">
            <label className="block text-xs text-slate-300">
              MQLs
            </label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
              value={actuals.mqls}
              onChange={(e) =>
                handleActualChange(
                  "mqls",
                  e.target.value
                )
              }
            />
            {mqlToSqlCompare.label && (
              <p
                className={`mt-1 text-[10px] ${mqlToSqlCompare.toneClass}`}
              >
                Lead → MQL: {(
                  conversionRates.leadToMql * 100
                ).toFixed(1)}
                %
              </p>
            )}
          </div>

          {/* SQLs */}
          <div className="md:col-span-1">
            <label className="block text-xs text-slate-300">
              SQLs
            </label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
              value={actuals.sqls}
              onChange={(e) =>
                handleActualChange(
                  "sqls",
                  e.target.value
                )
              }
            />
            {mqlToSqlCompare.label && (
              <p
                className={`mt-1 text-[10px] ${mqlToSqlCompare.toneClass}`}
              >
                MQL → SQL: {mqlToSqlCompare.label}
              </p>
            )}
          </div>

          {/* Opportunities */}
          <div className="md:col-span-1">
            <label className="block text-xs text-slate-300">
              Opportunities
            </label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
              value={actuals.opps}
              onChange={(e) =>
                handleActualChange(
                  "opps",
                  e.target.value
                )
              }
            />
            {sqlToOppCompare.label && (
              <p
                className={`mt-1 text-[10px] ${sqlToOppCompare.toneClass}`}
              >
                SQL → Opp: {sqlToOppCompare.label}
              </p>
            )}
          </div>

          {/* Proposals */}
          <div className="md:col-span-1">
            <label className="block text-xs text-slate-300">
              Proposals
            </label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
              value={actuals.proposals}
              onChange={(e) =>
                handleActualChange(
                  "proposals",
                  e.target.value
                )
              }
            />
            {oppToProposalCompare.label && (
              <p
                className={`mt-1 text-[10px] ${oppToProposalCompare.toneClass}`}
              >
                Opp → Proposal:{" "}
                {oppToProposalCompare.label}
              </p>
            )}
          </div>

          {/* Wins */}
          <div className="md:col-span-1">
            <label className="block text-xs text-slate-300">
              Wins
            </label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
              value={actuals.wins}
              onChange={(e) =>
                handleActualChange(
                  "wins",
                  e.target.value
                )
              }
            />
            {proposalToWinCompare.label && (
              <p
                className={`mt-1 text-[10px] ${proposalToWinCompare.toneClass}`}
              >
                Proposal → Win:{" "}
                {proposalToWinCompare.label}
              </p>
            )}
          </div>
        </div>

        {/* Bottom row: ARR, ACV, NRR toggle, NRR value */}
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          {/* New ARR */}
          <div>
            <label className="block text-xs text-slate-300">
              New ARR in this timeframe (€)
            </label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
              value={actuals.newArr}
              onChange={(e) =>
                handleActualChange(
                  "newArr",
                  e.target.value
                )
              }
            />
          </div>

          {/* Average Contract Value */}
          <div>
            <label className="block text-xs text-slate-300">
              Average Contract Value (€)
            </label>
            <input
              type="text"
              className="mt-1 w-full cursor-default rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
              value={formatCurrency(
                avgContractValue || 0
              )}
              readOnly
            />
          </div>

          {/* Include NRR toggle */}
          <div>
            <label className="block text-xs text-slate-300">
              Include NRR in ARR path
            </label>
            <select
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
              value={
                actuals.includeNrr
                  ? "true"
                  : "false"
              }
              onChange={(e) =>
                handleActualChange(
                  "includeNrr",
                  e.target.value
                )
              }
            >
              <option value="true">
                Yes, include NRR impact
              </option>
              <option value="false">
                No, focus on new ARR only
              </option>
            </select>
          </div>

          {/* Current NRR */}
          <div>
            <label className="block text-xs text-slate-300">
              Current NRR (%)
            </label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
              value={actuals.nrrPercent}
              onChange={(e) =>
                handleActualChange(
                  "nrrPercent",
                  e.target.value
                )
              }
            />
          </div>
        </div>
      </section>

      {/* Hero metrics */}
      <section className="grid gap-4 md:grid-cols-5">
        <HeroCard
          title="Target ARR"
          value={formatCurrency(benchmarks.targetArr)}
          subtitle="Goal you are working towards"
          statusLabel=""
          statusTone="neutral"
        />
        <HeroCard
          title="Forecast ARR"
          value={formatCurrency(
            selectedMetrics.forecastArr
          )}
          subtitle="Based on current run rate"
          statusLabel={
            selectedMetrics.forecastArr >=
            benchmarks.targetArr
              ? "Above target"
              : "Below target"
          }
          statusTone={
            selectedMetrics.forecastArr >=
            benchmarks.targetArr
              ? "good"
              : "warning"
          }
        />
        <HeroCard
          title="Gap to target ARR"
          value={formatCurrency(gapAbs)}
          subtitle="Ahead or behind target"
          statusLabel={gapStatusLabel}
          statusTone={gapStatusTone}
        />
        <HeroCard
          title="Current Run Rate"
          value={formatCurrency(
            selectedMetrics.currentRunRate
          )}
          subtitle="Average new ARR per month"
          statusLabel={
            runRateStatusTone === "good"
              ? "On track"
              : "Needs lift"
          }
          statusTone={runRateStatusTone}
        />
        <HeroCard
          title="Required Run Rate"
          value={formatCurrency(
            baseMetrics.requiredRunRate
          )}
          subtitle="Average new ARR needed per month"
          statusLabel=""
          statusTone="neutral"
        />
      </section>

      {/* Scenarios */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Priority scenarios to improve outcome
            </h2>
            <p className="text-xs text-slate-400">
              The model flags underperforming stages and
              shows what happens if you fix them or pull key
              levers.
            </p>
          </div>
          {activeScenario && (
            <button
              onClick={() => applyScenario(null)}
              className="text-xs text-sky-400 hover:text-sky-300"
            >
              Reset to base metrics
            </button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Scenario 1: Fix weakest / max-impact stage */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-100">
                {scenarioStageLabel
                  ? `Fix priority stage (${scenarioStageLabel})`
                  : "Fix weakest stage"}
              </h3>
              <p className="text-xs text-slate-400">
                {scenarioStageLabel &&
                weakestPreview &&
                scenarioStageActual != null &&
                scenarioStageTarget != null ? (
                  <>
                    <span className="block">
                      {scenarioStageLabel}:{" "}
                      {formatPercent(
                        scenarioStageActual
                      )}{" "}
                      →{" "}
                      {formatPercent(
                        scenarioStageTarget
                      )}
                    </span>
                    <span className="mt-1 block">
                      Estimated ARR impact:{" "}
                      <span
                        className={
                          weakestPreview.arrDelta >= 0
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }
                      >
                        {weakestPreview.arrDelta >= 0
                          ? "+"
                          : "-"}
                        {formatCurrency(
                          Math.abs(
                            weakestPreview.arrDelta
                          )
                        )}
                      </span>
                    </span>
                    {scenarioIsMaxImpact && (
                      <span className="mt-1 block text-[10px] text-slate-500">
                        All stages are at or above
                        benchmark. This uses a +10%
                        uplift on the highest-impact
                        stage.
                      </span>
                    )}
                  </>
                ) : (
                  "Use this to simulate fixing a weak stage or applying a targeted uplift to test upside."
                )}
              </p>
            </div>
            <button
              onClick={() =>
                applyScenario("weakest-stage")
              }
              className={`mt-3 inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeScenario ===
                "weakest-stage"
                  ? "bg-sky-500 text-slate-950"
                  : "bg-slate-800 text-slate-100 hover:bg-slate-700"
              }`}
            >
              Show scenario impact
            </button>
          </div>

          {/* Scenario 2: Lift ACV */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-100">
                Increase ACV by 10%
              </h3>
              <p className="text-xs text-slate-400">
                Current ACV is around{" "}
                {formatCurrency(baseAcv)}.{" "}
                {liftAcvPreview && (
                  <span className="mt-1 block">
                    Estimated ARR impact:{" "}
                    <span
                      className={
                        liftAcvPreview.arrDelta >= 0
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }
                    >
                      {liftAcvPreview.arrDelta >= 0
                        ? "+"
                        : "-"}
                      {formatCurrency(
                        Math.abs(
                          liftAcvPreview.arrDelta
                        )
                      )}
                    </span>
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() =>
                applyScenario("lift-acv")
              }
              className={`mt-3 inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeScenario === "lift-acv"
                  ? "bg-sky-500 text-slate-950"
                  : "bg-slate-800 text-slate-100 hover:bg-slate-700"
              }`}
            >
              Show scenario impact
            </button>
          </div>

          {/* Scenario 3: Boost leads */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-100">
                Increase lead volume by 20%
              </h3>
              <p className="text-xs text-slate-400">
                Model a 20% uplift in lead volume at current
                conversion rates.
                {boostLeadsPreview && (
                  <span className="mt-1 block">
                    Estimated ARR impact:{" "}
                    <span
                      className={
                        boostLeadsPreview.arrDelta >= 0
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }
                    >
                      {boostLeadsPreview.arrDelta >= 0
                        ? "+"
                        : "-"}
                      {formatCurrency(
                        Math.abs(
                          boostLeadsPreview.arrDelta
                        )
                      )}
                    </span>
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() =>
                applyScenario("boost-leads")
              }
              className={`mt-3 inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeScenario === "boost-leads"
                  ? "bg-sky-500 text-slate-950"
                  : "bg-slate-800 text-slate-100 hover:bg-slate-700"
              }`}
            >
              Show scenario impact
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MainDashboard;
