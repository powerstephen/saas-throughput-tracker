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
  churnRate: number; // monthly
  expansionRate: number; // monthly
};

type ScenarioId = "weakest-stage" | "lift-acv" | "boost-leads" | null;

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

const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

function getMonthsFromTimeframe(timeframe: Timeframe): number {
  const days = parseInt(timeframe, 10);
  return days / 30;
}

function clampNumber(num: number) {
  return Number.isFinite(num) ? num : 0;
}

const MainDashboard: React.FC<MainDashboardProps> = ({ benchmarks }) => {
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
    churnRate: 0.01,
    expansionRate: 0.02,
  });

  const [activeScenario, setActiveScenario] = useState<ScenarioId>(null);
  const [scenarioMetrics, setScenarioMetrics] =
    useState<ScenarioMetrics | null>(null);

  const monthsInPeriod = useMemo(
    () => getMonthsFromTimeframe(actuals.timeframe),
    [actuals.timeframe]
  );

  const baseAcv = useMemo(() => {
    if (actuals.wins > 0) {
      const acv = actuals.newArr / actuals.wins;
      return clampNumber(acv);
    }
    // fall back to benchmark ACV if we don't have enough recent win data
    return benchmarks.acv;
  }, [actuals.newArr, actuals.wins, benchmarks.acv]);

  const baseMetrics = useMemo(() => {
    const currentRunRate =
      monthsInPeriod > 0 ? actuals.newArr / monthsInPeriod : 0;

    const weeksInTimeframe = benchmarks.timeframeWeeks;
    const monthsInTargetPeriod = weeksInTimeframe / 4.345;

    // Base forecast from pure new ARR
    const baseForecast = currentRunRate * monthsInTargetPeriod;

    // If NRR is included, apply an NRR factor over the target period
    let forecastArr = baseForecast;
    if (actuals.includeCustomerSuccess) {
      const yearsInTargetPeriod = weeksInTimeframe / 52;
      const nrrMultiple = benchmarks.nrr || 1; // e.g. 1.2 = 120% NRR per year
      const nrrFactor = Math.pow(nrrMultiple, yearsInTargetPeriod);
      forecastArr = baseForecast * nrrFactor;
    }

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
  }, [
    actuals.newArr,
    monthsInPeriod,
    benchmarks.targetArr,
    benchmarks.timeframeWeeks,
    benchmarks.nrr,
    actuals.includeCustomerSuccess,
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
      actuals.opps > 0 ? actuals.proposals / actuals.opps : 0;
    const proposalToWin =
      actuals.proposals > 0 ? actuals.wins / actuals.proposals : 0;

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

    const negativeOnly = withGap.filter((s) => s.gap > 0.001);
    if (!negativeOnly.length) return null;

    negativeOnly.sort((a, b) => b.gap - a.gap);
    return negativeOnly[0];
  }, [conversionRates, benchmarks]);

  // 🔁 Shared scenario calculator used for both previews and applying scenarios
  const computeScenarioMetrics = (
    scenario: ScenarioId
  ): ScenarioMetrics | null => {
    const weeksInTimeframe = benchmarks.timeframeWeeks;
    const monthsInTargetPeriod = weeksInTimeframe / 4.345;
    const yearsInTargetPeriod = weeksInTimeframe / 52;
    const nrrMultiple = benchmarks.nrr || 1;
    const nrrFactor = actuals.includeCustomerSuccess
      ? Math.pow(nrrMultiple, yearsInTargetPeriod)
      : 1;

    if (scenario === "weakest-stage") {
      if (!weakestStage) return null;

      let { leads, mqls, sqls, opps, proposals } = actuals;
      let wins = actuals.wins;

      if (weakestStage.id === "mqlToSql") {
        const newSqls = Math.round(mqls * benchmarks.mqlToSql);
        const newOpps = conversionRates.sqlToOpp * newSqls;
        const newProposals =
          conversionRates.oppToProposal * newOpps;
        const newWins =
          conversionRates.proposalToWin * newProposals;
        wins = newWins;
      } else if (weakestStage.id === "sqlToOpp") {
        const newOpps = Math.round(sqls * benchmarks.sqlToOpp);
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

      const newArr = wins * baseAcv;
      const currentRunRate =
        monthsInPeriod > 0 ? newArr / monthsInPeriod : 0;

      const baseForecast =
        currentRunRate * monthsInTargetPeriod;
      const forecastArr = baseForecast * nrrFactor;
      const gapToTarget = forecastArr - benchmarks.targetArr;

      return {
        forecastArr: clampNumber(forecastArr),
        gapToTarget: clampNumber(gapToTarget),
        currentRunRate: clampNumber(currentRunRate),
      };
    }

    if (scenario === "lift-acv") {
      const improvedAcv = baseAcv * 1.1;
      const newArr = actuals.wins * improvedAcv;
      const currentRunRate =
        monthsInPeriod > 0 ? newArr / monthsInPeriod : 0;

      const baseForecast =
        currentRunRate * monthsInTargetPeriod;
      const forecastArr = baseForecast * nrrFactor;
      const gapToTarget = forecastArr - benchmarks.targetArr;

      return {
        forecastArr: clampNumber(forecastArr),
        gapToTarget: clampNumber(gapToTarget),
        currentRunRate: clampNumber(currentRunRate),
      };
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

      const newArr = wins * baseAcv;
      const currentRunRate =
        monthsInPeriod > 0 ? newArr / monthsInPeriod : 0;

      const baseForecast =
        currentRunRate * monthsInTargetPeriod;
      const forecastArr = baseForecast * nrrFactor;
      const gapToTarget = forecastArr - benchmarks.targetArr;

      return {
        forecastArr: clampNumber(forecastArr),
        gapToTarget: clampNumber(gapToTarget),
        currentRunRate: clampNumber(currentRunRate),
      };
    }

    return null;
  };

  const applyScenario = (scenario: ScenarioId) => {
    if (!scenario) {
      setActiveScenario(null);
      setScenarioMetrics(null);
      return;
    }

    const metrics = computeScenarioMetrics(scenario);
    if (!metrics) {
      setActiveScenario(null);
      setScenarioMetrics(null);
      return;
    }

    setActiveScenario(scenario);
    setScenarioMetrics(metrics);
  };

  const handleActualChange = (field: keyof Actuals, value: string) => {
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
          includeCustomerSuccess: value === "true",
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
    selectedMetrics.gapToTarget >= 0 ? "Ahead" : "Behind";

  const gapStatusTone =
    selectedMetrics.gapToTarget >= 0 ? "good" : "bad";

  const runRateStatusTone =
    selectedMetrics.currentRunRate >= baseMetrics.requiredRunRate
      ? "good"
      : "warning";

  const gapAbs = Math.abs(selectedMetrics.gapToTarget);

  // 🔍 Scenario previews for ARR impact text
  const weakestPreview = computeScenarioMetrics("weakest-stage");
  const liftAcvPreview = computeScenarioMetrics("lift-acv");
  const boostLeadsPreview = computeScenarioMetrics("boost-leads");

  const weakestArrUplift =
    weakestPreview?.forecastArr && baseMetrics.forecastArr
      ? weakestPreview.forecastArr - baseMetrics.forecastArr
      : 0;

  const liftAcvArrUplift =
    liftAcvPreview?.forecastArr && baseMetrics.forecastArr
      ? liftAcvPreview.forecastArr - baseMetrics.forecastArr
      : 0;

  const boostLeadsArrUplift =
    boostLeadsPreview?.forecastArr && baseMetrics.forecastArr
      ? boostLeadsPreview.forecastArr - baseMetrics.forecastArr
      : 0;

  // ⭐ Fallback lever when there is no weak stage
  const fallbackLever: ScenarioId =
    liftAcvArrUplift >= boostLeadsArrUplift
      ? "lift-acv"
      : "boost-leads";

  return (
    <div className="space-y-6">
      {/* Current Funnel Velocity */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-slate-950/40">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Current Funnel Velocity (Last 30/60/90 Days)
            </h2>
            <p className="text-xs text-slate-400">
              Plug in a recent 30 / 60 / 90-day period. The model will
              project this performance against your ARR target.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-300">Timeframe</label>
            <select
              className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs"
              value={actuals.timeframe}
              onChange={(e) =>
                handleActualChange("timeframe", e.target.value)
              }
            >
              <option value="30">Last 30 days</option>
              <option value="60">Last 60 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-6">
          <div className="md:col-span-1">
            <label className="block text-xs text-slate-300">
              Leads
            </label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
              value={actuals.leads}
              onChange={(e) =>
                handleActualChange("leads", e.target.value)
              }
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs text-slate-300">
              MQLs
            </label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
              value={actuals.mqls}
              onChange={(e) =>
                handleActualChange("mqls", e.target.value)
              }
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs text-slate-300">
              SQLs
            </label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
              value={actuals.sqls}
              onChange={(e) =>
                handleActualChange("sqls", e.target.value)
              }
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs text-slate-300">
              Opportunities
            </label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
              value={actuals.opps}
              onChange={(e) =>
                handleActualChange("opps", e.target.value)
              }
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs text-slate-300">
              Proposals
            </label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
              value={actuals.proposals}
              onChange={(e) =>
                handleActualChange("proposals", e.target.value)
              }
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs text-slate-300">
              Wins
            </label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
              value={actuals.wins}
              onChange={(e) =>
                handleActualChange("wins", e.target.value)
              }
            />
          </div>

          {/* Bottom row: New ARR, ACV, NRR toggle, Current NRR – all equal width */}
          <div className="md:col-span-1">
            <label className="block text-xs text-slate-300">
              New ARR in this timeframe (€)
            </label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
              value={actuals.newArr}
              onChange={(e) =>
                handleActualChange("newArr", e.target.value)
              }
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs text-slate-300">
              Average Contract Value (€)
            </label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200"
              value={
                actuals.wins > 0
                  ? Math.round(actuals.newArr / actuals.wins)
                  : 0
              }
              readOnly
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs text-slate-300">
              Include NRR in ARR path
            </label>
            <select
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
              value={
                actuals.includeCustomerSuccess ? "true" : "false"
              }
              onChange={(e) =>
                handleActualChange(
                  "includeCustomerSuccess",
                  e.target.value
                )
              }
            >
              <option value="true">
                Yes, include NRR impact
              </option>
              <option value="false">
                No, use new ARR only
              </option>
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs text-slate-300">
              Current NRR (%)
            </label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
              value={Math.round(benchmarks.nrr * 100)}
              readOnly
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
          value={formatCurrency(selectedMetrics.forecastArr)}
          subtitle="Based on current run rate"
          statusLabel={
            selectedMetrics.forecastArr >= benchmarks.targetArr
              ? "Above target"
              : "Below target"
          }
          statusTone={
            selectedMetrics.forecastArr >= benchmarks.targetArr
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
          value={formatCurrency(selectedMetrics.currentRunRate)}
          subtitle="Average new ARR per month"
          statusLabel={
            runRateStatusTone === "good" ? "On track" : "Needs lift"
          }
          statusTone={runRateStatusTone}
        />
        <HeroCard
          title="Required Run Rate"
          value={formatCurrency(baseMetrics.requiredRunRate)}
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
              The model flags underperforming stages and shows what
              happens if you fix them or pull key levers.
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
          {/* Scenario 1: Fix weakest stage / best upside lever */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-100">
                {weakestStage
                  ? `Fix weakest stage (${weakestStage.label})`
                  : "Test biggest upside lever"}
              </h3>
              <p className="text-xs text-slate-400">
                {weakestStage ? (
                  <>
                    {weakestStage.label} is currently lagging
                    target. Actual{" "}
                    {formatPercent(weakestStage.actual)} vs
                    target {formatPercent(weakestStage.target)}.
                    {weakestArrUplift > 0 && (
                      <>
                        {" "}
                        Fixing this unlocks around{" "}
                        <span className="font-semibold text-slate-100">
                          {formatCurrency(weakestArrUplift)}
                        </span>{" "}
                        in forecast ARR over the target period.
                      </>
                    )}
                  </>
                ) : (
                  <>
                    All main stages are at or above target. We’ll
                    automatically test the biggest upside lever –
                    either a{" "}
                    <span className="font-semibold">
                      10% ACV lift
                    </span>{" "}
                    or{" "}
                    <span className="font-semibold">
                      20% lead volume increase
                    </span>
                    , depending on which adds more ARR.
                  </>
                )}
              </p>
            </div>
            <button
              onClick={() =>
                weakestStage
                  ? applyScenario("weakest-stage")
                  : applyScenario(fallbackLever)
              }
              className={`mt-3 inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeScenario === "weakest-stage" &&
                weakestStage
                  ? "bg-sky-500 text-slate-950"
                  : !weakestStage &&
                    (activeScenario === "lift-acv" ||
                      activeScenario === "boost-leads")
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
                {formatCurrency(baseAcv)}. Lifting ACV by 10%
                through pricing, discount discipline, or packaging
                would add{" "}
                <span className="font-semibold text-slate-100">
                  {liftAcvArrUplift > 0
                    ? formatCurrency(liftAcvArrUplift)
                    : "€0"}
                </span>{" "}
                in forecast ARR over the target period at current
                funnel performance.
              </p>
            </div>
            <button
              onClick={() => applyScenario("lift-acv")}
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
                Model the impact of a 20% uplift in lead volume at
                current conversion rates. At your current funnel
                performance, this would add{" "}
                <span className="font-semibold text-slate-100">
                  {boostLeadsArrUplift > 0
                    ? formatCurrency(boostLeadsArrUplift)
                    : "€0"}
                </span>{" "}
                in forecast ARR over the target period.
              </p>
            </div>
            <button
              onClick={() => applyScenario("boost-leads")}
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

      {/* Snapshot summary */}
      <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
        <h2 className="text-sm font-semibold text-slate-100">
          Snapshot summary
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Quick readout of where you stand versus target and where
          to focus.
        </p>

        <div className="mt-3 grid gap-3 text-xs text-slate-200 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
            <p className="text-slate-400">ARR position</p>
            <p className="mt-1 font-semibold">
              {gapStatusLabel} by {formatCurrency(gapAbs)}
            </p>
            <p className="mt-1 text-slate-400">
              Forecast ARR vs target based on current funnel
              velocity
              {actuals.includeCustomerSuccess
                ? " and NRR path."
                : "."}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
            <p className="text-slate-400">Biggest funnel lever</p>
            {weakestStage ? (
              <>
                <p className="mt-1 font-semibold">
                  {weakestStage.label}
                </p>
                <p className="mt-1 text-slate-400">
                  {formatPercent(weakestStage.actual)} actual vs{" "}
                  {formatPercent(weakestStage.target)} target.
                  {weakestArrUplift > 0 && (
                    <>
                      {" "}
                      Fixing this unlocks{" "}
                      {formatCurrency(weakestArrUplift)} in
                      forecast ARR.
                    </>
                  )}
                </p>
              </>
            ) : (
              <p className="mt-1 text-slate-400">
                No clear bottleneck – all main stages are at or
                above target. Focus on ACV or lead volume for
                further upside.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
            <p className="text-slate-400">NRR impact</p>
            <p className="mt-1 font-semibold">
              {actuals.includeCustomerSuccess
                ? `NRR ON – modelling ~${Math.round(
                    benchmarks.nrr * 100
                  )}% annual NRR`
                : "NRR OFF – new ARR only"}
            </p>
            <p className="mt-1 text-slate-400">
              Toggle NRR in the funnel section to see how retention
              and expansion shift your ARR trajectory.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MainDashboard;
