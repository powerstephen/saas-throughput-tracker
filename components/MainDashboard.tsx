// components/MainDashboard.tsx
"use client";

import React, { useMemo, useState } from "react";
import HeroCard from "./HeroCard";

export type Benchmarks = {
  targetArr: number;
  currentArr: number;
  timeframeWeeks: number;
};

export type Actuals = {
  timeframeDays: 30 | 60 | 90;
  leads: number;
  mqls: number;
  sqls: number;
  opps: number;
  proposals: number;
  wins: number;
  newArr: number;
  includeNRR: boolean;
};

type ScenarioKey = "weakest" | "volume20" | "combo";

const defaultBenchmarks: Benchmarks = {
  currentArr: 10000000,
  targetArr: 10000000,
  timeframeWeeks: 52,
};

const defaultActuals: Actuals = {
  timeframeDays: 90,
  leads: 4000,
  mqls: 1000,
  sqls: 400,
  opps: 150,
  proposals: 70,
  wins: 20,
  newArr: 1520833,
  includeNRR: false,
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export default function MainDashboard() {
  const [benchmarks, setBenchmarks] = useState<Benchmarks>(defaultBenchmarks);
  const [actuals, setActuals] = useState<Actuals>(defaultActuals);
  const [activeScenario, setActiveScenario] = useState<ScenarioKey | null>(null);

  const daysToMonthsFactor = (days: number) => days / 30;

  const baseMetrics = useMemo(() => {
    const months = daysToMonthsFactor(actuals.timeframeDays);
    const currentRunRate = actuals.newArr / months; // ARR / month from input period

    const totalMonthsToTarget = benchmarks.timeframeWeeks / 4.345;
    const forecastArr =
      benchmarks.currentArr + currentRunRate * totalMonthsToTarget;

    const gapToTarget = benchmarks.targetArr - forecastArr;
    const requiredRunRate =
      benchmarks.targetArr > benchmarks.currentArr
        ? (benchmarks.targetArr - benchmarks.currentArr) / totalMonthsToTarget
        : 0;

    return {
      currentRunRate,
      forecastArr,
      gapToTarget,
      requiredRunRate,
      targetArr: benchmarks.targetArr,
    };
  }, [benchmarks, actuals]);

  // --- scenario engine -------------------------------------------------------

  type ScenarioResult = {
    label: string;
    description: string;
    metrics: typeof baseMetrics;
  };

  function applyScenario(key: ScenarioKey | null): ScenarioResult {
    if (!key) {
      return {
        label: "Base case",
        description: "Using current inputs with no scenario applied.",
        metrics: baseMetrics,
      };
    }

    const totalMonthsToTarget = benchmarks.timeframeWeeks / 4.345;

    if (key === "volume20") {
      const boostedArr = actuals.newArr * 1.2;
      const boostedRunRate = boostedArr / daysToMonthsFactor(actuals.timeframeDays);
      const boostedForecast =
        benchmarks.currentArr + boostedRunRate * totalMonthsToTarget;
      const boostedGap = benchmarks.targetArr - boostedForecast;
      const boostedRequired =
        benchmarks.targetArr > benchmarks.currentArr
          ? (benchmarks.targetArr - benchmarks.currentArr) /
            totalMonthsToTarget
          : 0;

      return {
        label: "Increase lead volume by 20%",
        description:
          "Keeps conversion rates constant but increases volume at the top of the funnel.",
        metrics: {
          targetArr: benchmarks.targetArr,
          currentRunRate: boostedRunRate,
          forecastArr: boostedForecast,
          gapToTarget: boostedGap,
          requiredRunRate: boostedRequired,
        },
      };
    }

    if (key === "weakest") {
      // find weakest conversion vs simple “good” benchmark
      const convLeadToMql = actuals.leads ? actuals.mqls / actuals.leads : 0;
      const convMqlToSql = actuals.mqls ? actuals.sqls / actuals.mqls : 0;
      const convSqlToOpp = actuals.sqls ? actuals.opps / actuals.sqls : 0;
      const convOppToProp = actuals.opps ? actuals.proposals / actuals.opps : 0;
      const convPropToWin = actuals.proposals ? actuals.wins / actuals.proposals : 0;

      const bench = {
        ltM: 0.25,
        mtS: 0.4,
        sTO: 0.35,
        oTP: 0.5,
        pTW: 0.25,
      };

      const deltas = [
        { key: "Lead → MQL", value: bench.ltM - convLeadToMql },
        { key: "MQL → SQL", value: bench.mtS - convMqlToSql },
        { key: "SQL → Opp", value: bench.sTO - convSqlToOpp },
        { key: "Opp → Proposal", value: bench.oTP - convOppToProp },
        { key: "Proposal → Win", value: bench.pTW - convPropToWin },
      ];

      deltas.sort((a, b) => b.value - a.value);
      const weakestStage = deltas[0];

      // model: lift weakest stage halfway back toward “good”
      const factor =
        1 + Math.max(0, Math.min(weakestStage.value / 2, 0.3)); // cap +30%

      const improvedWins = actuals.wins * factor;
      const acv = actuals.wins ? actuals.newArr / actuals.wins : 0;
      const improvedNewArr = improvedWins * acv;
      const improvedRunRate =
        improvedNewArr / daysToMonthsFactor(actuals.timeframeDays);
      const improvedForecast =
        benchmarks.currentArr + improvedRunRate * totalMonthsToTarget;
      const improvedGap = benchmarks.targetArr - improvedForecast;

      const improvedRequired =
        benchmarks.targetArr > benchmarks.currentArr
          ? (benchmarks.targetArr - benchmarks.currentArr) /
            totalMonthsToTarget
          : 0;

      return {
        label: `Fix weakest stage: ${weakestStage.key}`,
        description:
          "Models closing part of the gap between actual and target conversion at the weakest stage.",
        metrics: {
          targetArr: benchmarks.targetArr,
          currentRunRate: improvedRunRate,
          forecastArr: improvedForecast,
          gapToTarget: improvedGap,
          requiredRunRate: improvedRequired,
        },
      };
    }

    // combo: both volume and weakest-stage uplift
    const volScenario = applyScenario("volume20");
    const weakScenario = applyScenario("weakest");

    // very simple blend: average of the two improved run rates
    const blendedRunRate =
      (volScenario.metrics.currentRunRate +
        weakScenario.metrics.currentRunRate) /
      2;
    const totalMonthsToTargetCombo = benchmarks.timeframeWeeks / 4.345;
    const blendedForecast =
      benchmarks.currentArr + blendedRunRate * totalMonthsToTargetCombo;
    const blendedGap = benchmarks.targetArr - blendedForecast;
    const blendedRequired =
      benchmarks.targetArr > benchmarks.currentArr
        ? (benchmarks.targetArr - benchmarks.currentArr) /
          totalMonthsToTargetCombo
        : 0;

    return {
      label: "Combo: fix stage + more leads",
      description:
        "Models a more aggressive path by improving the weakest stage and increasing volume.",
      metrics: {
        targetArr: benchmarks.targetArr,
        currentRunRate: blendedRunRate,
        forecastArr: blendedForecast,
        gapToTarget: blendedGap,
        requiredRunRate: blendedRequired,
      },
    };
  }

  const applied = applyScenario(activeScenario);

  const heroCards = [
    {
      title: "Target ARR",
      value: formatCurrency(applied.metrics.targetArr),
      subtitle: "Goal you are working towards",
      statusLabel: "On track",
      tone: "good" as const,
    },
    {
      title: "Forecast ARR",
      value: formatCurrency(applied.metrics.forecastArr),
      subtitle: "Based on current run rate",
      statusLabel:
        applied.metrics.forecastArr >= benchmarks.targetArr ? "Above" : "Below",
      tone:
        applied.metrics.forecastArr >= benchmarks.targetArr
          ? ("good" as const)
          : ("warning" as const),
    },
    {
      title: "Gap to target ARR",
      value: formatCurrency(
        Math.abs(applied.metrics.gapToTarget || 0)
      ),
      subtitle: "Ahead or behind target",
      statusLabel:
        applied.metrics.gapToTarget >= 0 ? "Behind" : "Ahead",
      tone:
        applied.metrics.gapToTarget >= 0
          ? ("warning" as const)
          : ("good" as const),
    },
    {
      title: "Current run rate",
      value: formatCurrency(applied.metrics.currentRunRate),
      subtitle: "Average new ARR per month",
      statusLabel: "Close to target",
      tone: "warning" as const,
    },
    {
      title: "Required run rate",
      value: formatCurrency(applied.metrics.requiredRunRate),
      subtitle: "Average new ARR needed",
      statusLabel:
        applied.metrics.currentRunRate >= applied.metrics.requiredRunRate
          ? "On track"
          : "Stretch",
      tone:
        applied.metrics.currentRunRate >= applied.metrics.requiredRunRate
          ? ("good" as const)
          : ("warning" as const),
    },
  ];

  return (
    <div className="dashboard-root">
      {/* You already have your benchmarks + inputs section above this */}
      <section className="throughput-section">
        <h2 className="section-title">Throughput and ARR path</h2>

        <div className="hero-grid">
          {heroCards.map((card) => (
            <HeroCard
              key={card.title}
              title={card.title}
              value={card.value}
              subtitle={card.subtitle}
              statusLabel={card.statusLabel}
              statusTone={card.tone}
            />
          ))}
        </div>

        <div className="scenario-section">
          <h3 className="section-subtitle">
            Priority scenarios to improve outcome
          </h3>
          <p className="section-helper">
            These scenarios show how fixing bottlenecks or increasing volume
            would impact your forecast and gap to target in this timeframe.
          </p>

          <div className="scenario-grid">
            <div className="scenario-card">
              <h4 className="scenario-title">
                {applyScenario("weakest").label}
              </h4>
              <p className="scenario-body">
                Bring the lowest-performing funnel step closer to benchmark and
                see the ARR unlocked without more spend at the top of the
                funnel.
              </p>
              <button
                className={
                  activeScenario === "weakest"
                    ? "scenario-button scenario-button-active"
                    : "scenario-button"
                }
                onClick={() =>
                  setActiveScenario(
                    activeScenario === "weakest" ? null : "weakest"
                  )
                }
              >
                Show scenario impact
              </button>
            </div>

            <div className="scenario-card">
              <h4 className="scenario-title">Increase lead volume by 20%</h4>
              <p className="scenario-body">
                Keep funnel health constant and grow lead volume. See how much
                incremental ARR this generates at current conversion rates.
              </p>
              <button
                className={
                  activeScenario === "volume20"
                    ? "scenario-button scenario-button-active"
                    : "scenario-button"
                }
                onClick={() =>
                  setActiveScenario(
                    activeScenario === "volume20" ? null : "volume20"
                  )
                }
              >
                Show scenario impact
              </button>
            </div>

            <div className="scenario-card">
              <h4 className="scenario-title">Combo: fix stage + more leads</h4>
              <p className="scenario-body">
                Model a more aggressive growth path by improving the weakest
                stage and increasing lead volume at the same time.
              </p>
              <button
                className={
                  activeScenario === "combo"
                    ? "scenario-button scenario-button-active"
                    : "scenario-button"
                }
                onClick={() =>
                  setActiveScenario(
                    activeScenario === "combo" ? null : "combo"
                  )
                }
              >
                Show scenario impact
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
