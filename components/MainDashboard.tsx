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
      avgDealSizeTarget: 50000, // target ACV
    },
  });

  const [includeCs, setIncludeCs] = useState(false);
  const [showBenchmarks, setShowBenchmarks] = useState(true);

  const [timeframeDays, setTimeframeDays] = useState<30 | 60 | 90>(90);

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

  return (
    <div className="space-y-6">
      {/* Heading */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-50">
          SaaS Throughput and ARR Path
        </h1>
        <p className="text-sm text-slate-400">
          Input a recent period of funnel performance, compare it to your own benchmarks,
          and see ACV, ARR run rate, and lead volume needed to hit target.
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
        {/* Top row: timeframe + CS toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Funnel and ARR performance for a recent period
            </h2>
            <p className="text-xs text-slate-400">
              Choose a recent timeframe (30, 60, or 90 days), enter funnel counts, and
              the calculator will derive conversion rates, ACV, ARR run rate, and required
              lead volume.
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <label className="text-xs text-slate-300 flex flex-col">
              Timeframe
              <select
                className="mt-1 bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs"
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

        {/* Funnel row: Leads → Wins */}
        <div className="overflow-x-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 min-w-[600px]">
            {/* Leads */}
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

            {/* MQLs */}
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

            {/* SQLs */}
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

            {/* Opps */}
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

            {/* Proposals */}
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

            {/* Wins */}
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

        {/* New ARR + ACV row */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <label className="text-xs text-slate-300 flex flex-col">
            New ARR in this timeframe (€)
            <input
              type="number"
              className="mt-1 bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs"
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
            <span className="text-[10px] text-slate-500 mt-1">
              Total new ARR closed in this period.
            </span>
          </label>

          <div className="text-xs text-slate-300 flex flex-col">
            <span>Average contract value (ACV)</span>
            <div className="mt-1 bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-100">
              {avgDealSizeActual > 0
                ? `€${Math.round(avgDealSizeActual).toLocaleString()}`
                : "Enter wins and ARR to calculate ACV"}
            </div>
            <span className="text-[10px] text-slate-500 mt-1">
              Calculated as New ARR / Wins in this timeframe.
            </span>
          </div>
        </div>
      </section>

      {/* Key metrics strip */}
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
        />
        <StatCard
          label="Forecast ARR at end of target period"
          value={`€${Math.round(forecastArrEnd).toLocaleString()}`}
          helper="Based on current run rate and NRR setting."
        />
        <StatCard
          label="Gap to target ARR"
          value={`€${Math.round(arrGap).toLocaleString()}`}
          helper={arrGap > 0 ? "Additional ARR needed to hit target." : "On track or above target at current run rate."}
        />
        <StatCard
          label="Current run rate (monthly)"
          value={`€${Math.round(actualNewArrPerMonth).toLocaleString()}`}
          helper={`From new ARR in ${timeframeLabel}.`}
        />
        <StatCard
          label="Required run rate (monthly)"
          value={`€${Math.round(requiredNewArrPerMonth).toLocaleString()}`}
          helper="Average new ARR per month needed to hit target."
        />
      </section>

      {/* Results: overview cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ARR overview */}
        <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 space-y-2">
          <h3 className="text-sm font-semibold text-slate-100">
            ARR run rate versus target
          </h3>
          <p className="text-xs text-slate-400">
            Based on your current new ARR pace, time to target, and optional NRR impact.
          </p>
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-300">Target ARR</span>
              <span className="font-medium">
                €{benchmarks.revenue.targetArr.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Forecast ARR</span>
              <span className="font-medium">
                €{Math.round(forecastArrEnd).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Gap to target</span>
              <span className="font-medium">
                €{Math.round(arrGap).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-800 mt-2">
              <span className="text-slate-300">Current new ARR / month</span>
              <span className="font-medium">
                €{Math.round(actualNewArrPerMonth).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Required new ARR / month</span>
              <span className="font-medium">
                €{Math.round(requiredNewArrPerMonth).toLocaleString()}
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
            estimated ACV.
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
                  Current leads / week (this timeframe)
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
    <div className="border border-slate-700 rounded-lg p-3 bg-slate-950/60">
      <div className="text-xs font-semibold text-slate-100 mb-1">{title}</div>
      <input
        type="number"
        inputMode="decimal"
        value={Number.isNaN(count) ? "" : count}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
      />
      {showRates &&
        rateLabel &&
        actualRate !== undefined &&
        targetRate !== undefined && (
          <div className="mt-2 text-[10px] space-y-0.5">
            <div className="text-slate-400">{rateLabel}</div>
            <div className="flex justify-between">
              <span className="text-slate-500">Actual</span>
              <span className="font-medium text-slate-100">
                {actualRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Target</span>
              <span className="font-medium text-slate-100">
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
};

function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-3 flex flex-col gap-1">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-lg font-semibold text-slate-50">{value}</div>
      {helper && <div className="text-[11px] text-slate-500">{helper}</div>}
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
    requiredNewArrTotal = Math.max(
      targetArr - forecastArrEnd,
      0
    );
  }

  // add expected new ARR at current run rate over the target timeframe
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
  };
}

function computeLeadRequirements(
  benchmarks: Benchmarks,
  actuals: Actuals,
  actualRates: ActualRates,
  requiredNewArrTotal: number
) {
  // Benchmark chain
  const chainBenchmark =
    (benchmarks.marketing.leadsToMql / 100 || 0) *
    (benchmarks.marketing.mqlToSql / 100 || 0) *
    (benchmarks.sales.sqlToOpp / 100 || 0) *
    (benchmarks.sales.oppToProp / 100 || 0) *
    (benchmarks.sales.propToWin / 100 || 0);

  const winsPerLeadBenchmark = chainBenchmark;

  // Actual chain from derived rates
  const chainActual =
    (actualRates.leadsToMql / 100 || 0) *
    (actualRates.mqlToSql / 100 || 0) *
    (actualRates.sqlToOpp / 100 || 0) *
    (actualRates.oppToProp / 100 || 0) *
    (actualRates.propToWin / 100 || 0);

  const estimatedWinsPerLeadActual = chainActual;

  // Estimate average deal size from actuals if possible
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
