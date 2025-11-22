"use client";

import React, { useMemo, useState } from "react";
import type { Benchmarks } from "./BenchmarksPanel";

interface Props {
  benchmarks: Benchmarks;
}

export const MainDashboard: React.FC<Props> = ({ benchmarks }) => {
  const [leads, setLeads] = useState(2000);
  const [mqls, setMqls] = useState(500);
  const [sqls, setSqls] = useState(200);
  const [opps, setOpps] = useState(80);
  const [proposals, setProposals] = useState(40);
  const [wins, setWins] = useState(10);
  const [newArr, setNewArr] = useState(500000);
  const [periodWeeks, setPeriodWeeks] = useState(12);

  const currencySymbol =
    benchmarks.arr.currency === "EUR"
      ? "€"
      : benchmarks.arr.currency === "USD"
      ? "$"
      : "£";

  const {
    arrRunRateAnnual,
    requiredRunRateAnnual,
    predictedArrEnd,
    gapVsTarget,
    conversions,
    weakestStage,
  } = useMemo(() => {
    const safe = (num: number) => (isFinite(num) && !isNaN(num) ? num : 0);

    const leadToMql = safe((mqls / Math.max(leads, 1)) * 100);
    const mqlToSql = safe((sqls / Math.max(mqls, 1)) * 100);
    const sqlToOpp = safe((opps / Math.max(sqls, 1)) * 100);
    const oppToProposal = safe((proposals / Math.max(opps, 1)) * 100);
    const proposalToWin = safe((wins / Math.max(proposals, 1)) * 100);

    const arrRunRateAnnual = safe((newArr / Math.max(periodWeeks, 1)) * 52);

    const remainingArrNeeded = Math.max(
      benchmarks.arr.targetArr - benchmarks.arr.currentArr,
      0
    );
    const requiredWeeklyNewArr = safe(
      remainingArrNeeded / Math.max(benchmarks.arr.timeframeWeeks, 1)
    );
    const requiredRunRateAnnual = requiredWeeklyNewArr * 52;

    const incrementalArrOverTimeframe =
      arrRunRateAnnual * (benchmarks.arr.timeframeWeeks / 52);
    const predictedArrEnd =
      benchmarks.arr.currentArr + incrementalArrOverTimeframe;

    const gapVsTarget = benchmarks.arr.targetArr - predictedArrEnd;

    const conversions = [
      {
        id: "leadToMql",
        label: "Lead → MQL",
        actual: leadToMql,
        target: benchmarks.marketing.leadToMql,
      },
      {
        id: "mqlToSql",
        label: "MQL → SQL",
        actual: mqlToSql,
        target: benchmarks.marketing.mqlToSql,
      },
      {
        id: "sqlToOpp",
        label: "SQL → Opp",
        actual: sqlToOpp,
        target: benchmarks.marketing.sqlToOpp,
      },
      {
        id: "oppToProposal",
        label: "Opp → Proposal",
        actual: oppToProposal,
        target: benchmarks.sales.oppToProposal,
      },
      {
        id: "proposalToWin",
        label: "Proposal → Win",
        actual: proposalToWin,
        target: benchmarks.sales.proposalToWin,
      },
    ];

    const weakestStage = conversions.reduce((worst, stage) => {
      const delta = stage.actual - stage.target;
      if (!worst) return { ...stage, delta };
      const worstDelta = (worst as any).delta;
      return delta < worstDelta ? { ...stage, delta } : worst;
    }, null as any);

    return {
      arrRunRateAnnual,
      requiredRunRateAnnual,
      predictedArrEnd,
      gapVsTarget,
      conversions,
      weakestStage,
    };
  }, [benchmarks, leads, mqls, sqls, opps, proposals, wins, newArr, periodWeeks]);

  const card =
    "bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2";
  const label = "text-xs text-slate-400 mb-1 block";
  const input =
    "w-full rounded-xl bg-slate-950/70 border border-slate-800 px-4 py-3 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500";

  const formatMoney = (val: number) =>
    `${currencySymbol}${val.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    })}`;

  const formatPct = (val: number) =>
    `${val.toLocaleString(undefined, { maximumFractionDigits: 1 })}%`;

  const gapLabel =
    gapVsTarget > 0
      ? `You are ${formatMoney(gapVsTarget)} behind target at this run rate.`
      : `You are ${formatMoney(Math.abs(gapVsTarget))} ahead of target at this run rate.`;

  return (
    <section className="bg-slate-950/40 border border-slate-800 rounded-3xl p-6 flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold">Throughput & ARR Dashboard</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Enter a recent period of funnel performance (for example last quarter or
          last 3 months) to see conversion rates, ARR run rate, and where the
          funnel is weakest versus your targets.
        </p>
      </div>

      {/* Top grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] gap-4">
        {/* Funnel volumes */}
        <div className={card}>
          <h3 className="text-sm font-semibold">Funnel volumes (this period)</h3>

          <div>
            <label className={label}>Leads</label>
            <input
              type="number"
              className={input}
              value={leads}
              onChange={(e) => setLeads(Number(e.target.value || 0))}
            />
          </div>
          <div>
            <label className={label}>MQLs</label>
            <input
              type="number"
              className={input}
              value={mqls}
              onChange={(e) => setMqls(Number(e.target.value || 0))}
            />
          </div>
          <div>
            <label className={label}>SQLs</label>
            <input
              type="number"
              className={input}
              value={sqls}
              onChange={(e) => setSqls(Number(e.target.value || 0))}
            />
          </div>
          <div>
            <label className={label}>Opportunities</label>
            <input
              type="number"
              className={input}
              value={opps}
              onChange={(e) => setOpps(Number(e.target.value || 0))}
            />
          </div>
          <div>
            <label className={label}>Proposals</label>
            <input
              type="number"
              className={input}
              value={proposals}
              onChange={(e) => setProposals(Number(e.target.value || 0))}
            />
          </div>
          <div>
            <label className={label}>Wins</label>
            <input
              type="number"
              className={input}
              value={wins}
              onChange={(e) => setWins(Number(e.target.value || 0))}
            />
          </div>
        </div>

        {/* Revenue and period */}
        <div className={card}>
          <h3 className="text-sm font-semibold">Revenue for this period</h3>

          <div>
            <label className={label}>New ARR closed</label>
            <div className="relative">
              <input
                type="number"
                className={input}
                value={newArr}
                onChange={(e) => setNewArr(Number(e.target.value || 0))}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                {currencySymbol}
              </span>
            </div>
          </div>

          <div>
            <label className={label}>Period length</label>
            <div className="relative">
              <input
                type="number"
                className={input}
                value={periodWeeks}
                onChange={(e) =>
                  setPeriodWeeks(Math.max(Number(e.target.value || 0), 1))
                }
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                weeks
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              For example, last quarter (13 weeks) or last 3 months (12 weeks).
              The calculator annualises this to estimate your ARR run rate.
            </p>
          </div>
        </div>

        {/* ARR run rate */}
        <div className={card}>
          <h3 className="text-xs font-semibold text-slate-400">
            ARR run rate (based on this period)
          </h3>
          <p className="text-2xl font-semibold">
            {formatMoney(arrRunRateAnnual)}
          </p>
          <p className="text-xs text-slate-400">
            New ARR from this period annualised at the same pace.
          </p>

          <div className="mt-4 border-t border-slate-800 pt-3">
            <p className="text-[11px] text-slate-400">
              Benchmark timeframe:{" "}
              <span className="font-medium text-slate-200">
                {benchmarks.arr.timeframeWeeks} weeks
              </span>
              . Current ARR:{" "}
              <span className="font-medium text-slate-200">
                {formatMoney(benchmarks.arr.currentArr)}
              </span>
              .
            </p>
          </div>
        </div>

        {/* Required run rate / gap */}
        <div className={card}>
          <h3 className="text-xs font-semibold text-slate-400">
            Required ARR run rate
          </h3>
          <p className="text-2xl font-semibold">
            {formatMoney(requiredRunRateAnnual)}
          </p>
          <p className="text-xs text-slate-400">
            Annualised new ARR needed from now to reach{" "}
            {formatMoney(benchmarks.arr.targetArr)} in{" "}
            {benchmarks.arr.timeframeWeeks} weeks.
          </p>

          <div className="mt-4 border-t border-slate-800 pt-3">
            <p className="text-xs font-semibold text-slate-200">
              Predicted ARR at end of timeframe
            </p>
            <p className="text-sm text-slate-100">
              {formatMoney(predictedArrEnd)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">{gapLabel}</p>
          </div>
        </div>
      </div>

      {/* Conversions row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {conversions.map((stage) => {
          const delta = stage.actual - stage.target;
          const colour =
            delta < -5
              ? "border-red-500/70 bg-red-950/40"
              : delta < 0
              ? "border-amber-500/70 bg-amber-950/30"
              : "border-emerald-500/60 bg-emerald-950/30";

          return (
            <div
              key={stage.id}
              className={`rounded-2xl border px-3 py-3 flex flex-col gap-1 ${colour}`}
            >
              <p className="text-[11px] text-slate-200 font-medium">
                {stage.label}
              </p>
              <p className="text-sm font-semibold">
                {formatPct(stage.actual || 0)}
              </p>
              <p className="text-[11px] text-slate-300">
                Target {formatPct(stage.target)}{" "}
                <span className="text-slate-400">
                  ({delta >= 0 ? "+" : ""}
                  {delta.toFixed(1)} pts)
                </span>
              </p>
            </div>
          );
        })}
      </div>

      {/* Bottom cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={card}>
          <h3 className="text-sm font-semibold">Bottleneck diagnosis</h3>
          {weakestStage ? (
            <>
              <p className="text-sm text-slate-100">
                <span className="font-semibold">{weakestStage.label}</span> is
                currently the weakest stage versus target.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Actual: {formatPct(weakestStage.actual || 0)}. Target:{" "}
                {formatPct(weakestStage.target || 0)}.
              </p>
              <p className="text-xs text-slate-400 mt-3">
                Improving this step will have an outsized impact on throughput.
                For example, if{" "}
                <span className="font-medium text-slate-200">
                  {weakestStage.label}
                </span>{" "}
                moved closer to target, more opportunities would flow through to
                downstream stages without needing extra spend at the top of the
                funnel.
              </p>
            </>
          ) : (
            <p className="text-xs text-slate-400">
              Add some funnel data to see which stage is furthest below
              benchmark.
            </p>
          )}
        </div>

        <div className={card}>
          <h3 className="text-sm font-semibold">Growth path suggestion</h3>
          <p className="text-xs text-slate-400">
            Use this dashboard in an EdgeTier-style review to compare last
            quarter or last year against current performance, then ask:
          </p>
          <ul className="mt-2 text-xs text-slate-300 list-disc list-inside space-y-1">
            <li>Which stage is most below target and why?</li>
            <li>What tests can we run to improve that conversion?</li>
            <li>
              How much incremental ARR could we unlock by closing part of the
              gap?
            </li>
          </ul>
          <p className="text-xs text-slate-400 mt-3">
            That turns this from a static dashboard into a scenario planning
            tool: tweak inputs, watch ARR run rate and predicted ARR move, and
            prioritise initiatives accordingly.
          </p>
        </div>
      </div>
    </section>
  );
};
