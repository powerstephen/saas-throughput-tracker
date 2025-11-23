"use client";

import React, { useState } from "react";
import BenchmarksPanel, { Benchmarks } from "./BenchmarksPanel";

type Actuals = {
  periodWeeks: number;
  funnel: {
    leads: number;
    mqls: number;
    sqls: number;
    opps: number;
    proposals: number;
    wins: number;
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
  fromLabel: string;
  toLabel: string;
};

const STAGES: FunnelStageMeta[] = [
  { key: "leadsToMql", label: "Leads → MQL", fromLabel: "Leads", toLabel: "MQLs" },
  { key: "mqlToSql", label: "MQL → SQL", fromLabel: "MQLs", toLabel: "SQLs" },
  { key: "sqlToOpp", label: "SQL → Opp", fromLabel: "SQLs", toLabel: "Opportunities" },
  { key: "oppToProp", label: "Opp → Proposal", fromLabel: "Opportunities", toLabel: "Proposals" },
  { key: "propToWin", label: "Proposal → Win", fromLabel: "Proposals", toLabel: "Wins" },
];

function safeDiv(a: number, b: number) {
  if (!b || Number.isNaN(a) || Number.isNaN(b)) return 0;
  return a / b;
}

type ActualRates = {
  leadsToMql: number;
  mqlToSql: number;
  sqlToOpp: number;
  oppToProp: number;
  propToWin: number;
};

function deriveActualRates(actuals: Actuals): ActualRates {
  const { leads, mqls, sqls, opps, proposals, wins } = actuals.funnel;

  const leadsToMql = safeDiv(mqls * 100, leads);
  const mqlToSql = safeDiv(sqls * 100, mqls);
  const sqlToOpp = safeDiv(opps * 100, sqls);
  const oppToProp = safeDiv(proposals * 100, opps);
  const propToWin = safeDiv(wins * 100, proposals);

  return {
    leadsToMql,
    mqlToSql,
    sqlToOpp,
    oppToProp,
    propToWin,
  };
}

type Scenario = {
  id: string;
  title: string;
  description: string;
  extraArr: number;
  newArrScenario: number;
  gapImprovement: number;
  extraMonthlyArr?: number;
};

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
      avgDealSizeTarget: 50000,
    },
  });

  const [includeCs, setIncludeCs] = useState(false);
  const [showBenchmarks, setShowBenchmarks] = useState(true);
  const [timeframeDays, setTimeframeDays] = useState<30 | 60 | 90>(90);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);

  const [actuals, setActuals] = useState<Actuals>({
    periodWeeks: 90 / 7,
    funnel: {
      leads: 1200,
      mqls: 360,
      sqls: 126,
      opps: 70,
      proposals: 40,
      wins: 10,
    },
    revenue: {
      newArrThisPeriod: 400000,
    },
  });

  const actualRates = deriveActualRates(actuals);

  const arrRun = computeArrRunRate(benchmarks, actuals, includeCs);
  const {
    requiredNewArrTotal,
    requiredNewArrPerWeek,
    requiredNewArrPerMonth,
    actualNewArrPerWeek,
    actualNewArrPerMonth,
    forecastArrEnd,
    arrGap,
  } = arrRun;

  const bottleneck = computeBottleneck(benchmarks, actualRates);
  const {
    bottleneckLabel,
    bottleneckActual,
    bottleneckTarget,
    stagesWithDiff,
    worstStageKey,
  } = bottleneck;

  const leadReq = computeLeadRequirements(
    benchmarks,
    actuals,
    actualRates,
    requiredNewArrTotal
  );
  const {
    winsPerLeadBenchmark,
    estimatedWinsPerLeadActual,
    requiredLeadsTotal,
    requiredLeadsPerWeek,
    currentLeadsPerWeek,
    avgDealSizeActual,
  } = leadReq;

  const timeframeLabel = `${timeframeDays} days`;
  const acvTarget = benchmarks.revenue.avgDealSizeTarget;
  const acvDiffPct =
    acvTarget > 0 && avgDealSizeActual > 0
      ? ((avgDealSizeActual - acvTarget) / acvTarget) * 100
      : 0;

  const baseArr = actuals.revenue.newArrThisPeriod;
  const targetArr = benchmarks.revenue.targetArr;

  const scenarios = computeScenarios({
    benchmarks,
    actuals,
    actualRates,
    arrGap,
    winsPerLeadBenchmark,
    estimatedWinsPerLeadActual,
    avgDealSizeActual,
    requiredLeadsTotal,
    worstStageKey,
  });

  const selectedScenario = scenarios.find((s) => s.id === selectedScenarioId);
  const scenarioExtraArr = selectedScenario?.extraArr ?? 0;

  const forecastArrEndDisplayed = forecastArrEnd + scenarioExtraArr;
  const arrGapDisplayed = Math.max(targetArr - forecastArrEndDisplayed, 0);

  const timeframeMonths = (benchmarks.revenue.timeframeWeeks || 1) / 4.33;
  const extraMonthlyFromScenario =
    timeframeMonths > 0 && scenarioExtraArr > 0
      ? scenarioExtraArr / timeframeMonths
      : 0;

  const actualNewArrPerMonthDisplayed =
    actualNewArrPerMonth + extraMonthlyFromScenario;

  return (
    <div className="space-y-6">
      {/* Heading */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-50">
          SaaS Throughput and ARR Path
        </h1>
        <p className="text-sm text-slate-300">
          Input a recent period of funnel performance, compare it to your own benchmarks,
          and see ACV, ARR run rate, and required lead volume to hit target.
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
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
        {/* Top row: timeframe */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-50">
              Funnel and ARR performance for a recent period
            </h2>
            <p className="text-xs text-slate-400">
              Choose a timeframe, enter funnel counts, and the calculator will derive
              conversion rates, ACV, ARR run rate, and required lead volume.
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <label className="text-xs text-slate-200 flex flex-col">
              Timeframe
              <select
                className="mt-1 bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-50"
                value={timeframeDays}
                onChange={(e) => {
                  const days = Number(e.target.value) as 30 | 60 | 90;
                  const weeks = days / 7;
                  setTimeframeDays(days);
                  setActuals((prev) => ({
                    ...prev,
                    periodWeeks: weeks,
                  }));
                }}
              >
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
              </select>
            </label>
          </div>
        </div>

        {/* Funnel row: Leads → Wins */}
        <div className="overflow-x-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 min-w-[600px]">
            <FunnelBox
              title="Leads"
              count={actuals.funnel.leads}
              onChange={(v) =>
                setActuals((prev) => ({
                  ...prev,
                  funnel: { ...prev.funnel, leads: v },
                }))
              }
              showRates={false}
            />

            <FunnelBox
              title="MQLs"
              count={actuals.funnel.mqls}
              onChange={(v) =>
                setActuals((prev) => ({
                  ...prev,
                  funnel: { ...prev.funnel, mqls: v },
                }))
              }
              actualRate={actualRates.leadsToMql}
              targetRate={benchmarks.marketing.leadsToMql}
              rateLabel="Leads → MQL"
            />

            <FunnelBox
              title="SQLs"
              count={actuals.funnel.sqls}
              onChange={(v) =>
                setActuals((prev) => ({
                  ...prev,
                  funnel: { ...prev.funnel, sqls: v },
                }))
              }
              actualRate={actualRates.mqlToSql}
              targetRate={benchmarks.marketing.mqlToSql}
              rateLabel="MQL → SQL"
            />

            <FunnelBox
              title="Opportunities"
              count={actuals.funnel.opps}
              onChange={(v) =>
                setActuals((prev) => ({
                  ...prev,
                  funnel: { ...prev.funnel, opps: v },
                }))
              }
              actualRate={actualRates.sqlToOpp}
              targetRate={benchmarks.sales.sqlToOpp}
              rateLabel="SQL → Opp"
            />

            <FunnelBox
              title="Proposals"
              count={actuals.funnel.proposals}
              onChange={(v) =>
                setActuals((prev) => ({
                  ...prev,
                  funnel: { ...prev.funnel, proposals: v },
                }))
              }
              actualRate={actualRates.oppToProp}
              targetRate={benchmarks.sales.oppToProp}
              rateLabel="Opp → Proposal"
            />

            <FunnelBox
              title="Wins"
              count={actuals.funnel.wins}
              onChange={(v) =>
                setActuals((prev) => ({
                  ...prev,
                  funnel: { ...prev.funnel, wins: v },
                }))
              }
              actualRate={actualRates.propToWin}
              targetRate={benchmarks.sales.propToWin}
              rateLabel="Proposal → Win"
            />
          </div>
        </div>

        {/* New ARR + ACV + CS toggle */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="text-xs text-slate-200 flex flex-col">
            <span className="mb-1">New ARR in this timeframe (€)</span>
            <input
              type="number"
              className="bg-slate-950 border border-slate-700 rounded-md px-2 py-2 text-xs text-slate-50 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              value={actuals.revenue.newArrThisPeriod}
              onChange={(e) =>
                setActuals((prev) => ({
                  ...prev,
                  revenue: {
                    ...prev.revenue,
                    newArrThisPeriod: Number(e.target.value) || 0,
                  },
                }))
              }
            />
            <span className="text-[10px] text-slate-400 mt-2">
              Total new ARR closed in this period.
            </span>
          </label>

          <label className="text-xs text-slate-200 flex flex-col">
            <span className="mb-1">Average contract value (ACV)</span>
            <input
              type="text"
              readOnly
              className="bg-slate-950 border border-slate-700 rounded-md px-2 py-2 text-xs text-slate-50"
              value={
                avgDealSizeActual > 0
                  ? `€${Math.round(avgDealSizeActual).toLocaleString()}`
                  : "Enter ARR and wins to calculate ACV"
              }
            />
            <span className="text-[10px] text-slate-400 mt-2">
              Calculated as New ARR / Wins in this timeframe.
            </span>
          </label>

          <div className="text-xs text-slate-200 flex flex-col">
            <span className="mb-1">Include Customer Success (NRR) in ARR path</span>
            <button
              type="button"
              onClick={() => setIncludeCs((v) => !v)}
              className={`rounded-md border px-2 py-2 text-xs font-medium transition-colors
                ${
                  includeCs
                    ? "bg-emerald-600/20 border-emerald-500 text-emerald-200"
                    : "bg-slate-950 border-slate-700 text-slate-50"
                }`}
            >
              {includeCs ? "Included" : "Excluded"}
            </button>
            <span className="text-[10px] text-slate-400 mt-2">
              Toggle to factor NRR into your ARR forecast and gap.
            </span>
          </div>
        </div>
      </section>

      {/* Hero metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="ACV vs target"
          value={
            avgDealSizeActual > 0
              ? `€${Math.round(avgDealSizeActual).toLocaleString()}`
              : "—"
          }
          helper={
            avgDealSizeActual > 0 && acvTarget > 0
              ? `Benchmark €${Math.round(acvTarget).toLocaleString()} · ${
                  acvDiffPct >= 0 ? "+" : ""
                }${acvDiffPct.toFixed(1)}%`
              : "Enter ARR and wins to see ACV vs target."
          }
          tone={
            avgDealSizeActual > 0 && acvTarget > 0
              ? acvDiffPct >= 0
                ? "good"
                : acvDiffPct > -5
                ? "neutral"
                : "bad"
              : "neutral"
          }
        />
        <StatCard
          label="Forecast ARR at end of target period"
          value={`€${Math.round(forecastArrEndDisplayed).toLocaleString()}`}
          helper={
            selectedScenario
              ? "Includes impact of the selected scenario."
              : "Based on current run rate and NRR setting."
          }
          tone={arrGapDisplayed <= 0 ? "good" : "bad"}
        />
        <StatCard
          label="Gap to target ARR"
          value={`€${Math.round(arrGapDisplayed).toLocaleString()}`}
          helper={
            selectedScenario
              ? "Scenario-adjusted gap to ARR target."
              : arrGap > 0
              ? "Additional ARR needed to hit target."
              : "On track or above target at current run rate."
          }
          tone={arrGapDisplayed > 0 ? "bad" : "good"}
        />
        <StatCard
          label="Current run rate (monthly)"
          value={`€${Math.round(actualNewArrPerMonthDisplayed).toLocaleString()}`}
          helper={
            selectedScenario
              ? "Includes incremental ARR from the selected scenario."
              : `From new ARR in ${timeframeLabel}.`
          }
          tone={
            requiredNewArrPerMonth > 0
              ? actualNewArrPerMonthDisplayed / requiredNewArrPerMonth >= 1
                ? "good"
                : "bad"
              : "neutral"
          }
        />
        <StatCard
          label="Required run rate (monthly)"
          value={`€${Math.round(requiredNewArrPerMonth).toLocaleString()}`}
          helper="Average new ARR per month needed to hit target."
          tone="neutral"
        />
      </section>

      {/* Priority scenarios directly under hero metrics */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-50">
          Priority scenarios to improve outcome
        </h3>
        <p className="text-xs text-slate-400">
          These are the main levers that would move ARR for this timeframe the most,
          based on your current inputs and benchmarks. Selecting a scenario updates
          the ARR metrics above.
        </p>

        {scenarios.length === 0 ? (
          <p className="text-xs text-slate-500">
            Enter some funnel data and ARR to see suggested scenarios.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {scenarios.map((s) => (
              <div
                key={s.id}
                className={`rounded-lg border p-3 bg-slate-950/70 space-y-2 ${
                  selectedScenarioId === s.id
                    ? "border-cyan-500/60 shadow-[0_0_0_1px_rgba(34,211,238,0.4)]"
                    : "border-slate-800"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-slate-50 mb-1">
                      {s.title}
                    </div>
                    <p className="text-[11px] text-slate-400">{s.description}</p>
                  </div>
                </div>
                <div className="mt-1 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Extra ARR this timeframe</span>
                    <span className="font-semibold text-emerald-400">
                      {s.extraArr > 0
                        ? `€${Math.round(s.extraArr).toLocaleString()}`
                        : "—"}
                    </span>
                  </div>
                  {typeof s.extraMonthlyArr === "number" && s.extraMonthlyArr > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Extra ARR / month</span>
                      <span className="font-semibold text-emerald-300">
                        €{Math.round(s.extraMonthlyArr).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">
                      Gap reduction (approx)
                    </span>
                    <span className="font-semibold text-emerald-300">
                      {s.gapImprovement > 0
                        ? `€${Math.round(
                            Math.min(s.gapImprovement, arrGap)
                          ).toLocaleString()}`
                        : "—"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedScenarioId(
                      selectedScenarioId === s.id ? null : s.id
                    )
                  }
                  className="mt-2 w-full rounded-md border border-cyan-500/70 bg-cyan-500/10 px-2 py-1.5 text-[11px] font-medium text-cyan-100 hover:bg-cyan-500/20 transition-colors"
                >
                  {selectedScenarioId === s.id ? "Hide scenario impact" : "Show scenario impact"}
                </button>

                {selectedScenarioId === s.id && (
                  <div className="mt-2 border-t border-slate-800 pt-2 text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">New ARR (current)</span>
                      <span className="font-medium text-slate-50">
                        €{Math.round(baseArr).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">New ARR (scenario)</span>
                      <span className="font-medium text-emerald-300">
                        €{Math.round(s.newArrScenario).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      The hero metrics above are showing an approximate impact on forecast
                      ARR and gap if this scenario is applied.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Results: overview cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ARR overview */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <h3 className="text-sm font-semibold text-slate-50">
            ARR run rate versus target
          </h3>
          <p className="text-xs text-slate-400">
            Based on your current new ARR pace, time to target, and optional NRR
            impact. Scenario impact is reflected if selected above.
          </p>
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-300">Target ARR</span>
              <span className="font-medium text-slate-50">
                €{targetArr.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Forecast ARR</span>
              <span className="font-medium text-slate-50">
                €{Math.round(forecastArrEndDisplayed).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Gap to target</span>
              <span className="font-medium text-slate-50">
                €{Math.round(arrGapDisplayed).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-800 mt-2">
              <span className="text-slate-300">Current new ARR / month</span>
              <span className="font-medium text-slate-50">
                €{Math.round(actualNewArrPerMonthDisplayed).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Required new ARR / month</span>
              <span className="font-medium text-slate-50">
                €{Math.round(requiredNewArrPerMonth).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Bottleneck card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <h3 className="text-sm font-semibold text-slate-50">
            Funnel bottleneck versus benchmarks
          </h3>
          {bottleneckLabel ? (
            <>
              <p className="text-xs text-slate-400">
                This is the weakest conversion step compared to your own targets.
              </p>
              <div className="mt-2 text-sm space-y-1">
                <div>
                  <span className="text-slate-300">Stage</span>
                  <div className="font-medium text-slate-50">
                    {bottleneckLabel}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Actual rate</span>
                  <span className="font-medium text-slate-50">
                    {bottleneckActual.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Target rate</span>
                  <span className="font-medium text-slate-50">
                    {bottleneckTarget.toFixed(1)}%
                  </span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-400">
              All stages are close to or above benchmark. In this case, the main
              lever is usually top-of-funnel volume and NRR.
            </p>
          )}
        </div>

        {/* Lead requirements card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <h3 className="text-sm font-semibold text-slate-50">
            Lead volume required to hit target
          </h3>
          <p className="text-xs text-slate-400">
            Based on your target ARR, timeframe, benchmark conversion rates, and
            estimated ACV.
          </p>
          {winsPerLeadBenchmark > 0 && requiredLeadsTotal > 0 ? (
            <div className="mt-2 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-300">Required leads (period)</span>
                <span className="font-medium text-slate-50">
                  {Math.round(requiredLeadsTotal).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Required leads / week</span>
                <span className="font-medium text-slate-50">
                  {requiredLeadsPerWeek.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 mt-2">
                <span className="text-slate-300">
                  Current leads / week (this timeframe)
                </span>
                <span className="font-medium text-slate-50">
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
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-slate-50 mb-2">
          Funnel performance versus targets
        </h3>
        <p className="text-xs text-slate-400 mb-3">
          Quick view of how each conversion step compares to your benchmarks.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          {stagesWithDiff.map((stage) => (
            <div
              key={stage.label}
              className="border border-slate-800 rounded-lg p-2 bg-slate-950/70"
            >
              <div className="font-semibold text-slate-50">
                {stage.label}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-slate-400">Actual</span>
                <span className="font-medium text-slate-50">
                  {stage.actual.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target</span>
                <span className="font-medium text-slate-50">
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

type FunnelBoxProps = {
  title: string;
  count: number;
  onChange: (v: number) => void;
  showRates?: boolean;
  actualRate?: number;
  targetRate?: number;
  rateLabel?: string;
};

function FunnelBox({
  title,
  count,
  onChange,
  showRates = true,
  actualRate,
  targetRate,
  rateLabel,
}: FunnelBoxProps) {
  return (
    <div className="border border-slate-800 rounded-lg p-3 bg-slate-950/70">
      <div className="text-xs font-semibold text-slate-50 mb-1">{title}</div>
      <input
        type="number"
        inputMode="decimal"
        value={Number.isNaN(count) ? "" : count}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-slate-50 focus:outline-none focus:ring-1 focus:ring-cyan-500"
      />
      {showRates &&
        rateLabel &&
        actualRate !== undefined &&
        targetRate !== undefined && (
          <div className="mt-2 text-[10px] space-y-0.5">
            <div className="text-slate-400">{rateLabel}</div>
            <div className="flex justify-between">
              <span className="text-slate-500">Actual</span>
              <span className="font-medium text-slate-50">
                {actualRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Target</span>
              <span className="font-medium text-slate-50">
                {targetRate.toFixed(1)}%
              </span>
            </div>
          </div>
        )}
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
  tone?: "good" | "bad" | "neutral";
};

function StatCard({ label, value, helper, tone = "neutral" }: StatCardProps) {
  const valueColor =
    tone === "good"
      ? "text-emerald-400"
      : tone === "bad"
      ? "text-rose-400"
      : "text-slate-50";

  const statusText =
    tone === "good" ? "On track" : tone === "bad" ? "Needs attention" : "";

  const statusClasses =
    tone === "good"
      ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/40"
      : tone === "bad"
      ? "bg-rose-500/15 text-rose-200 border-rose-500/40"
      : "bg-slate-800/60 text-slate-300 border-slate-700/60";

  return (
    <div className="bg-slate-900/95 border border-slate-700 rounded-xl px-3 py-3 flex flex-col gap-1 shadow-sm">
      {/* Heading */}
      <div className="text-[11px] text-slate-300">{label}</div>

      {/* Number */}
      <div className={`text-xl font-semibold tracking-tight ${valueColor}`}>
        {value}
      </div>

      {/* Explainer */}
      {helper && (
        <div className="text-[10px] text-slate-400 leading-snug">
          {helper}
        </div>
      )}

      {/* Status pill at bottom */}
      {statusText && (
        <div className="mt-2">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] ${statusClasses}`}
          >
            {statusText}
          </span>
        </div>
      )}
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
  let forecastArrEnd = currentArr;

  if (includeCs && benchmarks.cs.nrrTarget > 0) {
    const nrrFactor = benchmarks.cs.nrrTarget / 100;
    const yearFraction = timeframeWeeks / 52;
    const baseGrowthFromNrr = currentArr * (nrrFactor - 1) * yearFraction;
    forecastArrEnd += baseGrowthFromNrr;
    requiredNewArrTotal = Math.max(targetArr - forecastArrEnd, 0);
  }

  forecastArrEnd += actualNewArrPerWeek * timeframeWeeks;
  const arrGap = Math.max(targetArr - forecastArrEnd, 0);

  const requiredNewArrPerWeek = safeDiv(requiredNewArrTotal, timeframeWeeks || 1);
  const requiredNewArrPerMonth = requiredNewArrPerWeek * 4.33;

  return {
    requiredNewArrTotal,
    requiredNewArrPerWeek,
    requiredNewArrPerMonth,
    actualNewArrPerWeek,
    actualNewArrPerMonth,
    forecastArrEnd,
    arrGap,
  };
}

function computeBottleneck(benchmarks: Benchmarks, actualRates: ActualRates) {
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

    switch (stage.key) {
      case "leadsToMql":
        actualRate = actualRates.leadsToMql;
        targetRate = benchmarks.marketing.leadsToMql;
        break;
      case "mqlToSql":
        actualRate = actualRates.mqlToSql;
        targetRate = benchmarks.marketing.mqlToSql;
        break;
      case "sqlToOpp":
        actualRate = actualRates.sqlToOpp;
        targetRate = benchmarks.sales.sqlToOpp;
        break;
      case "oppToProp":
        actualRate = actualRates.oppToProp;
        targetRate = benchmarks.sales.oppToProp;
        break;
      case "propToWin":
        actualRate = actualRates.propToWin;
        targetRate = benchmarks.sales.propToWin;
        break;
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
    worstStageKey: worst ? worst.key : null,
  };
}

function computeLeadRequirements(
  benchmarks: Benchmarks,
  actuals: Actuals,
  actualRates: ActualRates,
  requiredNewArrTotal: number
) {
  const chainBenchmark =
    (benchmarks.marketing.leadsToMql / 100 || 0) *
    (benchmarks.marketing.mqlToSql / 100 || 0) *
    (benchmarks.sales.sqlToOpp / 100 || 0) *
    (benchmarks.sales.oppToProp / 100 || 0) *
    (benchmarks.sales.propToWin / 100 || 0);

  const winsPerLeadBenchmark = chainBenchmark;

  const chainActual =
    (actualRates.leadsToMql / 100 || 0) *
    (actualRates.mqlToSql / 100 || 0) *
    (actualRates.sqlToOpp / 100 || 0) *
    (actualRates.oppToProp / 100 || 0) *
    (actualRates.propToWin / 100 || 0);

  const estimatedWinsPerLeadActual = chainActual;

  let avgDealSizeActual = 0;
  const estimatedWinsThisPeriod =
    actuals.funnel.leads * estimatedWinsPerLeadActual;

  if (estimatedWinsThisPeriod > 0) {
    avgDealSizeActual = safeDiv(
      actuals.revenue.newArrThisPeriod,
      estimatedWinsThisPeriod
    );
  }

  let requiredLeadsTotal = 0;
  let requiredLeadsPerWeek = 0;

  if (requiredNewArrTotal > 0 && winsPerLeadBenchmark > 0 && avgDealSizeActual > 0) {
    const requiredWins = safeDiv(requiredNewArrTotal, avgDealSizeActual);
    requiredLeadsTotal = safeDiv(requiredWins, winsPerLeadBenchmark);
    requiredLeadsPerWeek = safeDiv(
      requiredLeadsTotal,
      benchmarks.revenue.timeframeWeeks || 1
    );
  }

  const currentLeadsPerWeek = safeDiv(
    actuals.funnel.leads,
    actuals.periodWeeks || 1
  );

  return {
    winsPerLeadBenchmark,
    estimatedWinsPerLeadActual,
    requiredLeadsTotal,
    requiredLeadsPerWeek,
    currentLeadsPerWeek,
    avgDealSizeActual,
  };
}

function computeScenarios(params: {
  benchmarks: Benchmarks;
  actuals: Actuals;
  actualRates: ActualRates;
  arrGap: number;
  winsPerLeadBenchmark: number;
  estimatedWinsPerLeadActual: number;
  avgDealSizeActual: number;
  requiredLeadsTotal: number;
  worstStageKey: FunnelStageKey | null;
}): Scenario[] {
  const {
    benchmarks,
    actuals,
    actualRates,
    arrGap,
    winsPerLeadBenchmark,
    estimatedWinsPerLeadActual,
    avgDealSizeActual,
    requiredLeadsTotal,
    worstStageKey,
  } = params;

  const baseArr = actuals.revenue.newArrThisPeriod;
  const baseWinsObserved = actuals.funnel.wins;

  let acv = avgDealSizeActual;
  if (!acv || !isFinite(acv)) {
    if (baseWinsObserved > 0 && baseArr > 0) {
      acv = baseArr / baseWinsObserved;
    } else {
      acv = benchmarks.revenue.avgDealSizeTarget || 0;
    }
  }
  if (!acv || !isFinite(acv)) {
    return [];
  }

  const timeframeMonths = (benchmarks.revenue.timeframeWeeks || 1) / 4.33;
  const scenarios: Scenario[] = [];

  // Scenario 1: Fix the single worst bottleneck back to benchmark
  if (worstStageKey) {
    const scenarioRates: ActualRates = { ...actualRates };
    let stageLabel = "";
    let actRate = 0;
    let tgtRate = 0;

    switch (worstStageKey) {
      case "leadsToMql":
        scenarioRates.leadsToMql = benchmarks.marketing.leadsToMql;
        stageLabel = "Leads → MQL";
        actRate = actualRates.leadsToMql;
        tgtRate = benchmarks.marketing.leadsToMql;
        break;
      case "mqlToSql":
        scenarioRates.mqlToSql = benchmarks.marketing.mqlToSql;
        stageLabel = "MQL → SQL";
        actRate = actualRates.mqlToSql;
        tgtRate = benchmarks.marketing.mqlToSql;
        break;
      case "sqlToOpp":
        scenarioRates.sqlToOpp = benchmarks.sales.sqlToOpp;
        stageLabel = "SQL → Opp";
        actRate = actualRates.sqlToOpp;
        tgtRate = benchmarks.sales.sqlToOpp;
        break;
      case "oppToProp":
        scenarioRates.oppToProp = benchmarks.sales.oppToProp;
        stageLabel = "Opp → Proposal";
        actRate = actualRates.oppToProp;
        tgtRate = benchmarks.sales.oppToProp;
        break;
      case "propToWin":
        scenarioRates.propToWin = benchmarks.sales.propToWin;
        stageLabel = "Proposal → Win";
        actRate = actualRates.propToWin;
        tgtRate = benchmarks.sales.propToWin;
        break;
    }

    const chainScenario =
      (scenarioRates.leadsToMql / 100 || 0) *
      (scenarioRates.mqlToSql / 100 || 0) *
      (scenarioRates.sqlToOpp / 100 || 0) *
      (scenarioRates.oppToProp / 100 || 0) *
      (scenarioRates.propToWin / 100 || 0);

    const winsScenario =
      actuals.funnel.leads > 0 ? actuals.funnel.leads * chainScenario : 0;
    const newArrScenario = winsScenario * acv;
    const extraArr = newArrScenario - baseArr;
    const gapImprovement = Math.max(Math.min(extraArr, arrGap), 0);
    const extraMonthlyArr =
      timeframeMonths > 0 ? extraArr / timeframeMonths : undefined;

    if (extraArr > 0.01) {
      scenarios.push({
        id: "fix-bottleneck",
        title: "Fix weakest conversion back to benchmark",
        description:
          stageLabel && actRate && tgtRate
            ? `Improve ${stageLabel} from ${actRate.toFixed(
                1
              )}% to ${tgtRate.toFixed(
                1
              )}% with the same lead volume. This lifts wins and ARR without extra spend at the top of the funnel.`
            : "Bring the weakest funnel stage back to its target conversion rate.",
        extraArr,
        newArrScenario,
        gapImprovement,
        extraMonthlyArr,
      });
    }
  }

  // Scenario 2: Bring all stages up to benchmark
  if (winsPerLeadBenchmark > 0 && actuals.funnel.leads > 0) {
    const winsScenario2 = actuals.funnel.leads * winsPerLeadBenchmark;
    const newArrScenario2 = winsScenario2 * acv;
    const extraArr2 = newArrScenario2 - baseArr;
    const gapImprovement2 = Math.max(Math.min(extraArr2, arrGap), 0);
    const extraMonthlyArr2 =
      timeframeMonths > 0 ? extraArr2 / timeframeMonths : undefined;

    if (extraArr2 > 0.01) {
      scenarios.push({
        id: "all-to-benchmark",
        title: "Align all funnel stages to benchmark",
        description:
          "Lift each conversion step back to its target rate while keeping lead volume constant. This compounds gains across the funnel.",
        extraArr: extraArr2,
        newArrScenario: newArrScenario2,
        gapImprovement: gapImprovement2,
        extraMonthlyArr: extraMonthlyArr2,
      });
    }
  }

  // Scenario 3: Lead volume increase (10%, 20%, 30%)
  if (winsPerLeadBenchmark > 0 && acv > 0 && actuals.funnel.leads > 0) {
    const baseLeads = actuals.funnel.leads;

    const calcArrForLeadFactor = (factor: number) => {
      const leads = baseLeads * factor;
      const wins = leads * winsPerLeadBenchmark;
      return wins * acv;
    };

    const arr10 = calcArrForLeadFactor(1.1);
    const arr20 = calcArrForLeadFactor(1.2);
    const arr30 = calcArrForLeadFactor(1.3);

    const extraArr10 = arr10 - baseArr;
    const extraArr20 = arr20 - baseArr;
    const extraArr30 = arr30 - baseArr;

    const chosenArrScenario = arr20;
    const extraArrChosen = extraArr20;
    const gapImprovementChosen = Math.max(
      Math.min(extraArrChosen, arrGap),
      0
    );
    const extraMonthlyArrChosen =
      timeframeMonths > 0 ? extraArrChosen / timeframeMonths : undefined;

    if (extraArrChosen > 0.01) {
      scenarios.push({
        id: "lead-volume",
        title: "Increase lead volume by 10–30%",
        description: `At benchmark conversion rates and current ACV, +10% leads ≈ €${Math.round(
          extraArr10
        ).toLocaleString()}, +20% ≈ €${Math.round(
          extraArr20
        ).toLocaleString()}, +30% ≈ €${Math.round(
          extraArr30
        ).toLocaleString()} additional ARR in this timeframe.`,
        extraArr: extraArrChosen,
        newArrScenario: chosenArrScenario,
        gapImprovement: gapImprovementChosen,
        extraMonthlyArr: extraMonthlyArrChosen,
      });
    }
  }

  return scenarios
    .sort((a, b) => b.extraArr - a.extraArr)
    .slice(0, 3);
}
