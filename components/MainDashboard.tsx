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
  includeCustomerSuccess: boolean;
};

type ScenarioId = "weakest-stage" | "acv-gap" | "boost-leads" | null;

type ScenarioMetrics = {
  forecastArr: number;
  gapToTarget: number;
  currentRunRate: number;
};

type MainDashboardProps = {
  benchmarks: Benchmarks;
};

const formatCurrency = (value: number) =>
  `€${value.toLocaleString("en-IE", {
    maximumFractionDigits: 0,
  })}`;

const formatPercent = (value: number) =>
  `${(value * 100).toFixed(1)}%`;

const formatInteger = (value: number) =>
  value.toLocaleString("en-IE", {
    maximumFractionDigits: 0,
  });

function getMonthsFromTimeframe(timeframe: Timeframe): number {
  const days = parseInt(timeframe, 10);
  return days / 30;
}

function clampNumber(num: number) {
  return Number.isFinite(num) ? num : 0;
}

const MainDashboard: React.FC<MainDashboardProps> = ({
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
    includeCustomerSuccess: true,
  });

  const [activeScenario, setActiveScenario] =
    useState<ScenarioId>(null);
  const [scenarioMetrics, setScenarioMetrics] =
    useState<ScenarioMetrics | null>(null);

  const monthsInPeriod = useMemo(
    () => getMonthsFromTimeframe(actuals.timeframe),
    [actuals.timeframe]
  );

  // Base ACV is derived from actuals, but we NEVER overwrite newArr here.
  const baseAcv = useMemo(() => {
    if (actuals.wins > 0) {
      const acv = actuals.newArr / actuals.wins;
      return clampNumber(acv);
    }
    // fall back to ACV benchmark if no wins
    return benchmarks.acv;
  }, [actuals.newArr, actuals.wins, benchmarks.acv]);

  const baseMetrics = useMemo(() => {
    const currentRunRate =
      monthsInPeriod > 0
        ? actuals.newArr / monthsInPeriod
        : 0;

    const weeksInTimeframe = benchmarks.timeframeWeeks;
    const monthsInTargetPeriod = weeksInTimeframe / 4.345;

    const nrrFactor = actuals.includeCustomerSuccess
      ? benchmarks.nrr
      : 1;

    const forecastArr =
      currentRunRate * monthsInTargetPeriod * nrrFactor;

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
      monthsInTargetPeriod,
    };
  }, [
    actuals.newArr,
    monthsInPeriod,
    actuals.includeCustomerSuccess,
    benchmarks,
  ]);

  const selectedMetrics = scenarioMetrics || baseMetrics;

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

    const negativeOnly = withGap.filter(
      (s) => s.gap > 0.001
    );
    if (!negativeOnly.length) return null;

    negativeOnly.sort((a, b) => b.gap - a.gap);
    return negativeOnly[0];
  }, [conversionRates, benchmarks]);

  const monthsInTargetPeriod =
    baseMetrics.monthsInTargetPeriod;

  // Funnel stage vs benchmark (absolute counts and diff)
  const funnelBenchmarkComparisons = useMemo(() => {
    const items = [];

    const leadsToMqlExpected =
      actuals.leads * benchmarks.leadsToMql;
    items.push({
      key: "leadsToMql",
      label: "Leads → MQLs",
      actual: actuals.mqls,
      expected: leadsToMqlExpected,
    });

    const mqlToSqlExpected =
      actuals.mqls * benchmarks.mqlToSql;
    items.push({
      key: "mqlToSql",
      label: "MQL → SQLs",
      actual: actuals.sqls,
      expected: mqlToSqlExpected,
    });

    const sqlToOppExpected =
      actuals.sqls * benchmarks.sqlToOpp;
    items.push({
      key: "sqlToOpp",
      label: "SQL → Opps",
      actual: actuals.opps,
      expected: sqlToOppExpected,
    });

    const oppToProposalExpected =
      actuals.opps * benchmarks.oppToProposal;
    items.push({
      key: "oppToProposal",
      label: "Opp → Proposals",
      actual: actuals.proposals,
      expected: oppToProposalExpected,
    });

    const proposalToWinExpected =
      actuals.proposals * benchmarks.proposalToWin;
    items.push({
      key: "proposalToWin",
      label: "Proposal → Wins",
      actual: actuals.wins,
      expected: proposalToWinExpected,
    });

    return items.map((item) => ({
      ...item,
      diff: item.actual - item.expected,
    }));
  }, [actuals, benchmarks]);

  // New leads baseline vs benchmark (per timeframe)
  const leadsExpected =
    benchmarks.newLeadsPerMonth * monthsInPeriod;
  const leadsDiff = actuals.leads - leadsExpected;

  const computeScenarioMetricsFromNewArr = (
    scenarioNewArr: number
  ): ScenarioMetrics => {
    const currentRunRate =
      monthsInPeriod > 0
        ? scenarioNewArr / monthsInPeriod
        : 0;

    const nrrFactor = actuals.includeCustomerSuccess
      ? benchmarks.nrr
      : 1;

    const forecastArr =
      currentRunRate * monthsInTargetPeriod * nrrFactor;

    const gapToTarget = forecastArr - benchmarks.targetArr;

    return {
      forecastArr: clampNumber(forecastArr),
      gapToTarget: clampNumber(gapToTarget),
      currentRunRate: clampNumber(currentRunRate),
    };
  };

  const applyScenario = (scenario: ScenarioId) => {
    if (!scenario) {
      setActiveScenario(null);
      setScenarioMetrics(null);
      return;
    }

    if (scenario === "weakest-stage" && weakestStage) {
      let { mqls, sqls, opps, proposals } = actuals;
      let wins = actuals.wins;

      if (weakestStage.id === "mqlToSql") {
        const newSqls = Math.round(
          mqls * benchmarks.mqlToSql
        );
        const newOpps = conversionRates.sqlToOpp * newSqls;
        const newProposals =
          conversionRates.oppToProposal * newOpps;
        const newWins =
          conversionRates.proposalToWin * newProposals;
        wins = newWins;
      } else if (weakestStage.id === "sqlToOpp") {
        const newOpps = Math.round(
          sqls * benchmarks.sqlToOpp
        );
        const newProposals =
          conversionRates.oppToProposal * newOpps;
        const newWins =
          conversionRates.proposalToWin * newProposals;
        wins = newWins;
      } else if (weakestStage.id === "oppToProposal") {
        const newProposals = Math.round(
          opps * benchmarks.oppToProposal
        );
        const newWins =
          conversionRates.proposalToWin * newProposals;
        wins = newWins;
      } else if (weakestStage.id === "proposalToWin") {
        const newWins = Math.round(
          proposals * benchmarks.proposalToWin
        );
        wins = newWins;
      }

      const scenarioNewArr = wins * baseAcv;
      const metrics =
        computeScenarioMetricsFromNewArr(
          scenarioNewArr
        );

      setActiveScenario("weakest-stage");
      setScenarioMetrics(metrics);
      return;
    }

    // ACV GAP SCENARIO: bring ACV back to benchmark if it's below
    if (scenario === "acv-gap") {
      let targetAcv = baseAcv;

      if (baseAcv < benchmarks.acv) {
        // ACV is below benchmark -> scenario = fix back to benchmark ACV
        targetAcv = benchmarks.acv;
      } else {
        // ACV already >= benchmark -> simple +10% uplift
        targetAcv = baseAcv * 1.1;
      }

      const scenarioNewArr = actuals.wins * targetAcv;
      const metrics =
        computeScenarioMetricsFromNewArr(
          scenarioNewArr
        );

      setActiveScenario("acv-gap");
      setScenarioMetrics(metrics);
      return;
    }

    if (scenario === "boost-leads") {
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

      const scenarioNewArr = wins * baseAcv;
      const metrics =
        computeScenarioMetricsFromNewArr(
          scenarioNewArr
        );

      setActiveScenario("boost-leads");
      setScenarioMetrics(metrics);
      return;
    }
  };

  const handleActualChange = (
    field: keyof Actuals,
    value: string
  ) => {
    setActiveScenario(null);
    setScenarioMetrics(null);

    setActuals((prev) => {
      if (field === "timeframe") {
        return {
          ...prev,
          timeframe: value as Timeframe,
        };
      }

      if (field === "includeCustomerSuccess") {
        return {
          ...prev,
          includeCustomerSuccess:
            value === "true",
        };
      }

      // Special handling for New ARR field:
      // - allow commas visually
      // - clean to digits only
      // - no lingering "0" when you clear the field
      if (field === "newArr") {
        const cleaned = value.replace(/[^\d]/g, "");
        if (!cleaned) {
          return {
            ...prev,
            newArr: 0,
          };
        }
        const numeric = Number(cleaned);
        return {
          ...prev,
          newArr: Number.isFinite(numeric)
            ? numeric
            : prev.newArr,
        };
      }

      const num = Number(value);
      return {
        ...prev,
        [field]: Number.isFinite(num) ? num : 0,
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

  const avgAcvDisplay =
    actuals.wins > 0
      ? formatCurrency(baseAcv)
      : "—";

  // For New ARR in Period vs what is required in this period
  const periodTargetArr =
    baseMetrics.requiredRunRate * monthsInPeriod;
  const arrStatusIsAbove =
    actuals.newArr >= periodTargetArr && actuals.newArr > 0;

  // ACV diff vs benchmark
  const acvDiff = baseAcv - benchmarks.acv;
  const acvIsBelowBenchmark = acvDiff < 0;

  // Scenario summary text
  const scenarioName =
    activeScenario === "weakest-stage"
      ? "Fix weakest funnel stage"
      : activeScenario === "acv-gap"
      ? acvIsBelowBenchmark
        ? "Fix ACV back to benchmark"
        : "Lift ACV by 10%"
      : activeScenario === "boost-leads"
      ? "Increase lead volume by 20%"
      : "Base case";

  const isAhead = selectedMetrics.gapToTarget >= 0;

  return (
    <div className="space-y-6">
      {/* Funnel + ARR inputs */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-slate-950/40">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">
              Current Funnel Velocity (Last 30/60/90 Days)
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

        {/* Top row: funnel counts */}
        <div className="grid gap-4 md:grid-cols-6">
          <div className="md:col-span-1">
            <label className="block text-xs text-slate-300">
              Leads
            </label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-50"
              value={actuals.leads}
              onChange={(e) =>
                handleActualChange(
                  "leads",
                  e.target.value
                )
              }
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs text-slate-300">
              MQLs
            </label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-50"
              value={actuals.mqls}
              onChange={(e) =>
                handleActualChange(
                  "mqls",
                  e.target.value
                )
              }
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs text-slate-300">
              SQLs
            </label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-50"
              value={actuals.sqls}
              onChange={(e) =>
                handleActualChange(
                  "sqls",
                  e.target.value
                )
              }
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs text-slate-300">
              Opportunities
            </label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-50"
              value={actuals.opps}
              onChange={(e) =>
                handleActualChange(
                  "opps",
                  e.target.value
                )
              }
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs text-slate-300">
              Proposals
            </label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-50"
              value={actuals.proposals}
              onChange={(e) =>
                handleActualChange(
                  "proposals",
                  e.target.value
                )
              }
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs text-slate-300">
              Wins
            </label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-50"
              value={actuals.wins}
              onChange={(e) =>
                handleActualChange(
                  "wins",
                  e.target.value
                )
              }
            />
          </div>
        </div>

        {/* Under/over vs benchmark directly under funnel numbers */}
        <div className="mt-1 grid gap-4 md:grid-cols-6">
          {/* Leads over/under vs baseline */}
          <div className="md:col-span-1 flex items-center justify-center text-sm font-semibold">
            {(() => {
              if (!Number.isFinite(leadsDiff)) return null;
              const isAbove = leadsDiff >= 0;
              const arrow = isAbove ? "↑" : "↓";
              const absDiff = Math.round(
                Math.abs(leadsDiff)
              );
              if (absDiff === 0) {
                return (
                  <span className="text-slate-500">
                    = 0
                  </span>
                );
              }
              return (
                <span
                  className={
                    isAbove
                      ? "text-emerald-400"
                      : "text-red-400"
                  }
                >
                  {arrow} {formatInteger(absDiff)}
                </span>
              );
            })()}
          </div>

          {/* Stage over/under metrics under MQLs, SQLs, Opps, Proposals, Wins */}
          {funnelBenchmarkComparisons.map((metric) => {
            const isAbove = metric.diff >= 0;
            const arrow = isAbove ? "↑" : "↓";
            const absDiff = Math.round(
              Math.abs(metric.diff)
            );

            return (
              <div
                key={metric.key}
                className="flex items-center justify-center text-sm font-semibold"
              >
                {absDiff === 0 ? (
                  <span className="text-slate-500">
                    = 0
                  </span>
                ) : (
                  <span
                    className={
                      isAbove
                        ? "text-emerald-400"
                        : "text-red-400"
                    }
                  >
                    {arrow} {formatInteger(absDiff)}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom row: ARR / ACV / NRR */}
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          {/* New ARR in Period with status pill */}
          <div>
            <label className="block text-xs text-slate-300">
              New ARR in Period
            </label>
            <div className="mt-1 flex items-center gap-1 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm">
              <span className="text-slate-500">
                €
              </span>
              <input
                type="text"
                className="w-full bg-transparent text-sm text-slate-50 outline-none"
                value={
                  actuals.newArr
                    ? formatInteger(actuals.newArr)
                    : ""
                }
                onChange={(e) =>
                  handleActualChange(
                    "newArr",
                    e.target.value
                  )
                }
              />
            </div>
            <div className="mt-2">
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                  arrStatusIsAbove
                    ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-300"
                    : "border-red-500/60 bg-red-500/10 text-red-300"
                }`}
              >
                {arrStatusIsAbove
                  ? "Above Target"
                  : "Behind Target"}
              </span>
            </div>
          </div>

          {/* ACV + delta vs benchmark */}
          <div>
            <label className="block text-xs text-slate-300">
              Average contract value (ACV)
            </label>
            <div className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-50">
              {avgAcvDisplay}
            </div>
            {actuals.wins > 0 && Math.abs(acvDiff) >= 1 && (
              <div className="mt-1 text-sm font-semibold">
                <span
                  className={
                    acvDiff >= 0
                      ? "text-emerald-400"
                      : "text-red-400"
                  }
                >
                  {acvDiff >= 0 ? "↑ " : "↓ "}
                  {formatCurrency(Math.abs(acvDiff))}
                </span>
                <span className="ml-1 text-xs text-slate-400">
                  vs ACV benchmark
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs text-slate-300">
              Include NRR in ARR path
            </label>
            <select
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-50"
              value={
                actuals.includeCustomerSuccess
                  ? "true"
                  : "false"
              }
              onChange={(e) =>
                handleActualChange(
                  "includeCustomerSuccess",
                  e.target.value
                )
              }
            >
              <option value="true">
                Yes, include NRR uplift
              </option>
              <option value="false">
                No, new ARR only
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-300">
              NRR benchmark (%)
            </label>
            <div className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-50">
              {formatPercent(benchmarks.nrr - 1)}
            </div>
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
              Fix weak funnel stages, close ACV gaps,
              or test the impact of more top-of-funnel.
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
          {/* Scenario 1: Fix weakest stage */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-100">
                {weakestStage
                  ? `Fix weakest stage (${weakestStage.label})`
                  : "Fix weakest stage"}
              </h3>
              <p className="text-xs text-slate-400">
                {weakestStage ? (
                  <>
                    {weakestStage.label} is currently
                    lagging target. Actual{" "}
                    {formatPercent(
                      weakestStage.actual
                    )}{" "}
                    vs target{" "}
                    {formatPercent(
                      weakestStage.target
                    )}
                    . See the impact of bringing it
                    back to benchmark on ARR.
                  </>
                ) : (
                  "All core stages are at or above target. Use ACV or Lead Volume scenarios below to test upside."
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

          {/* Scenario 2: ACV gap / fix to benchmark */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-100">
                {acvIsBelowBenchmark
                  ? "Fix ACV back to benchmark"
                  : "Lift ACV by 10%"}
              </h3>
              <p className="text-xs text-slate-400">
                {acvIsBelowBenchmark ? (
                  <>
                    Current ACV is{" "}
                    {formatCurrency(baseAcv)} vs
                    benchmark{" "}
                    {formatCurrency(benchmarks.acv)}.
                    See the impact of bringing ACV back
                    to benchmark on ARR.
                  </>
                ) : (
                  <>
                    Current ACV is around{" "}
                    {formatCurrency(baseAcv)}. See what
                    happens if you improve pricing,
                    discount discipline, or packaging
                    to lift ACV by 10%.
                  </>
                )}
              </p>
            </div>
            <button
              onClick={() =>
                applyScenario("acv-gap")
              }
              className={`mt-3 inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeScenario === "acv-gap"
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
                Model the impact of a 20% uplift in lead
                volume at current conversion rates. Useful
                for testing paid budget or new channel
                plays.
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

      {/* Scenario summary at the bottom */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="text-sm font-semibold text-slate-100">
          {scenarioName} – summary
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Forecast ARR is{" "}
          <span className="font-semibold text-slate-100">
            {formatCurrency(selectedMetrics.forecastArr)}
          </span>{" "}
          vs target{" "}
          <span className="font-semibold text-slate-100">
            {formatCurrency(benchmarks.targetArr)}
          </span>
          . You are{" "}
          <span
            className={
              isAhead
                ? "text-emerald-400 font-semibold"
                : "text-red-400 font-semibold"
            }
          >
            {isAhead ? "ahead" : "behind"}
          </span>{" "}
          by{" "}
          <span className="font-semibold text-slate-100">
            {formatCurrency(gapAbs)}
          </span>
          . Current run rate is{" "}
          <span className="font-semibold text-slate-100">
            {formatCurrency(selectedMetrics.currentRunRate)}
          </span>{" "}
          per month vs the required{" "}
          <span className="font-semibold text-slate-100">
            {formatCurrency(baseMetrics.requiredRunRate)}
          </span>{" "}
          to hit your ARR goal in{" "}
          <span className="font-semibold text-slate-100">
            {benchmarks.timeframeWeeks} weeks
          </span>
          .
        </p>
      </section>
    </div>
  );
};

export default MainDashboard;
