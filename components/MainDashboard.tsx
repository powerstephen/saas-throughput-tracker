// components/MainDashboard.tsx
"use client";

import React, { useState, useMemo } from "react";

type MainDashboardProps = {
  // keep this intentionally loose so it works with your existing BenchmarksPanel
  benchmarks: any;
};

type FunnelInputs = {
  leads: number;
  mqls: number;
  sqls: number;
  opps: number;
  proposals: number;
  wins: number;
  newArr: number;
  periodWeeks: number;
};

const defaultFunnel: FunnelInputs = {
  leads: 2000,
  mqls: 500,
  sqls: 200,
  opps: 80,
  proposals: 40,
  wins: 10,
  newArr: 500000,
  periodWeeks: 12,
};

const cardClass =
  "rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-4 flex flex-col justify-between";

const labelClass = "text-xs font-medium text-slate-400";
const valueClass = "text-xl font-semibold text-slate-50";
const subClass = "mt-1 text-xs text-slate-400";

function fmtCurrency(v: number, currency: string) {
  if (!Number.isFinite(v)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Math.round(v));
}

function fmtPct(v: number) {
  if (!Number.isFinite(v)) return "-";
  return `${v.toFixed(1)}%`;
}

export default function MainDashboard({ benchmarks }: MainDashboardProps) {
  const [funnel, setFunnel] = useState<FunnelInputs>(defaultFunnel);
  const [hasRun, setHasRun] = useState(false);

  // try to read from benchmarks but fall back to sensible defaults
  const currency: string =
    benchmarks?.currency === "USD"
      ? "USD"
      : benchmarks?.currency === "GBP"
      ? "GBP"
      : "EUR";

  const currentArr = Number(benchmarks?.currentArr ?? 1500000);
  const arrTarget = Number(benchmarks?.arrTarget ?? 2500000);
  const timeframeWeeks = Number(benchmarks?.timeframeWeeks ?? 52);

  // stage targets – tolerate different possible key names
  const leadToMqlTarget =
    Number(
      benchmarks?.leadToMqlTarget ??
        benchmarks?.leadToMql ??
        benchmarks?.marketingLeadToMql
    ) || 25;
  const mqlToSqlTarget =
    Number(
      benchmarks?.mqlToSqlTarget ??
        benchmarks?.mqlToSql ??
        benchmarks?.marketingMqlToSql
    ) || 40;
  const sqlToOppTarget =
    Number(
      benchmarks?.sqlToOppTarget ??
        benchmarks?.sqlToOpp ??
        benchmarks?.salesSqlToOpp
    ) || 35;
  const oppToProposalTarget =
    Number(
      benchmarks?.oppToProposalTarget ??
        benchmarks?.oppToProposal ??
        benchmarks?.salesOppToProposal
    ) || 50;
  const proposalToWinTarget =
    Number(
      benchmarks?.proposalToWinTarget ??
        benchmarks?.proposalToWin ??
        benchmarks?.salesProposalToWin
    ) || 25;

  const {
    leadToMqlRate,
    mqlToSqlRate,
    sqlToOppRate,
    oppToProposalRate,
    proposalToWinRate,
    annualisedNetNewArr,
    projectedArrInTimeframe,
    gapToTarget,
    currentMonthlyNetNew,
    requiredMonthlyNetNew,
    monthlyDelta,
    bottleneckLabel,
  } = useMemo(() => {
    const safe = (n: number) => (n <= 0 ? 1 : n);

    const leadToMqlRate =
      funnel.leads > 0 ? (funnel.mqls / funnel.leads) * 100 : 0;
    const mqlToSqlRate =
      funnel.mqls > 0 ? (funnel.sqls / funnel.mqls) * 100 : 0;
    const sqlToOppRate =
      funnel.sqls > 0 ? (funnel.opps / funnel.sqls) * 100 : 0;
    const oppToProposalRate =
      funnel.opps > 0 ? (funnel.proposals / funnel.opps) * 100 : 0;
    const proposalToWinRate =
      funnel.proposals > 0 ? (funnel.wins / funnel.proposals) * 100 : 0;

    const periodWeeks = safe(funnel.periodWeeks);
    const annualisedNetNewArr = funnel.newArr * (52 / periodWeeks);

    const projectedArrInTimeframe =
      currentArr + annualisedNetNewArr * (timeframeWeeks / 52);

    const gapToTarget = arrTarget - projectedArrInTimeframe;

    const currentMonthlyNetNew = annualisedNetNewArr / 12;

    const timeframeMonths = timeframeWeeks / 4.33; // approx
    const neededNetNewTotal = Math.max(0, arrTarget - currentArr);
    const requiredMonthlyNetNew =
      timeframeMonths > 0 ? neededNetNewTotal / timeframeMonths : 0;

    const monthlyDelta = requiredMonthlyNetNew - currentMonthlyNetNew;

    // bottleneck: biggest shortfall vs target
    const gaps = [
      {
        label: "Lead → MQL",
        shortfall: leadToMqlTarget - leadToMqlRate,
      },
      {
        label: "MQL → SQL",
        shortfall: mqlToSqlTarget - mqlToSqlRate,
      },
      {
        label: "SQL → Opp",
        shortfall: sqlToOppTarget - sqlToOppRate,
      },
      {
        label: "Opp → Proposal",
        shortfall: oppToProposalTarget - oppToProposalRate,
      },
      {
        label: "Proposal → Win",
        shortfall: proposalToWinTarget - proposalToWinRate,
      },
    ];

    const worst = gaps.reduce((acc, g) =>
      g.shortfall > (acc?.shortfall ?? -Infinity) ? g : acc
    );

    const bottleneckLabel =
      worst && worst.shortfall > 0 ? worst.label : "No obvious bottleneck";

    return {
      leadToMqlRate,
      mqlToSqlRate,
      sqlToOppRate,
      oppToProposalRate,
      proposalToWinRate,
      annualisedNetNewArr,
      projectedArrInTimeframe,
      gapToTarget,
      currentMonthlyNetNew,
      requiredMonthlyNetNew,
      monthlyDelta,
      bottleneckLabel,
    };
  }, [
    funnel,
    arrTarget,
    currentArr,
    timeframeWeeks,
    leadToMqlTarget,
    mqlToSqlTarget,
    sqlToOppTarget,
    oppToProposalTarget,
    proposalToWinTarget,
  ]);

  const handleInputChange =
    (field: keyof FunnelInputs) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value.replace(/[^0-9.]/g, "")) || 0;
      setFunnel((prev) => ({ ...prev, [field]: value }));
    };

  return (
    <div className="space-y-6">
      {/* INPUT PANEL */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-50">
              Throughput & ARR Dashboard
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Enter a recent period of funnel performance (e.g. last quarter)
              and new ARR. The dashboard will show current ARR run rate,
              required run rate to hit target, and your weakest stage versus
              benchmarks.
            </p>
          </div>

          <button
            onClick={() => setHasRun(true)}
            className="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-sky-500/30 hover:bg-sky-400 transition-colors"
          >
            Run analysis
          </button>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {/* Funnel inputs */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-100">
              Funnel volumes (this period)
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { key: "leads", label: "Leads" },
                { key: "mqls", label: "MQLs" },
                { key: "sqls", label: "SQLs" },
                { key: "opps", label: "Opportunities" },
                { key: "proposals", label: "Proposals" },
                { key: "wins", label: "Wins" },
              ].map((f) => (
                <div key={f.key}>
                  <label className={labelClass}>{f.label}</label>
                  <input
                    type="text"
                    value={funnel[f.key as keyof FunnelInputs] || ""}
                    onChange={handleInputChange(f.key as keyof FunnelInputs)}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ARR inputs */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-100">
              Revenue for this period
            </h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>New ARR closed</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={funnel.newArr || ""}
                    onChange={handleInputChange("newArr")}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
                  />
                  <span className="text-xs text-slate-400">{currency}</span>
                </div>
              </div>
              <div>
                <label className={labelClass}>Period length</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={funnel.periodWeeks || ""}
                    onChange={handleInputChange("periodWeeks")}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none focus:border-sky-500"
                  />
                  <span className="text-xs text-slate-400">weeks</span>
                </div>
              </div>
              <p className="text-[11px] leading-snug text-slate-400">
                For example, last quarter (13 weeks) or last 3 months (12
                weeks). The calculator annualises this to estimate run rate.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RESULTS PANEL */}
      {hasRun && (
        <div className="space-y-6">
          {/* Top metrics row */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className={cardClass}>
              <div>
                <div className={labelClass}>Current ARR</div>
                <div className={valueClass}>{fmtCurrency(currentArr, currency)}</div>
              </div>
              <div className={subClass}>Starting ARR at the beginning of the timeframe.</div>
            </div>

            <div className={cardClass}>
              <div>
                <div className={labelClass}>ARR target</div>
                <div className={valueClass}>{fmtCurrency(arrTarget, currency)}</div>
              </div>
              <div className={subClass}>
                Target ARR over the next {Math.round(timeframeWeeks / 4.33)} months.
              </div>
            </div>

            <div className={cardClass}>
              <div>
                <div className={labelClass}>Projected ARR in timeframe</div>
                <div className={valueClass}>
                  {fmtCurrency(projectedArrInTimeframe, currency)}
                </div>
              </div>
              <div className={subClass}>
                If you keep closing new ARR at this pace for the selected timeframe.
              </div>
            </div>

            <div className={cardClass}>
              <div>
                <div className={labelClass}>Gap vs ARR target</div>
                <div
                  className={`${valueClass} ${
                    gapToTarget > 0 ? "text-amber-400" : "text-emerald-400"
                  }`}
                >
                  {fmtCurrency(Math.abs(gapToTarget), currency)}
                </div>
              </div>
              <div className={subClass}>
                {gapToTarget > 0
                  ? "Additional ARR required at current pace."
                  : "You are ahead of your target at this run rate."}
              </div>
            </div>
          </div>

          {/* Run rate & monthly needs */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className={cardClass}>
              <div>
                <div className={labelClass}>Current net new ARR / month</div>
                <div className={valueClass}>
                  {fmtCurrency(currentMonthlyNetNew, currency)}
                </div>
              </div>
              <div className={subClass}>
                Average monthly new ARR based on the period you entered.
              </div>
            </div>

            <div className={cardClass}>
              <div>
                <div className={labelClass}>Required net new ARR / month</div>
                <div className={valueClass}>
                  {fmtCurrency(requiredMonthlyNetNew, currency)}
                </div>
              </div>
              <div className={subClass}>
                Average monthly ARR you need to close to reach the ARR target.
              </div>
            </div>

            <div className={cardClass}>
              <div>
                <div className={labelClass}>Run-rate gap per month</div>
                <div
                  className={`${valueClass} ${
                    monthlyDelta > 0 ? "text-amber-400" : "text-emerald-400"
                  }`}
                >
                  {fmtCurrency(Math.abs(monthlyDelta), currency)}
                </div>
              </div>
              <div className={subClass}>
                {monthlyDelta > 0
                  ? "Extra ARR per month required vs your current pace."
                  : "You are exceeding the required monthly run rate."}
              </div>
            </div>
          </div>

          {/* Conversion cards */}
          <div className="grid gap-4 md:grid-cols-5">
            <div className={cardClass}>
              <div className={labelClass}>Lead → MQL</div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className={valueClass}>{fmtPct(leadToMqlRate)}</span>
              </div>
              <div className={subClass}>
                Target {fmtPct(leadToMqlTarget)} ({(leadToMqlRate - leadToMqlTarget).toFixed(1)} pts vs target)
              </div>
            </div>

            <div className={cardClass}>
              <div className={labelClass}>MQL → SQL</div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className={valueClass}>{fmtPct(mqlToSqlRate)}</span>
              </div>
              <div className={subClass}>
                Target {fmtPct(mqlToSqlTarget)} ({(mqlToSqlRate - mqlToSqlTarget).toFixed(1)} pts vs target)
              </div>
            </div>

            <div className={cardClass}>
              <div className={labelClass}>SQL → Opp</div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className={valueClass}>{fmtPct(sqlToOppRate)}</span>
              </div>
              <div className={subClass}>
                Target {fmtPct(sqlToOppTarget)} ({(sqlToOppRate - sqlToOppTarget).toFixed(1)} pts vs target)
              </div>
            </div>

            <div className={cardClass}>
              <div className={labelClass}>Opp → Proposal</div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className={valueClass}>{fmtPct(oppToProposalRate)}</span>
              </div>
              <div className={subClass}>
                Target {fmtPct(oppToProposalTarget)} (
                {(oppToProposalRate - oppToProposalTarget).toFixed(1)} pts vs target)
              </div>
            </div>

            <div className={cardClass}>
              <div className={labelClass}>Proposal → Win</div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className={valueClass}>{fmtPct(proposalToWinRate)}</span>
              </div>
              <div className={subClass}>
                Target {fmtPct(proposalToWinTarget)} (
                {(proposalToWinRate - proposalToWinTarget).toFixed(1)} pts vs target)
              </div>
            </div>
          </div>

          {/* Diagnosis + growth narrative */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className={cardClass}>
              <div className="text-sm font-semibold text-slate-100">
                Bottleneck diagnosis
              </div>
              <p className="mt-2 text-sm text-slate-300">
                {bottleneckLabel === "No obvious bottleneck" ? (
                  <>
                    No stage is materially below target based on the benchmarks
                    you entered. Use this period as a baseline and stress-test
                    different scenarios by tweaking inputs above.
                  </>
                ) : (
                  <>
                    <span className="font-semibold">{bottleneckLabel}</span>{" "}
                    is currently the weakest stage versus your targets. Improving
                    this step will have an outsized impact on throughput and ARR
                    without adding more top-of-funnel spend.
                  </>
                )}
              </p>
            </div>

            <div className={cardClass}>
              <div className="text-sm font-semibold text-slate-100">
                Growth path suggestion
              </div>
              <p className="mt-2 text-sm text-slate-300">
                Use this dashboard in an EdgeTier-style review to compare last
                quarter or last year against current performance. Start with the
                monthly run-rate gap, then ask: which stage is most off
                benchmark and why, what experiments can we run there, and how
                much incremental ARR would closing half of that gap unlock.
              </p>
              <p className="mt-2 text-xs text-slate-400">
                The goal is to walk into interviews with a clear point of view
                on where throughput is leaking and which levers you would pull
                first to move ARR.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
