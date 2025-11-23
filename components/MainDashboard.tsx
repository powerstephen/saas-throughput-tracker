// components/MainDashboard.tsx
"use client";

import React, { useMemo, useState } from "react";
import type { Benchmarks, Actuals } from "@/app/page";

// ---------- helpers ----------

const formatCurrency = (value: number): string => {
  const v = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(v);
};

const safeDiv = (num: number, den: number): number =>
  den === 0 ? 0 : num / den;

type HeroStatus = "on-track" | "attention";

interface HeroCardProps {
  title: string;
  value: string;
  description: string;
  status: HeroStatus;
}

const HeroCard: React.FC<HeroCardProps> = ({
  title,
  value,
  description,
  status,
}) => {
  const statusLabel = status === "on-track" ? "On track" : "Needs attention";
  const statusClasses =
    status === "on-track"
      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/50"
      : "bg-rose-500/10 text-rose-300 border-rose-500/50";

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/60 px-5 py-5 shadow-sm">
      <h3 className="mb-2 text-sm font-medium leading-snug text-slate-100">
        {title}
      </h3>
      <div className="mb-2 text-2xl font-semibold tracking-tight text-slate-50 md:text-3xl">
        {value}
      </div>
      <p className="mb-4 text-xs leading-snug text-slate-400">{description}</p>
      <span
        className={`inline-flex w-max items-center justify-center rounded-full border px-3 py-1 text-[11px] font-medium ${statusClasses}`}
      >
        {statusLabel}
      </span>
    </div>
  );
};

// ---------- scenario types ----------

type ScenarioKey = "none" | "fixWeakest" | "boostLeads" | "combo";

interface ScenarioResult {
  label: string;
  description: string;
  deltaForecastArr: number;
  deltaGap: number;
}

// ---------- main component ----------

interface Props {
  benchmarks: Benchmarks;
  actuals: Actuals;
  onActualsChange: (updated: Partial<Actuals>) => void;
}

const MainDashboard: React.FC<Props> = ({
  benchmarks,
  actuals,
  onActualsChange,
}) => {
  const [scenario, setScenario] = useState<ScenarioKey>("none");

  // ---- base calculations from actuals ----

  const baseMetrics = useMemo(() => {
    const days = actuals.timeframeDays || 30;
    const annualFactor = 365 / days;

    const annualisedNewArr = actuals.newArrInPeriod * annualFactor;
    const currentMonthlyRunRate = annualisedNewArr / 12;

    const horizonWeeks = benchmarks.revenue.timeframeWeeks || 52;
    const horizonYears = horizonWeeks / 52;

    const forecastArr =
      benchmarks.revenue.currentArr + annualisedNewArr * horizonYears;

    const gap = benchmarks.revenue.targetArr - forecastArr;

    const requiredNewArrTotal =
      benchmarks.revenue.targetArr - benchmarks.revenue.currentArr;

    const monthsHorizon = horizonWeeks / 4.345; // approx
    const requiredMonthlyRunRate =
      monthsHorizon > 0 ? requiredNewArrTotal / monthsHorizon : 0;

    const acv =
      actuals.wins > 0 ? actuals.newArrInPeriod / actuals.wins : 0;

    const conv = {
      leadsToMql: safeDiv(actuals.mqls, actuals.leads),
      mqlToSql: safeDiv(actuals.sqls, actuals.mqls),
      sqlToOpp: safeDiv(actuals.opps, actuals.sqls),
      oppToProposal: safeDiv(actuals.proposals, actuals.opps),
      proposalToWin: safeDiv(actuals.wins, actuals.proposals),
    };

    return {
      annualisedNewArr,
      currentMonthlyRunRate,
      forecastArr,
      gap,
      requiredMonthlyRunRate,
      acv,
      conv,
      horizonWeeks,
      timeframeLabel: actuals.timeframeLabel,
    };
  }, [actuals, benchmarks.revenue]);

  // ---- scenario calculations ----

  const scenarioMetrics = useMemo(() => {
    const b = baseMetrics;
    const leads = actuals.leads;
    const acv = b.acv || 0;

    // if no wins or no leads, scenarios will just mirror base
    if (!leads || !acv) {
      return {
        key: scenario,
        forecastArr: b.forecastArr,
        gap: b.gap,
        results: [] as ScenarioResult[],
      };
    }

    const toPct = (v: number) => v / 100;

    const benchConv = {
      leadsToMql: toPct(benchmarks.marketing.leadsToMql),
      mqlToSql: toPct(benchmarks.marketing.mqlToSql),
      sqlToOpp: toPct(benchmarks.sales.sqlToOpp),
      oppToProposal: toPct(benchmarks.sales.oppToProposal),
      proposalToWin: toPct(benchmarks.sales.proposalToWin),
    };

    // baseline using actual conversions
    const pipelineWinsBase =
      leads *
      b.conv.leadsToMql *
      b.conv.mqlToSql *
      b.conv.sqlToOpp *
      b.conv.oppToProposal *
      b.conv.proposalToWin;

    const arrInPeriodBase = pipelineWinsBase * acv;
    const annualFactor = 365 / (actuals.timeframeDays || 30);
    const annualArrBase = arrInPeriodBase * annualFactor;

    const horizonWeeks = benchmarks.revenue.timeframeWeeks || 52;
    const horizonYears = horizonWeeks / 52;
    const forecastArrBase =
      benchmarks.revenue.currentArr + annualArrBase * horizonYears;

    const gapBase = benchmarks.revenue.targetArr - forecastArrBase;

    // --- helper to recompute forecast from modified conv + leads ---

    const recomputeForecast = (
      convOverrides: Partial<typeof b.conv>,
      leadsMultiplier = 1
    ) => {
      const conv = { ...b.conv, ...convOverrides };
      const newLeads = leads * leadsMultiplier;

      const wins =
        newLeads *
        conv.leadsToMql *
        conv.mqlToSql *
        conv.sqlToOpp *
        conv.oppToProposal *
        conv.proposalToWin;

      const arrInPeriod = wins * acv;
      const annualArr = arrInPeriod * annualFactor;
      const forecastArr =
        benchmarks.revenue.currentArr + annualArr * horizonYears;
      const gap = benchmarks.revenue.targetArr - forecastArr;

      return { forecastArr, gap };
    };

    // identify weakest step (biggest % below benchmark)
    const deltas: { key: keyof typeof b.conv; delta: number; label: string }[] =
      [
        {
          key: "leadsToMql",
          delta: b.conv.leadsToMql - benchConv.leadsToMql,
          label: "Lead → MQL",
        },
        {
          key: "mqlToSql",
          delta: b.conv.mqlToSql - benchConv.mqlToSql,
          label: "MQL → SQL",
        },
        {
          key: "sqlToOpp",
          delta: b.conv.sqlToOpp - benchConv.sqlToOpp,
          label: "SQL → Opportunity",
        },
        {
          key: "oppToProposal",
          delta: b.conv.oppToProposal - benchConv.oppToProposal,
          label: "Opportunity → Proposal",
        },
        {
          key: "proposalToWin",
          delta: b.conv.proposalToWin - benchConv.proposalToWin,
          label: "Proposal → Win",
        },
      ];

    const weakest = deltas.reduce((worst, current) =>
      current.delta < worst.delta ? current : worst
    );

    const overridesFixWeakest: Partial<typeof b.conv> = {
      [weakest.key]: benchConv[weakest.key],
    };

    const sFix = recomputeForecast(overridesFixWeakest, 1);
    const sBoostLeads = recomputeForecast({}, 1.2);
    const sCombo = recomputeForecast(overridesFixWeakest, 1.2);

    const results: ScenarioResult[] = [
      {
        label: `Fix ${weakest.label} to benchmark`,
        description:
          "Lift the weakest conversion step to its target while keeping lead volume flat.",
        deltaForecastArr: sFix.forecastArr - forecastArrBase,
        deltaGap: gapBase - sFix.gap,
      },
      {
        label: "Increase qualified leads by 20%",
        description:
          "Keep conversion rates as-is but improve lead volume by 20%.",
        deltaForecastArr: sBoostLeads.forecastArr - forecastArrBase,
        deltaGap: gapBase - sBoostLeads.gap,
      },
      {
        label: "Fix weakest step + 20% more leads",
        description:
          "Combine both: bring weakest step to target and increase qualified leads by 20%.",
        deltaForecastArr: sCombo.forecastArr - forecastArrBase,
        deltaGap: gapBase - sCombo.gap,
      },
    ];

    // which scenario is currently applied to the hero metrics?
    let applied = { forecastArr: forecastArrBase, gap: gapBase };

    if (scenario === "fixWeakest") applied = sFix;
    if (scenario === "boostLeads") applied = sBoostLeads;
    if (scenario === "combo") applied = sCombo;

    return {
      key: scenario,
      forecastArr: applied.forecastArr,
      gap: applied.gap,
      baseForecastArr: forecastArrBase,
      baseGap: gapBase,
      results,
    };
  }, [scenario, baseMetrics, benchmarks, actuals]);

  // combine base + scenario-adjusted figures for hero cards
  const heroAggregates = useMemo(() => {
    const b = baseMetrics;
    const s = scenarioMetrics;

    const effectiveForecastArr = s.forecastArr;
    const effectiveGap = benchmarks.revenue.targetArr - effectiveForecastArr;

    const requiredNewArrTotal =
      benchmarks.revenue.targetArr - benchmarks.revenue.currentArr;
    const horizonWeeks = benchmarks.revenue.timeframeWeeks || 52;
    const monthsHorizon = horizonWeeks / 4.345;

    const requiredMonthlyRunRate =
      monthsHorizon > 0 ? requiredNewArrTotal / monthsHorizon : 0;

    const days = actuals.timeframeDays || 30;
    const annualFactor = 365 / days;
    const annualised = actuals.newArrInPeriod * annualFactor;
    const currentMonthlyRunRate = annualised / 12;

    return {
      targetForPeriod: benchmarks.revenue.targetArr,
      forecastArr: effectiveForecastArr,
      gap: effectiveGap,
      currentMonthlyRunRate,
      requiredMonthlyRunRate,
      timeframeLabel: actuals.timeframeLabel,
    };
  }, [baseMetrics, scenarioMetrics, benchmarks.revenue, actuals]);

  // ----- UI handlers -----

  const handleTimeframeChange = (days: number, label: string) => {
    onActualsChange({ timeframeDays: days, timeframeLabel: label });
  };

  const handleActualNumberChange = (field: keyof Actuals, value: string) => {
    const numeric = Number(value.replace(/[^0-9.]/g, "")) || 0;
    onActualsChange({ [field]: numeric } as Partial<Actuals>);
  };

  // ---------- RENDER ----------

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-5 shadow-sm md:px-6 md:py-6">
      {/* Funnel + ARR inputs */}
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-sm font-medium text-slate-100">
            Funnel and ARR performance for a recent period
          </h2>
          <p className="text-xs text-slate-400">
            Enter a recent period (last month, last quarter) to see run rate,
            gaps to ARR target and scenario-based impact.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Timeframe:</span>
          <div className="flex gap-1 rounded-full border border-slate-700 bg-slate-950/70 p-1 text-xs">
            <button
              type="button"
              onClick={() => handleTimeframeChange(30, "Last 30 days")}
              className={`rounded-full px-3 py-1 ${
                actuals.timeframeDays === 30
                  ? "bg-sky-500 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              30 days
            </button>
            <button
              type="button"
              onClick={() => handleTimeframeChange(60, "Last 60 days")}
              className={`rounded-full px-3 py-1 ${
                actuals.timeframeDays === 60
                  ? "bg-sky-500 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              60 days
            </button>
            <button
              type="button"
              onClick={() => handleTimeframeChange(90, "Last 90 days")}
              className={`rounded-full px-3 py-1 ${
                actuals.timeframeDays === 90
                  ? "bg-sky-500 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              90 days
            </button>
          </div>
        </div>
      </div>

      {/* Funnel row */}
      <div className="mb-5 grid gap-3 md:grid-cols-6">
        {[
          { label: "Leads", field: "leads", value: actuals.leads },
          { label: "MQLs", field: "mqls", value: actuals.mqls },
          { label: "SQLs", field: "sqls", value: actuals.sqls },
          {
            label: "Opportunities",
            field: "opps",
            value: actuals.opps,
          },
          {
            label: "Proposals",
            field: "proposals",
            value: actuals.proposals,
          },
          { label: "Wins", field: "wins", value: actuals.wins },
        ].map((item) => (
          <label
            key={item.field}
            className="flex flex-col rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-3 text-xs text-slate-300"
          >
            <span className="mb-1 text-[11px] uppercase tracking-wide text-slate-400">
              {item.label}
            </span>
            <input
              type="number"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
              value={item.value}
              onChange={(e) =>
                handleActualNumberChange(
                  item.field as keyof Actuals,
                  e.target.value
                )
              }
            />
          </label>
        ))}
      </div>

      {/* ARR + ACV row */}
      <div className="mb-6 grid gap-3 md:grid-cols-[2fr,2fr,1.5fr]">
        <label className="flex flex-col rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-3 text-xs text-slate-300">
          <span className="mb-1 text-[11px] uppercase tracking-wide text-slate-400">
            New ARR in this timeframe (€)
          </span>
          <input
            type="number"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
            value={actuals.newArrInPeriod}
            onChange={(e) =>
              handleActualNumberChange("newArrInPeriod", e.target.value)
            }
          />
        </label>

        <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-3 text-xs text-slate-300">
          <span className="mb-1 text-[11px] uppercase tracking-wide text-slate-400">
            Average ACV (auto-calculated)
          </span>
          <div className="mt-1 text-lg font-semibold text-slate-50">
            {actuals.wins > 0
              ? formatCurrency(actuals.newArrInPeriod / actuals.wins)
              : "–"}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            New ARR divided by wins in this period.
          </p>
        </div>

        <label className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-3 text-xs text-slate-300">
          <span className="mr-2 text-[11px] uppercase tracking-wide text-slate-400">
            Include Customer Success (NRR)
          </span>
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-sky-500"
            checked={actuals.includeCustomerSuccess}
            onChange={(e) =>
              onActualsChange({ includeCustomerSuccess: e.target.checked })
            }
          />
        </label>
      </div>

      {/* HERO METRICS */}
      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <HeroCard
          title="Target ARR for this period"
          value={formatCurrency(heroAggregates.targetForPeriod)}
          description="Goal you are working towards in the selected timeframe."
          status={heroAggregates.gap <= 0 ? "on-track" : "attention"}
        />
        <HeroCard
          title="Forecast ARR at end of target period"
          value={formatCurrency(heroAggregates.forecastArr)}
          description="Based on current run rate and NRR settings."
          status={
            heroAggregates.forecastArr >= heroAggregates.targetForPeriod
              ? "on-track"
              : "attention"
          }
        />
        <HeroCard
          title="Gap to target ARR"
          value={formatCurrency(Math.max(heroAggregates.gap, 0))}
          description="Additional ARR needed to hit the target."
          status={heroAggregates.gap <= 0 ? "on-track" : "attention"}
        />
        <HeroCard
          title="Current run rate (monthly)"
          value={formatCurrency(heroAggregates.currentMonthlyRunRate)}
          description={`Average new ARR per month from ${heroAggregates.timeframeLabel}.`}
          status={
            heroAggregates.currentMonthlyRunRate >=
            heroAggregates.requiredMonthlyRunRate
              ? "on-track"
              : "attention"
          }
        />
        <HeroCard
          title="Required run rate (monthly)"
          value={formatCurrency(heroAggregates.requiredMonthlyRunRate)}
          description="Average new ARR per month needed to hit the target."
          status={
            heroAggregates.currentMonthlyRunRate >=
            heroAggregates.requiredMonthlyRunRate
              ? "on-track"
              : "attention"
          }
        />
      </section>

      {/* PRIORITY SCENARIOS */}
      <section>
        <h3 className="mb-2 text-sm font-medium text-slate-100">
          Priority scenarios to improve outcome
        </h3>
        <p className="mb-3 text-xs text-slate-400">
          These levers simulate realistic changes to throughput and show their
          impact on forecast ARR and the gap to target. Click{" "}
          <span className="font-semibold text-slate-200">
            “Show scenario impact”
          </span>{" "}
          to apply the scenario to the hero metrics above.
        </p>

        <div className="grid gap-3 md:grid-cols-3">
          {scenarioMetrics.results.map((s, index) => {
            const key: ScenarioKey =
              index === 0 ? "fixWeakest" : index === 1 ? "boostLeads" : "combo";

            const isActive = scenario === key;
            const improved = s.deltaForecastArr > 0;

            return (
              <div
                key={s.label}
                className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-300"
              >
                <div>
                  <h4 className="mb-1 text-sm font-medium text-slate-100">
                    {s.label}
                  </h4>
                  <p className="mb-2 text-[11px] leading-snug text-slate-400">
                    {s.description}
                  </p>
                  <p className="mb-1 text-[11px] text-slate-300">
                    Forecast ARR change:{" "}
                    <span
                      className={
                        improved ? "text-emerald-300" : "text-slate-300"
                      }
                    >
                      {s.deltaForecastArr >= 0 ? "+" : "-"}
                      {formatCurrency(Math.abs(s.deltaForecastArr))}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Gap movement vs target:{" "}
                    <span
                      className={
                        s.deltaGap >= 0 ? "text-emerald-300" : "text-rose-300"
                      }
                    >
                      {s.deltaGap >= 0 ? "Improves" : "Worsens"} by{" "}
                      {formatCurrency(Math.abs(s.deltaGap))}
                    </span>
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      setScenario((prev) => (prev === key ? "none" : key))
                    }
                    className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                      isActive
                        ? "bg-sky-500 text-white"
                        : "border border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
                    }`}
                  >
                    {isActive ? "Clear scenario" : "Show scenario impact"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </section>
  );
};

export default MainDashboard;
