"use client";

import { Benchmarks } from "./BenchmarksPanel";

type Props = {
  benchmarks: Benchmarks;
};

export default function MainDashboard({ benchmarks }: Props) {
  const {
    marketing,
    sales,
    cs,
    arr: { currentArr, arrTarget, timeframeWeeks, blendedCac },
  } = benchmarks;

  // Simple throughput modelling based on benchmarks + lead volume
  const leads = marketing.leadsPerMonth;
  const mqls = Math.round(leads * (marketing.leadToMql / 100));
  const sqls = Math.round(mqls * (marketing.mqlToSql / 100));
  const opps = Math.round(sqls * (marketing.sqlToOpp / 100));
  const proposals = Math.round(opps * (sales.oppToProposal / 100));
  const wins = Math.round(proposals * (sales.proposalToWin / 100));

  const newArrPerMonth = wins * sales.acv;
  const arrRunRate = newArrPerMonth * 12;

  const months = timeframeWeeks / 4.333; // rough conversion
  const projectedArrInTimeframe = currentArr + newArrPerMonth * months;
  const gapToTarget = Math.max(arrTarget - projectedArrInTimeframe, 0);
  const requiredNewArrPerMonth =
    months > 0 ? Math.max(arrTarget - currentArr, 0) / months : 0;

  const bottlenecks = [
    {
      label: "Lead → MQL",
      value: marketing.leadToMql,
      target: 25,
    },
    {
      label: "MQL → SQL",
      value: marketing.mqlToSql,
      target: 40,
    },
    {
      label: "SQL → Opp",
      value: marketing.sqlToOpp,
      target: 35,
    },
    {
      label: "Opp → Proposal",
      value: sales.oppToProposal,
      target: 50,
    },
    {
      label: "Proposal → Win",
      value: sales.proposalToWin,
      target: 25,
    },
  ];

  const weakest = bottlenecks.reduce((worst, step) => {
    const gap = step.value - step.target;
    const worstGap = worst.value - worst.target;
    return gap < worstGap ? step : worst;
  });

  const currency = "€";

  return (
    <section className="space-y-6">
      {/* Top row: ARR + gap + requirement */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card
          title="Current ARR"
          value={`${currency}${formatNumber(currentArr)}`}
          subtitle="Baseline ARR today"
        />
        <Card
          title="ARR Target"
          value={`${currency}${formatNumber(arrTarget)}`}
          subtitle={`Timeframe: ~${Math.round(months)} months`}
        />
        <Card
          title="Projected ARR in timeframe"
          value={`${currency}${formatNumber(projectedArrInTimeframe)}`}
          subtitle="If current net new ARR trends hold."
          tone="info"
        />
        <Card
          title="Gap to ARR target"
          value={`${currency}${formatNumber(gapToTarget)}`}
          subtitle="Additional ARR needed in this timeframe."
          tone={gapToTarget > 0 ? "warn" : "good"}
        />
      </div>

      {/* Run-rate and CAC view */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card
          title="Net new ARR / month"
          value={`${currency}${formatNumber(newArrPerMonth)}`}
          subtitle={`ARR run rate (12m): ${currency}${formatNumber(arrRunRate)}`}
        />
        <Card
          title="Required ARR / month"
          value={`${currency}${formatNumber(requiredNewArrPerMonth)}`}
          subtitle="Average new ARR / month needed to hit target."
        />
        <Card
          title="Implied CAC payback"
          value={`${calcPayback(blendedCac, sales.acv)} months`}
          subtitle="Based on ACV and blended CAC."
        />
        <Card
          title="NRR target"
          value={`${cs.nrr.toFixed(0)}%`}
          subtitle={`Churn ${cs.churnMonthly}% / Expansion ${cs.expansionRate}%`}
        />
      </div>

      {/* Funnel throughput row */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-100">
          Funnel throughput (per month)
        </h3>
        <div className="grid gap-3 md:grid-cols-6 text-sm">
          <Metric label="Leads" value={leads} />
          <Metric label="MQLs" value={mqls} />
          <Metric label="SQLs" value={sqls} />
          <Metric label="Opportunities" value={opps} />
          <Metric label="Proposals" value={proposals} />
          <Metric label="Wins" value={wins} />
        </div>
      </div>

      {/* Bottleneck + growth path */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-4 space-y-2">
          <h3 className="text-sm font-semibold">Bottleneck diagnosis</h3>
          <p className="text-xs text-slate-300">
            <span className="font-semibold">{weakest.label}</span> is currently
            the weakest stage versus target.
          </p>
          <p className="text-xs text-slate-400">
            Actual: {weakest.value.toFixed(1)}%, Target:{" "}
            {weakest.target.toFixed(1)}%. Improving this step will have an
            outsized impact on throughput because more opportunities will flow
            into downstream stages without extra spend at the very top of the
            funnel.
          </p>
        </div>
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-4 space-y-2">
          <h3 className="text-sm font-semibold">Growth path suggestion</h3>
          <p className="text-xs text-slate-300">
            Use this view in an EdgeTier-style review to compare last quarter or
            last year against current performance.
          </p>
          <p className="text-xs text-slate-400">
            Ask which stage is most below target and why, what experiments you
            can run to improve that conversion, and how much additional ARR you
            could unlock by closing half the gap. That turns this dashboard into
            a scenario planning tool: tweak inputs, watch ARR run rate and gap
            move, then prioritise initiatives accordingly.
          </p>
        </div>
      </div>
    </section>
  );
}

type CardProps = {
  title: string;
  value: string;
  subtitle?: string;
  tone?: "normal" | "info" | "warn" | "good";
};

function Card({ title, value, subtitle, tone = "normal" }: CardProps) {
  const border =
    tone === "info"
      ? "border-sky-500/60"
      : tone === "warn"
      ? "border-amber-500/60"
      : tone === "good"
      ? "border-emerald-500/60"
      : "border-slate-800";

  return (
    <div
      className={`rounded-3xl bg-slate-900/80 border ${border} px-4 py-3 flex flex-col justify-between`}
    >
      <div>
        <p className="text-xs text-slate-400">{title}</p>
        <p className="mt-1 text-lg font-semibold">{value}</p>
      </div>
      {subtitle && (
        <p className="mt-1 text-[11px] text-slate-500 leading-snug">
          {subtitle}
        </p>
      )}
    </div>
  );
}

type MetricProps = {
  label: string;
  value: number | string;
};

function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-2xl bg-slate-950/40 border border-slate-800 px-3 py-2">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="text-sm font-semibold mt-1">
        {typeof value === "number" ? formatNumber(value) : value}
      </p>
    </div>
  );
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });
}

function calcPayback(cac: number, acv: number): string {
  if (!cac || !acv) return "–";
  const months = cac / (acv / 12);
  return months.toFixed(1);
}
