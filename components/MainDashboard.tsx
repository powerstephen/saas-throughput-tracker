"use client";

import React, { useMemo, useState, useEffect } from "react";
import HeroCard from "./HeroCard";
import type { Benchmarks } from "./BenchmarksPanel";

type MainDashboardProps = {
  benchmarks: Benchmarks;
};

type TimeframeOption = 30 | 60 | 90;

type Actuals = {
  leads: number;
  mqls: number;
  sqls: number;
  opps: number;
  proposals: number;
  wins: number;
  newArr: number;
  timeframeDays: TimeframeOption;
  acv: number;
  includeCustomerSuccess: boolean;
};

type CoreMetrics = {
  targetArr: number;
  forecastArr: number;
  gapToTarget: number; // positive = behind, negative = ahead
  currentRunRateMonthly: number;
  requiredRunRateMonthly: number;
};

type ScenarioKey = "stageFix" | "moreLeads" | "combo";

export default function MainDashboard({ benchmarks }: MainDashboardProps) {
  const [actuals, setActuals] = useState<Actuals>({
    leads: 5000,
    mqls: 1500,
    sqls: 600,
    opps: 200,
    proposals: 80,
    wins: 30,
    newArr: 1_520_833,
    timeframeDays: 90,
    acv: 50_000,
    includeCustomerSuccess: true,
  });

  const [activeScenario, setActiveScenario] = useState<ScenarioKey | null>(null);
  const [scenarioMetrics, setScenarioMetrics] = useState<CoreMetrics | null>(
    null
  );

  useEffect(() => {
    setActiveScenario(null);
    setScenarioMetrics(null);
  }, [actuals, benchmarks]);

  const revenueBm = benchmarks.revenue;
  const currentArr: number = Number(revenueBm.currentArr || 8_500_000);
  const targetArr: number = Number(revenueBm.arrTarget || 10_000_000);

  const periodMonths = useMemo(
    () => actuals.timeframeDays / 30,
    [actuals.timeframeDays]
  );

  const baseMetrics: CoreMetrics = useMemo(() => {
    const monthlyRunRate = periodMonths > 0 ? actuals.newArr / periodMonths : 0;
    const forecastArr = currentArr + actuals.newArr;
    const gapToTarget = targetArr - forecastArr;
    const requiredRunRateMonthly =
      periodMonths > 0 ? (targetArr - currentArr) / periodMonths : 0;

    return {
      targetArr,
      forecastArr,
      gapToTarget,
      currentRunRateMonthly: monthlyRunRate,
      requiredRunRateMonthly,
    };
  }, [actuals.newArr, currentArr, targetArr, periodMonths]);

  function computeScenarioMetrics(key: ScenarioKey): CoreMetrics {
    let {
      targetArr,
      forecastArr,
      gapToTarget,
      currentRunRateMonthly,
      requiredRunRateMonthly,
    } = baseMetrics;

    const {
      leads,
      mqls,
      sqls,
      opps,
      proposals,
      wins,
      timeframeDays,
      acv,
    } = actuals;

    const months = timeframeDays / 30;

    const leadToMql = leads > 0 ? mqls / leads : 0;
    const mqlToSql = mqls > 0 ? sqls / mqls : 0;
    const sqlToOpp = sqls > 0 ? opps / sqls : 0;
    const oppToProp = opps > 0 ? proposals / opps : 0;
    const propToWin = proposals > 0 ? wins / proposals : 0;

    const bmLeadToMql = benchmarks.marketing.leadToMql || 0.25;
    const bmMqlToSql = benchmarks.marketing.mqlToSql || 0.4;
    const bmSqlToOpp = benchmarks.sales.sqlToOpp || 0.3;
    const bmOppToProp = benchmarks.sales.oppToProp || 0.5;
    const bmPropToWin = benchmarks.sales.propToWin || 0.25;

    const conversions = [
      { key: "leadToMql", actual: leadToMql, target: bmLeadToMql },
      { key: "mqlToSql", actual: mqlToSql, target: bmMqlToSql },
      { key: "sqlToOpp", actual: sqlToOpp, target: bmSqlToOpp },
      { key: "oppToProp", actual: oppToProp, target: bmOppToProp },
      { key: "propToWin", actual: propToWin, target: bmPropToWin },
    ];

    const weakest = conversions.reduce((worst, c) => {
      const shortfall = c.target - c.actual;
      const worstShortfall = worst.target - worst.actual;
      return shortfall > worstShortfall ? c : worst;
    }, conversions[0]);

    const baseWins = wins;

    if (key === "stageFix" || key === "combo") {
      const improvedRates: Record<string, number> = {
        leadToMql,
        mqlToSql,
        sqlToOpp,
        oppToProp,
        propToWin,
      };

      improvedRates[weakest.key] = Math.max(
        weakest.actual,
        weakest.target,
        weakest.actual + 0.05
      );

      const improvedMqls = leads * improvedRates.leadToMql;
      const improvedSqls = improvedMqls * improvedRates.mqlToSql;
      const improvedOpps = improvedSqls * improvedRates.sqlToOpp;
      const improvedProps = improvedOpps * improvedRates.oppToProp;
      const improvedWins = improvedProps * improvedRates.propToWin;

      const extraWins = Math.max(0, improvedWins - baseWins);
      const extraArr = extraWins * acv;

      forecastArr += extraArr;
      currentRunRateMonthly += months > 0 ? extraArr / months : 0;
      gapToTarget = targetArr - forecastArr;
      requiredRunRateMonthly =
        months > 0 ? (targetArr - currentArr) / months : 0;
    }

    if (key === "moreLeads" || key === "combo") {
      const bumpFactor = key === "combo" ? 1.3 : 1.2;
      const newLeads = leads * bumpFactor;

      const newMqls = newLeads * leadToMql;
      const newSqls = newMqls * mqlToSql;
      const newOpps = newSqls * sqlToOpp;
      const newProps = newOpps * oppToProp;
      const newWins = newProps * propToWin;

      const extraWins = Math.max(0, newWins - wins);
      const extraArr = extraWins * acv;

      forecastArr += extraArr;
      currentRunRateMonthly += months > 0 ? extraArr / months : 0;
      gapToTarget = targetArr - forecastArr;
      requiredRunRateMonthly =
        months > 0 ? (targetArr - currentArr) / months : 0;
    }

    return {
      targetArr,
      forecastArr,
      gapToTarget,
      currentRunRateMonthly,
      requiredRunRateMonthly,
    };
  }

  function handleScenarioClick(key: ScenarioKey) {
    const metrics = computeScenarioMetrics(key);
    setActiveScenario(key);
    setScenarioMetrics(metrics);
  }

  const metricsToShow: CoreMetrics = scenarioMetrics || baseMetrics;

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(Math.round(value));

  function getGapStatus(gap: number) {
    if (Math.abs(gap) < 1) {
      return { text: "On target", tone: "neutral" as const };
    }
    if (gap > 0) {
      return { text: "Behind", tone: "bad" as const };
    }
    return { text: "Ahead", tone: "good" as const };
  }

  function getRunRateStatus(
    current: number,
    required: number
  ): { text: string; tone: "good" | "warn" | "bad" | "neutral" } {
    if (required <= 0) {
      return { text: "Target reached", tone: "good" };
    }
    const ratio = current / required;
    if (ratio >= 1.05) return { text: "Above target", tone: "good" };
    if (ratio >= 0.9) return { text: "Close to target", tone: "warn" };
    return { text: "Needs attention", tone: "bad" };
  }

  const gapStatus = getGapStatus(metricsToShow.gapToTarget);
  const runStatus = getRunRateStatus(
    metricsToShow.currentRunRateMonthly,
    metricsToShow.requiredRunRateMonthly
  );

  return (
    <div className="space-y-8 rounded-3xl bg-slate-950 px-6 pb-10 pt-6 text-slate-50">
      {/* Funnel inputs */}
      <section className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold tracking-tight text-slate-50">
            Funnel and ARR performance for a recent period
          </h2>
          <p className="text-xs text-slate-400">
            Enter how your funnel performed for a recent 30 / 60 / 90 day
            period. This drives run rate, forecast ARR and gap to target.
          </p>
        </div>

        {/* Funnel counts */}
        <div className="grid gap-4 md:grid-cols-6">
          {(
            [
              ["Leads", "leads"],
              ["MQLs", "mqls"],
              ["SQLs", "sqls"],
              ["Opportunities", "opps"],
              ["Proposals", "proposals"],
              ["Wins", "wins"],
            ] as const
          ).map(([label, field]) => (
            <div key={field} className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-300">
                {label}
              </label>
              <input
                type="number"
                className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-sm text-slate-50 outline-none ring-0 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                value={actuals[field]}
                onChange={(e) =>
                  setActuals((prev) => ({
                    ...prev,
                    [field]: Number(e.target.value) || 0,
                  }))
                }
                min={0}
              />
            </div>
          ))}
        </div>

        {/* Timeframe, ARR, ACV, CS toggle */}
        <div className="grid gap-4 md:grid-cols-4 md:items-end">
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-300">
              Timeframe
            </label>
            <select
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              value={actuals.timeframeDays}
              onChange={(e) =>
                setActuals((prev) => ({
                  ...prev,
                  timeframeDays: Number(e.target.value) as TimeframeOption,
                }))
              }
            >
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 60 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-300">
              New ARR in this timeframe (€)
            </label>
            <input
              type="number"
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              value={actuals.newArr}
              onChange={(e) =>
                setActuals((prev) => ({
                  ...prev,
                  newArr: Number(e.target.value) || 0,
                }))
              }
              min={0}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-300">
              Average contract value (ACV, €)
            </label>
            <input
              type="number"
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              value={actuals.acv}
              onChange={(e) =>
                setActuals((prev) => ({
                  ...prev,
                  acv: Number(e.target.value) || 0,
                }))
              }
              min={0}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="include-nrr"
              type="checkbox"
              checked={actuals.includeCustomerSuccess}
              onChange={(e) =>
                setActuals((prev) => ({
                  ...prev,
                  includeCustomerSuccess: e.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-sky-500 focus:ring-sky-500"
            />
            <label
              htmlFor="include-nrr"
              className="text-[11px] font-medium text-slate-300"
            >
              Include Customer Success (NRR) in ARR path
            </label>
          </div>
        </div>
      </section>

      {/* Hero metrics */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-base font-semibold tracking-tight text-slate-50">
            Throughput and ARR path
          </h2>
          {activeScenario && (
            <span className="text-[11px] text-slate-400">
              Scenario applied:{" "}
              {activeScenario === "stageFix"
                ? "Fix weakest conversion stage"
                : activeScenario === "moreLeads"
                ? "Increase lead volume"
                : "Combination of both levers"}
            </span>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <HeroCard
            title="Target ARR"
            value={formatCurrency(metricsToShow.targetArr)}
            description="Goal you are working towards"
            statusText="On track"
            tone="neutral"
          />

          <HeroCard
            title="Forecast ARR"
            value={formatCurrency(metricsToShow.forecastArr)}
            description="Based on current run rate"
            statusText={
              metricsToShow.forecastArr >= metricsToShow.targetArr
                ? "Above"
                : "Below"
            }
            tone={
              metricsToShow.forecastArr >= metricsToShow.targetArr
                ? "good"
                : "warn"
            }
          />

          <HeroCard
            title="Gap to target ARR"
            value={formatCurrency(Math.abs(metricsToShow.gapToTarget))}
            description="Ahead or behind target"
            statusText={gapStatus.text}
            tone={gapStatus.tone}
          />

          <HeroCard
            title="Current run rate"
            value={formatCurrency(metricsToShow.currentRunRateMonthly)}
            description="Average new ARR per month"
            statusText={runStatus.text}
            tone={runStatus.tone}
          />

          <HeroCard
            title="Required run rate"
            value={formatCurrency(
              Math.max(metricsToShow.requiredRunRateMonthly, 0)
            )}
            description="Average new ARR needed"
            statusText={
              metricsToShow.requiredRunRateMonthly <= 0
                ? "Target reached"
                : "Stretch"
            }
            tone={
              metricsToShow.requiredRunRateMonthly <= 0
                ? "good"
                : "warn"
            }
          />
        </div>
      </section>

      {/* Priority scenarios */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight text-slate-50">
          Priority scenarios to improve outcome
        </h2>
        <p className="text-xs text-slate-400">
          These scenarios show how fixing bottlenecks or increasing volume would
          impact your forecast and gap to target in this timeframe.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4 text-xs text-slate-200">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-slate-50">
                Fix weakest conversion stage
              </h3>
              <p className="text-[11px] text-slate-300">
                Bring the lowest-performing funnel step closer to benchmark and
                see the ARR unlocked without more spend at the top of the funnel.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleScenarioClick("stageFix")}
              className="mt-3 inline-flex items-center justify-center rounded-full border border-sky-500/70 bg-sky-600/80 px-3 py-1 text-[11px] font-medium text-slate-50 shadow-sm hover:bg-sky-500"
            >
              Show scenario impact
            </button>
          </div>

          <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4 text-xs text-slate-200">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-slate-50">
                Increase lead volume by 20%
              </h3>
              <p className="text-[11px] text-slate-300">
                Keep funnel health constant and grow lead volume. See how much
                incremental ARR this generates given current conversion rates.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleScenarioClick("moreLeads")}
              className="mt-3 inline-flex items-center justify-center rounded-full border border-sky-500/70 bg-sky-600/80 px-3 py-1 text-[11px] font-medium text-slate-50 shadow-sm hover:bg-sky-500"
            >
              Show scenario impact
            </button>
          </div>

          <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4 text-xs text-slate-200">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-slate-50">
                Combo: fix stage + more leads
              </h3>
              <p className="text-[11px] text-slate-300">
                Model a more aggressive growth path by improving the weakest
                stage and increasing lead volume at the same time.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleScenarioClick("combo")}
              className="mt-3 inline-flex items-center justify-center rounded-full border border-sky-500/70 bg-sky-600/80 px-3 py-1 text-[11px] font-medium text-slate-50 shadow-sm hover:bg-sky-500"
            >
              Show scenario impact
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
