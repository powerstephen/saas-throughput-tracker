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
};

type ScenarioId =
  | "stage-1"
  | "stage-2"
  | "acv-10"
  | "leads-20"
  | "winrate-10"
  | null;

type ScenarioMetrics = {
  forecastArr: number;
  gapToTarget: number;
  currentRunRate: number;
};

type StageKey =
  | "leadsToMql"
  | "mqlToSql"
  | "sqlToOpp"
  | "oppToProposal"
  | "proposalToWin";

type StageInfo = {
  id: StageKey;
  label: string;
  actual: number;
  target: number;
  gap: number; // target - actual
};

type StageConversions = {
  leadsToMql: number;
  mqlToSql: number;
  sqlToOpp: number;
  oppToProposal: number;
  proposalToWin: number;
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

function getMonthsFromTimeframe(timeframe: Timeframe): number {
  const days = parseInt(timeframe, 10);
  return days / 30;
}

function clampNumber(num: number) {
  return Number.isFinite(num) ? num : 0;
}

function simulateWins(
  conv: StageConversions,
  leads: number
): number {
  const mqls = leads * conv.leadsToMql;
  const sqls = mqls * conv.mqlToSql;
  const opps = sqls * conv.sqlToOpp;
  const proposals = opps * conv.oppToProposal;
  const wins = proposals * conv.proposalToWin;
  return wins;
}

const MainDashboard: React.FC<MainDashboardProps> = ({
  benchmarks,
}) => {
  const [actuals, setActuals] = useState<Actuals>({
    timeframe: "90",
    leads: 1300,
    mqls: 160,
    sqls: 150,
    opps: 100,
    proposals: 40,
    wins: 20,
    newArr: 800_000,
    includeNrr: false,
  });

  const [activeScenario, setActiveScenario] =
    useState<ScenarioId>(null);
  const [scenarioMetrics, setScenarioMetrics] =
    useState<ScenarioMetrics | null>(null);

  const monthsInPeriod = useMemo(
    () => getMonthsFromTimeframe(actuals.timeframe),
    [actuals.timeframe]
  );

  // ----- Funnel conversions (actual) -----
  const actualConversions = useMemo<StageConversions>(() => {
    const leadsToMql =
      actuals.leads > 0
        ? actuals.mqls / actuals.leads
        : 0;
    const mqlToSql =
      actuals.mqls > 0
        ? actuals.sqls / actuals.mqls
        : 0;
    const sqlToOpp =
      actuals.sqls > 0
        ? actuals.opps / actuals.sqls
        : 0;
    const oppToProposal =
      actuals.opps > 0
        ? actuals.proposals / actuals.opps
        : 0;
    const proposalToWin =
      actuals.proposals > 0
        ? actuals.wins / actuals.proposals
        : 0;

    return {
      leadsToMql: clampNumber(leadsToMql),
      mqlToSql: clampNumber(mqlToSql),
      sqlToOpp: clampNumber(sqlToOpp),
      oppToProposal: clampNumber(oppToProposal),
      proposalToWin: clampNumber(proposalToWin),
    };
  }, [actuals]);

  const actualAcv = useMemo(() => {
    if (actuals.wins > 0) {
      return clampNumber(actuals.newArr / actuals.wins);
    }
    return benchmarks.acv;
  }, [actuals.newArr, actuals.wins, benchmarks.acv]);

  const effectiveNewArr = useMemo(() => {
    // If NRR is included, apply annual NRR multiplier
    return actuals.includeNrr
      ? actuals.newArr * benchmarks.nrr
      : actuals.newArr;
  }, [actuals.newArr, actuals.includeNrr, benchmarks.nrr]);

  const weeksInTargetPeriod = benchmarks.timeframeWeeks;
  const monthsInTargetPeriod =
    weeksInTargetPeriod / 4.345;

  // Base "modelled" wins from current funnel performance
  const winsBase = useMemo(() => {
    const simulated = simulateWins(
      actualConversions,
      actuals.leads
    );
    if (simulated > 0) return simulated;
    // Fallback so we never divide by zero later
    return actuals.wins > 0 ? actuals.wins : 1;
  }, [actualConversions, actuals.leads, actuals.wins]);

  // ----- Base metrics (no scenario applied) -----
  const baseMetrics = useMemo(() => {
    const currentRunRate =
      monthsInPeriod > 0
        ? effectiveNewArr / monthsInPeriod
        : 0;

    const forecastArr =
      benchmarks.currentArr +
      currentRunRate * monthsInTargetPeriod;

    const gapToTarget =
      forecastArr - benchmarks.targetArr;

    const requiredRunRate =
      monthsInTargetPeriod > 0
        ? (benchmarks.targetArr -
            benchmarks.currentArr) /
          monthsInTargetPeriod
        : 0;

    return {
      currentRunRate: clampNumber(currentRunRate),
      forecastArr: clampNumber(forecastArr),
      gapToTarget: clampNumber(gapToTarget),
      requiredRunRate: clampNumber(requiredRunRate),
    };
  }, [
    effectiveNewArr,
    monthsInPeriod,
    benchmarks.currentArr,
    benchmarks.targetArr,
    monthsInTargetPeriod,
  ]);

  const selectedMetrics = scenarioMetrics || baseMetrics;

  // ----- Stage gaps (including Leads → MQL) -----
  const stageOrder = useMemo<StageInfo[]>(() => {
    const stages: StageInfo[] = [
      {
        id: "leadsToMql",
        label: "Leads → MQL",
        actual: actualConversions.leadsToMql,
        target: benchmarks.leadsToMql,
        gap:
          benchmarks.leadsToMql -
          actualConversions.leadsToMql,
      },
      {
        id: "mqlToSql",
        label: "MQL → SQL",
        actual: actualConversions.mqlToSql,
        target: benchmarks.mqlToSql,
        gap:
          benchmarks.mqlToSql -
          actualConversions.mqlToSql,
      },
      {
        id: "sqlToOpp",
        label: "SQL → Opp",
        actual: actualConversions.sqlToOpp,
        target: benchmarks.sqlToOpp,
        gap:
          benchmarks.sqlToOpp -
          actualConversions.sqlToOpp,
      },
      {
        id: "oppToProposal",
        label: "Opp → Proposal",
        actual: actualConversions.oppToProposal,
        target: benchmarks.oppToProposal,
        gap:
          benchmarks.oppToProposal -
          actualConversions.oppToProposal,
      },
      {
        id: "proposalToWin",
        label: "Proposal → Win",
        actual: actualConversions.proposalToWin,
        target: benchmarks.proposalToWin,
        gap:
          benchmarks.proposalToWin -
          actualConversions.proposalToWin,
      },
    ];

    return stages;
  }, [actualConversions, benchmarks]);

  const {
    primaryStage,
    secondaryStage,
    underperformingStages,
  } = useMemo(() => {
    const withGap = stageOrder.map((s) => ({
      ...s,
      gap: s.target - s.actual,
    }));

    const underperf = withGap
      .filter((s) => s.gap > 0.001)
      .sort((a, b) => b.gap - a.gap);

    return {
      primaryStage: underperf[0] ?? null,
      secondaryStage: underperf[1] ?? null,
      underperformingStages: underperf,
    };
  }, [stageOrder]);

  // ----- Helper to create ScenarioMetrics from a new ARR number -----
  const buildMetricsFromNewArr = (
    newArrScenario: number
  ): ScenarioMetrics => {
    const currentRunRate =
      monthsInPeriod > 0
        ? newArrScenario / monthsInPeriod
        : 0;

    const forecastArr =
      benchmarks.currentArr +
      currentRunRate * monthsInTargetPeriod;

    const gapToTarget =
      forecastArr - benchmarks.targetArr;

    return {
      forecastArr: clampNumber(forecastArr),
      gapToTarget: clampNumber(gapToTarget),
      currentRunRate: clampNumber(currentRunRate),
    };
  };

  // ----- Apply scenarios -----
  const applyScenario = (scenario: ScenarioId) => {
    if (!scenario) {
      setActiveScenario(null);
      setScenarioMetrics(null);
      return;
    }

    let scenarioNewArr = effectiveNewArr;

    if (
      (scenario === "stage-1" ||
        scenario === "stage-2") &&
      underperformingStages.length
    ) {
      const stageInfo =
        scenario === "stage-1"
          ? primaryStage
          : secondaryStage;

      if (stageInfo) {
        const scenarioConv: StageConversions = {
          ...actualConversions,
          [stageInfo.id]:
            benchmarks[stageInfo.id],
        };

        const winsScenario = simulateWins(
          scenarioConv,
          actuals.leads
        );

        if (winsBase > 0 && winsScenario > 0) {
          const multiplier =
            winsScenario / winsBase;
          scenarioNewArr =
            effectiveNewArr * multiplier;
        }
      }
    } else if (scenario === "acv-10") {
      // 10% ACV uplift => 10% uplift on incremental ARR
      scenarioNewArr = effectiveNewArr * 1.1;
    } else if (scenario === "leads-20") {
      const boostedLeads = actuals.leads * 1.2;
      const winsScenario = simulateWins(
        actualConversions,
        boostedLeads
      );

      if (winsBase > 0 && winsScenario > 0) {
        const multiplier =
          winsScenario / winsBase;
        scenarioNewArr =
          effectiveNewArr * multiplier;
      }
    } else if (scenario === "winrate-10") {
      const boostedConv: StageConversions = {
        ...actualConversions,
        proposalToWin: Math.min(
          1,
          actualConversions.proposalToWin * 1.1
        ),
      };
      const winsScenario = simulateWins(
        boostedConv,
        actuals.leads
      );
      if (winsBase > 0 && winsScenario > 0) {
        const multiplier =
          winsScenario / winsBase;
        scenarioNewArr =
          effectiveNewArr * multiplier;
      }
    }

    setActiveScenario(scenario);
    setScenarioMetrics(
      buildMetricsFromNewArr(scenarioNewArr)
    );
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

      if (field === "includeNrr") {
        return {
          ...prev,
          includeNrr: value === "true",
        };
      }

      const numeric = Number(
        value.replace(/[^0-9.-]/g, "")
      );
      return {
        ...prev,
        [field]: isNaN(numeric) ? 0 : numeric,
      };
    });
  };

  // ----- Hero card statuses -----
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

  // ----- Deltas vs benchmark for top row -----
  const leadsBenchmarkForPeriod =
    benchmarks.newLeadsPerMonth *
    monthsInPeriod;
  const leadsDelta =
    actuals.leads - leadsBenchmarkForPeriod;

  const expectedMqls =
    actuals.leads * benchmarks.leadsToMql;
  const mqlsDelta = actuals.mqls - expectedMqls;

  const expectedSqls =
    expectedMqls * benchmarks.mqlToSql;
  const sqlsDelta = actuals.sqls - expectedSqls;

  const expectedOpps =
    expectedSqls * benchmarks.sqlToOpp;
  const oppsDelta = actuals.opps - expectedOpps;

  const expectedProposals =
    expectedOpps * benchmarks.oppToProposal;
  const proposalsDelta =
    actuals.proposals - expectedProposals;

  const expectedWins =
    expectedProposals *
    benchmarks.proposalToWin;
  const winsDelta = actuals.wins - expectedWins;

  const acvDelta = actualAcv - benchmarks.acv;

  // ----- Build scenario cards (content + ordering) -----
  type ScenarioCardConfig = {
    id: ScenarioId;
    title: string;
    body: string;
  };

  const scenarioCards: ScenarioCardConfig[] =
    useMemo(() => {
      const cards: ScenarioCardConfig[] = [];

      // 1–2 stage-fix cards if any stages are below target
      if (underperformingStages.length) {
        if (primaryStage) {
          cards.push({
            id: "stage-1",
            title: `Fix ${primaryStage.label} back to benchmark`,
            body: `${primaryStage.label} is currently ${formatPercent(
              primaryStage.actual
            )} vs target ${formatPercent(
              primaryStage.target
            )}. See the impact on ARR of bringing this stage back to benchmark.`,
          });
        }
        if (secondaryStage) {
          cards.push({
            id: "stage-2",
            title: `Fix ${secondaryStage.label} next`,
            body: `${secondaryStage.label} is ${formatPercent(
              secondaryStage.actual
            )} vs target ${formatPercent(
              secondaryStage.target
            )}. See the incremental ARR if you also fix this stage.`,
          });
        }
      }

      // Upside levers – always available
      const upsideOptions: ScenarioCardConfig[] = [
        {
          id: "acv-10",
          title: "Increase ACV by 10%",
          body: `Current ACV is ${formatCurrency(
            actualAcv
          )} vs benchmark ${formatCurrency(
            benchmarks.acv
          )}. See what a 10% ACV uplift does to ARR.`,
        },
        {
          id: "leads-20",
          title: "Increase lead volume by 20%",
          body: "Model the impact of a 20% uplift in lead volume at current conversion rates. Useful for testing paid budget or new channel plays.",
        },
        {
          id: "winrate-10",
          title: "Increase win rate by 10%",
          body: "Simulate a 10% relative uplift in Proposal → Win conversion to see how improved sales execution impacts ARR.",
        },
      ];

      // If there are *no* underperforming stages, just show upside scenarios
      if (!underperformingStages.length) {
        return upsideOptions.slice(0, 3);
      }

      // Otherwise, append upside scenarios AFTER the stage fixes
      const remainingSlots = Math.max(
        0,
        3 - cards.length
      );
      if (remainingSlots > 0) {
        cards.push(
          ...upsideOptions.slice(0, remainingSlots)
        );
      }

      return cards.slice(0, 3);
    }, [
      underperformingStages,
      primaryStage,
      secondaryStage,
      actualAcv,
      benchmarks.acv,
    ]);

  // ----- Render -----
  return (
    <div className="space-y-6">
      {/* Current funnel velocity / inputs */}
      <section className="rounded-2xl border border-slate-800 bg-slate-950 px-6 py-5 shadow-lg shadow-slate-950/40">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-50">
              Current Funnel Velocity (Last
              30/60/90 Days)
            </h2>
            <p className="text-sm text-slate-400">
              Plug in a recent 30 / 60 / 90-day period.
              The model will project this performance
              against your ARR target.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300">
              Timeframe
            </span>
            <select
              className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-50"
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
          {[
            {
              label: "Leads",
              field: "leads" as const,
              value: actuals.leads,
              delta: leadsDelta,
            },
            {
              label: "MQLs",
              field: "mqls" as const,
              value: actuals.mqls,
              delta: mqlsDelta,
            },
            {
              label: "SQLs",
              field: "sqls" as const,
              value: actuals.sqls,
              delta: sqlsDelta,
            },
            {
              label: "Opportunities",
              field: "opps" as const,
              value: actuals.opps,
              delta: oppsDelta,
            },
            {
              label: "Proposals",
              field: "proposals" as const,
              value: actuals.proposals,
              delta: proposalsDelta,
            },
            {
              label: "Wins",
              field: "wins" as const,
              value: actuals.wins,
              delta: winsDelta,
            },
          ].map((item) => (
            <div key={item.label}>
              <label className="block text-xs font-medium text-slate-300">
                {item.label}
              </label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none"
                value={item.value}
                onChange={(e) =>
                  handleActualChange(
                    item.field,
                    e.target.value
                  )
                }
              />
              <div
                className={`mt-1 text-xs ${
                  item.delta > 0
                    ? "text-emerald-400"
                    : item.delta < 0
                    ? "text-rose-400"
                    : "text-slate-500"
                }`}
              >
                {item.delta > 0 && "↑ "}
                {item.delta < 0 && "↓ "}
                {item.delta !== 0 &&
                  Math.abs(
                    Math.round(item.delta)
                  ).toLocaleString("en-IE")}
              </div>
            </div>
          ))}
        </div>

        {/* Second row: ARR, ACV, NRR */}
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {/* New ARR in period */}
          <div>
            <label className="block text-xs font-medium text-slate-300">
              New ARR in Period
            </label>
            <div className="mt-1 flex items-center gap-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2">
              <span className="text-sm text-slate-400">
                €
              </span>
              <input
                type="text"
                className="w-full bg-transparent text-sm text-slate-50 outline-none"
                value={
                  actuals.newArr
                    ? actuals.newArr.toLocaleString(
                        "en-IE",
                        {
                          maximumFractionDigits: 0,
                        }
                      )
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
          </div>

          {/* ACV */}
          <div>
            <label className="block text-xs font-medium text-slate-300">
              Average contract value (ACV)
            </label>
            <div className="mt-1 flex items-center gap-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2">
              <span className="text-sm text-slate-400">
                €
              </span>
              <input
                type="text"
                className="w-full bg-transparent text-sm text-slate-50 outline-none"
                value={
                  actualAcv
                    ? actualAcv.toLocaleString(
                        "en-IE",
                        {
                          maximumFractionDigits: 0,
                        }
                      )
                    : ""
                }
                readOnly
              />
            </div>
            <div
              className={`mt-1 text-xs ${
                acvDelta > 0
                  ? "text-emerald-400"
                  : acvDelta < 0
                  ? "text-rose-400"
                  : "text-slate-500"
              }`}
            >
              {acvDelta > 0 && "↑ "}
              {acvDelta < 0 && "↓ "}
              {acvDelta !== 0 &&
                formatCurrency(Math.abs(acvDelta))}{" "}
              vs ACV benchmark
            </div>
          </div>

          {/* Include NRR toggle */}
          <div>
            <label className="block text-xs font-medium text-slate-300">
              Include NRR in ARR path
            </label>
            <select
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none"
              value={actuals.includeNrr ? "true" : "false"}
              onChange={(e) =>
                handleActualChange(
                  "includeNrr",
                  e.target.value
                )
              }
            >
              <option value="false">
                No, new ARR only
              </option>
              <option value="true">
                Yes, include NRR uplift
              </option>
            </select>
          </div>

          {/* NRR benchmark */}
          <div>
            <label className="block text-xs font-medium text-slate-300">
              NRR benchmark (%)
            </label>
            <div className="mt-1 flex items-center gap-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2">
              <input
                type="number"
                className="w-full bg-transparent text-sm text-slate-50 outline-none"
                value={Math.round(
                  benchmarks.nrr * 100
                )}
                readOnly
              />
              <span className="text-sm text-slate-400">
                %
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Hero metrics */}
      <section className="grid gap-4 md:grid-cols-5">
        <HeroCard
          title="Target ARR"
          value={formatCurrency(
            benchmarks.targetArr
          )}
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
              Fix the weakest funnel stages first, then
              test ACV, lead volume, or win-rate levers to
              find the fastest route to target.
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
          {scenarioCards.map((card) => (
            <div
              key={card.id ?? "none"}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-4"
            >
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-100">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-400">
                  {card.body}
                </p>
              </div>
              <button
                onClick={() =>
                  card.id && applyScenario(card.id)
                }
                className={`mt-3 inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  activeScenario === card.id
                    ? "bg-sky-500 text-slate-950"
                    : "bg-slate-800 text-slate-100 hover:bg-slate-700"
                }`}
              >
                Show scenario impact
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Snapshot summary */}
      <section className="rounded-2xl border border-slate-800 bg-slate-950 px-6 py-4 text-xs text-slate-300">
        <p>
          Snapshot: With current funnel performance,
          you’re on a path to{" "}
          <span className="font-semibold">
            {formatCurrency(
              baseMetrics.forecastArr
            )}
          </span>{" "}
          vs a target of{" "}
          <span className="font-semibold">
            {formatCurrency(benchmarks.targetArr)}
          </span>
          . The biggest gaps are in{" "}
          {underperformingStages.length
            ? underperformingStages
                .slice(0, 2)
                .map((s) => s.label)
                .join(" and ")
            : "volume and commercial levers (ACV, win rate, and new leads)"}
          . Use the scenarios above to see which
          lever creates the fastest route to target.
        </p>
      </section>
    </div>
  );
};

export default MainDashboard;
