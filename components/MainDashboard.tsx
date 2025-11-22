"use client";

import React, { useState } from "react";
import { BenchmarksState } from "./BenchmarksPanel";

type Props = {
  benchmarks: BenchmarksState;
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

export default function MainDashboard({ benchmarks }: Props) {
  const [inputs, setInputs] = useState<FunnelInputs>({
    leads: 2000,
    mqls: 500,
    sqls: 200,
    opps: 80,
    proposals: 40,
    wins: 10,
    newArr: 500000,
    periodWeeks: 12,
  });

  const handleChange = (key: keyof FunnelInputs, value: string) => {
    const num = Number(value.replace(/[^0-9.]/g, ""));
    setInputs((prev) => ({
      ...prev,
      [key]: isNaN(num) ? 0 : num,
    }));
  };

  const {
    leads,
    mqls,
    sqls,
    opps,
    proposals,
    wins,
    newArr,
    periodWeeks,
  } = inputs;

  const rate = (num: number, den: number) =>
    den > 0 ? (num / den) * 100 : 0;

  const leadToMqlRate = rate(mqls, leads);
  const mqlToSqlRate = rate(sqls, mqls);
  const sqlToOppRate = rate(opps, sqls);
  const oppToProposalRate = rate(proposals, opps);
  const proposalToWinRate = rate(wins, proposals);

  const symbol = currencySymbol(benchmarks.currency);

  // ARR / throughput calcs
  const periodThroughput = newArr;
  const weeklyThroughput =
    periodWeeks > 0 ? periodThroughput / periodWeeks : 0;
  const annualRunRate = weeklyThroughput * 52;

  const arrGap = Math.max(benchmarks.arrTarget - annualRunRate, 0);

  // Bottleneck detection (compares actual rates vs benchmark targets)
  const stages = [
    {
      id: "leadToMql",
      label: "Lead → MQL",
      actual: leadToMqlRate,
      target: benchmarks.leadToMql,
    },
    {
      id: "mqlToSql",
      label: "MQL → SQL",
      actual: mqlToSqlRate,
      target: benchmarks.mqlToSql,
    },
    {
      id: "sqlToOpp",
      label: "SQL → Opp",
      actual: sqlToOppRate,
      target: benchmarks.sqlToOppSales,
    },
    {
      id: "oppToProposal",
      label: "Opp → Proposal",
      actual: oppToProposalRate,
      target: benchmarks.oppToProposal,
    },
    {
      id: "proposalToWin",
      label: "Proposal → Win",
      actual: proposalToWinRate,
      target: benchmarks.proposalToWin,
    },
  ];

  const stagesWithDelta = stages.map((s) => ({
    ...s,
    delta: s.actual - s.target,
  }));

  const bottleneck = stagesWithDelta.sort(
    (a, b) => a.delta - b.delta
  )[0];

  return (
    <section className="rounded-3xl bg-slate-900/80 p-6 shadow-xl ring-1 ring-slate-800">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">
            Throughput & ARR Dashboard
          </h2>
          <p className="text-xs text-slate-300">
            Enter a recent period of funnel performance to see conversion
            rates, ARR run rate, and the weakest stage versus your targets.
          </p>
        </div>
      </div>

      {/* 1. INPUTS */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <InputCard title="Funnel volumes (this period)">
          <NumberField
            label="Leads"
            value={leads}
            onChange={(v) => handleChange("leads", v)}
          />
          <NumberField
            label="MQLs"
            value={mqls}
            onChange={(v) => handleChange("mqls", v)}
          />
          <NumberField
            label="SQLs"
            value={sqls}
            onChange={(v) => handleChange("sqls", v)}
          />
          <NumberField
            label="Opportunities"
            value={opps}
            onChange={(v) => handleChange("opps", v)}
          />
          <NumberField
            label="Proposals"
            value={proposals}
            onChange={(v) => handleChange("proposals", v)}
          />
          <NumberField
            label="Wins"
            value={wins}
            onChange={(v) => handleChange("wins", v)}
          />
        </InputCard>

        <InputCard title="Revenue for this period">
          <NumberField
            label="New ARR closed"
            value={newArr}
            onChange={(v) => handleChange("newArr", v)}
            suffix={symbol}
          />
          <NumberField
            label="Period length"
            value={periodWeeks}
            onChange={(v) => handleChange("periodWeeks", v)}
            suffix="weeks"
          />
          <p className="mt-2 text-[11px] text-slate-400">
            For example, last quarter (13 weeks) or last 3 months (12
            weeks). The calculator uses this to annualise throughput.
          </p>
        </InputCard>

        {/* High-level ARR cards */}
        <MetricCard
          label="ARR run rate (based on this period)"
          value={`${symbol}${formatNumber(annualRunRate)}`}
          helper="Throughput annualised at current pace."
          tone={annualRunRate >= benchmarks.arrTarget ? "good" : "warn"}
        />
        <MetricCard
          label="Gap vs ARR target"
          value={
            arrGap <= 0
              ? "On or above target"
              : `${symbol}${formatNumber(arrGap)}`
          }
          helper={
            arrGap <= 0
              ? "Current run rate already meets this target."
              : "Additional ARR required at this run rate."
          }
          tone={arrGap <= 0 ? "good" : "bad"}
        />
      </div>

      {/* 2. CONVERSION RATES vs TARGETS */}
      <div className="mb-6 grid gap-4 md:grid-cols-5">
        <RateCard
          label="Lead → MQL"
          actual={leadToMqlRate}
          target={benchmarks.leadToMql}
        />
        <RateCard
          label="MQL → SQL"
          actual={mqlToSqlRate}
          target={benchmarks.mqlToSql}
        />
        <RateCard
          label="SQL → Opp"
          actual={sqlToOppRate}
          target={benchmarks.sqlToOppSales}
        />
        <RateCard
          label="Opp → Proposal"
          actual={oppToProposalRate}
          target={benchmarks.oppToProposal}
        />
        <RateCard
          label="Proposal → Win"
          actual={proposalToWinRate}
          target={benchmarks.proposalToWin}
        />
      </div>

      {/* 3. BOTTLENECK SUMMARY */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-950/70 p-4 ring-1 ring-slate-800">
          <h3 className="mb-2 text-sm font-semibold text-slate-100">
            Bottleneck diagnosis
          </h3>
          {bottleneck ? (
            <>
              <p className="text-sm text-slate-200">
                <span className="font-semibold">
                  {bottleneck.label}
                </span>{" "}
                is currently the weakest stage versus target.
              </p>
              <p className="mt-2 text-xs text-slate-300">
                Actual: {bottleneck.actual.toFixed(1)}%, Target:{" "}
                {bottleneck.target.toFixed(1)}%
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Improving this step will have an outsized impact on
                throughput. For example, if{" "}
                {bottleneck.label.toLowerCase()} moved closer to target,
                more opportunities would flow through to downstream stages
                without needing extra spend at the top of the funnel.
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-300">
              Enter some funnel numbers above to see where the biggest
              gap is versus benchmarks.
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-slate-950/70 p-4 ring-1 ring-slate-800">
          <h3 className="mb-2 text-sm font-semibold text-slate-100">
            Growth path suggestion
          </h3>
          <p className="text-xs text-slate-300">
            Use this dashboard in an EdgeTier-style review to compare last
            quarter or last year against current performance, then ask:
          </p>
          <ul className="mt-2 list-inside list-disc text-xs text-slate-300">
            <li>Which stage is most below target and why?</li>
            <li>What tests can we run to improve that conversion?</li>
            <li>
              How much incremental ARR could we unlock by closing half
              the gap?
            </li>
          </ul>
          <p className="mt-2 text-xs text-slate-400">
            That turns this from a static dashboard into a scenario
            planning tool: tweak inputs, see how ARR run rate and gaps
            respond, and prioritise initiatives accordingly.
          </p>
        </div>
      </div>
    </section>
  );
}

/* UI helpers */

type InputCardProps = {
  title: string;
  children: React.ReactNode;
};

function InputCard({ title, children }: InputCardProps) {
  return (
    <div className="rounded-2xl bg-slate-950/60 p-4 ring-1 ring-slate-800">
      <h3 className="mb-3 text-sm font-semibold text-slate-100">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

type NumberFieldProps = {
  label: string;
  value: number;
  suffix?: string;
  onChange: (val: string) => void;
};

function NumberField({ label, value, suffix, onChange }: NumberFieldProps) {
  return (
    <label className="block text-xs">
      <span className="mb-1 block text-slate-400">{label}</span>
      <div className="flex items-center rounded-xl bg-slate-900 px-3 py-1.5 ring-1 ring-slate-700 focus-within:ring-sky-500">
        <input
          className="flex-1 bg-transparent text-sm text-slate-50 outline-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {suffix && (
          <span className="ml-2 text-[11px] text-slate-400">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

type MetricTone = "neutral" | "good" | "warn" | "bad";

type MetricCardProps = {
  label: string;
  value: string;
  helper?: string;
  tone?: MetricTone;
};

function MetricCard({
  label,
  value,
  helper,
  tone = "neutral",
}: MetricCardProps) {
  const toneClasses =
    tone === "good"
      ? "ring-emerald-600/70"
      : tone === "bad"
      ? "ring-rose-600/70"
      : tone === "warn"
      ? "ring-amber-500/70"
      : "ring-slate-800";

  return (
    <div
      className={`rounded-2xl bg-slate-950/60 p-4 ring-1 ${toneClasses}`}
    >
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-50">{value}</p>
      {helper && (
        <p className="mt-1 text-[11px] text-slate-400">{helper}</p>
      )}
    </div>
  );
}

type RateCardProps = {
  label: string;
  actual: number;
  target: number;
};

function RateCard({ label, actual, target }: RateCardProps) {
  const delta = actual - target;
  const tone: MetricTone =
    delta >= 0 ? (delta > 5 ? "good" : "neutral") : "bad";

  const toneClasses =
    tone === "good"
      ? "ring-emerald-600/70"
      : tone === "bad"
      ? "ring-rose-600/70"
      : "ring-slate-800";

  return (
    <div
      className={`rounded-2xl bg-slate-950/60 p-4 ring-1 ${toneClasses}`}
    >
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-50">
        {actual.toFixed(1)}%
      </p>
      <p className="mt-1 text-[11px] text-slate-400">
        Target {target.toFixed(1)}% (
        {delta >= 0 ? "+" : ""}
        {delta.toFixed(1)} pts)
      </p>
    </div>
  );
}

/* utils */

function currencySymbol(currency: BenchmarksState["currency"]): string {
  switch (currency) {
    case "EUR":
      return "€";
    case "USD":
      return "$";
    case "GBP":
      return "£";
    default:
      return "";
  }
}

function formatNumber(n: number): string {
  return n.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  });
}
