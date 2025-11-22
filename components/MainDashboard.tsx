"use client";

import { Benchmarks } from "./BenchmarksPanel";

export type PeriodPreset =
  | "last_month"
  | "last_quarter"
  | "last_year"
  | "custom";

export type Actuals = {
  leads: number;
  mqls: number;
  sqls: number;
  opps: number;
  proposals: number;
  wins: number;
  newArr: number;
  periodWeeks: number;
  preset: PeriodPreset;
  includeCustomerSuccess: boolean;
};

type Props = {
  benchmarks: Benchmarks;
  actuals: Actuals;
  onActualsChange: (a: Actuals) => void;
};

export default function MainDashboard({
  benchmarks,
  actuals,
  onActualsChange,
}: Props) {
  const {
    leads,
    mqls,
    sqls,
    opps,
    proposals,
    wins,
    newArr,
    periodWeeks,
    includeCustomerSuccess,
    preset,
  } = actuals;

  // --- Derived metrics ---
  const safePeriodWeeks = periodWeeks > 0 ? periodWeeks : 1;

  const leadToMqlActual = pct(mqls, leads);
  const mqlToSqlActual = pct(sqls, mqls);
  const sqlToOppActual = pct(opps, sqls);
  const oppToProposalActual = pct(proposals, opps);
  const proposalToWinActual = pct(wins, proposals);

  const weeklyArr = newArr / safePeriodWeeks;
  const annualisedArrRunRate = weeklyArr * 52;

  const timeframeWeeks = benchmarks.revenue.timeframeWeeks || 1;
  const projectedNewArrInTimeframe = weeklyArr * timeframeWeeks;
  const projectedArr = benchmarks.revenue.currentArr + projectedNewArrInTimeframe;

  const arrGap = benchmarks.revenue.arrTarget - projectedArr;
  const neededNewArrTotal =
    benchmarks.revenue.arrTarget - benchmarks.revenue.currentArr;
  const neededNewArrPerWeek =
    neededNewArrTotal > 0 ? neededNewArrTotal / timeframeWeeks : 0;
  const neededNewArrPerMonth = neededNewArrPerWeek * 4; // 4-week month

  // Bottleneck: compare actual vs target conversion
  const stages = [
    {
      key: "Lead → MQL",
      actual: leadToMqlActual,
      target: benchmarks.marketing.leadToMql,
    },
    {
      key: "MQL → SQL",
      actual: mqlToSqlActual,
      target: benchmarks.marketing.mqlToSql,
    },
    {
      key: "SQL → Opp",
      actual: sqlToOppActual,
      target: benchmarks.marketing.sqlToOpp,
    },
    {
      key: "Opp → Proposal",
      actual: oppToProposalActual,
      target: benchmarks.sales.oppToProposal,
    },
    {
      key: "Proposal → Win",
      actual: proposalToWinActual,
      target: benchmarks.sales.proposalToWin,
    },
  ];

  let bottleneck = null as null | (typeof stages)[number];
  let maxGap = 0;

  stages.forEach((s) => {
    const gap = s.target - s.actual;
    if (gap > maxGap) {
      maxGap = gap;
      bottleneck = s;
    }
  });

  const growthNarrative = buildGrowthNarrative({
    projectedArr,
    arrGap,
    annualisedArrRunRate,
    neededNewArrPerMonth,
    bottleneck,
    includeCustomerSuccess,
    benchmarks,
  });

  const handleActualChange = (field: keyof Actuals, value: string | boolean) => {
    const updated: Actuals = { ...actuals };

    if (field === "includeCustomerSuccess") {
      updated.includeCustomerSuccess = Boolean(value);
    } else if (field === "preset") {
      const presetValue = value as PeriodPreset;
      updated.preset = presetValue;

      if (presetValue === "last_month") {
        updated.periodWeeks = 4;
      } else if (presetValue === "last_quarter") {
        updated.periodWeeks = 13;
      } else if (presetValue === "last_year") {
        updated.periodWeeks = 52;
      }
      // custom → leave periodWeeks as user-entered
    } else {
      // numeric fields
      const num = Number(value) || 0;

      switch (field) {
        case "leads":
          updated.leads = num;
          break;
        case "mqls":
          updated.mqls = num;
          break;
        case "sqls":
          updated.sqls = num;
          break;
        case "opps":
          updated.opps = num;
          break;
        case "proposals":
          updated.proposals = num;
          break;
        case "wins":
          updated.wins = num;
          break;
        case "newArr":
          updated.newArr = num;
          break;
        case "periodWeeks":
          updated.periodWeeks = num;
          break;
      }
    }

    onActualsChange(updated);
  };

  return (
    <section className="space-y-6">
      {/* Actuals Input Panel */}
      <section className="border border-slate-800 rounded-2xl bg-slate-900/70 shadow-lg p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              Funnel Performance (This Period)
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Plug in real funnel performance for a recent period (minimum one
              month). The dashboard will compute run rate, ARR projections, and
              the weakest stage versus your benchmarks.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-300 space-y-1">
              <span>Period</span>
              <select
                className="block w-full rounded-lg bg-slate-900 border border-slate-700 px-2 py-1.5 text-xs text-slate-50 focus:outline-none focus:ring-1 focus:ring-sky-500"
                value={preset}
                onChange={(e) => handleActualChange("preset", e.target.value)}
              >
                <option value="last_month">Last month (~4 weeks)</option>
                <option value="last_quarter">Last quarter (~13 weeks)</option>
                <option value="last_year">Last year (52 weeks)</option>
                <option value="custom">Custom</option>
              </select>
            </label>
            <NumberFieldSmall
              label="Period length (weeks)"
              value={periodWeeks}
              onChange={(v) => handleActualChange("periodWeeks", v)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <NumberFieldSmall
            label="Leads"
            value={leads}
            onChange={(v) => handleActualChange("leads", v)}
          />
          <NumberFieldSmall
            label="MQLs"
            value={mqls}
            onChange={(v) => handleActualChange("mqls", v)}
          />
          <NumberFieldSmall
            label="SQLs"
            value={sqls}
            onChange={(v) => handleActualChange("sqls", v)}
          />
          <NumberFieldSmall
            label="Opps"
            value={opps}
            onChange={(v) => handleActualChange("opps", v)}
          />
          <NumberFieldSmall
            label="Proposals"
            value={proposals}
            onChange={(v) => handleActualChange("proposals", v)}
          />
          <NumberFieldSmall
            label="Wins"
            value={wins}
            onChange={(v) => handleActualChange("wins", v)}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md">
            <NumberFieldSmall
              label="New ARR in this period (€)"
              value={newArr}
              onChange={(v) => handleActualChange("newArr", v)}
            />
            <label className="flex items-center gap-2 text-xs text-slate-300 mt-1 md:mt-0">
              <input
                type="checkbox"
                className="rounded border-slate-600 bg-slate-900"
                checked={includeCustomerSuccess}
                onChange={(e) =>
                  handleActualChange(
                    "includeCustomerSuccess",
                    e.target.checked
                  )
                }
              />
              <span>
                Include Customer Success metrics (NRR, churn, expansion)
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* Top KPI Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="ARR Run Rate (annualised)"
          value={annualisedArrRunRate}
          format="currency"
        />
        <MetricCard
          label="Projected ARR in timeframe"
          value={projectedArr}
          format="currency"
        />
        <MetricCard
          label="Gap vs ARR target"
          value={arrGap}
          format="currency"
          highlight={arrGap > 0 ? "negative" : "positive"}
        />
        <MetricCard
          label="Needed new ARR / month"
          value={neededNewArrPerMonth}
          format="currency"
          helper="4-week month assumption"
        />
      </section>

      {/* Conversion vs Benchmark */}
      <section className="border border-slate-800 rounded-2xl bg-slate-900/70 shadow-lg p-4 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
          Funnel Conversion vs Targets
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <ConversionCard
            label="Lead → MQL"
            actual={leadToMqlActual}
            target={benchmarks.marketing.leadToMql}
          />
          <ConversionCard
            label="MQL → SQL"
            actual={mqlToSqlActual}
            target={benchmarks.marketing.mqlToSql}
          />
          <ConversionCard
            label="SQL → Opp"
            actual={sqlToOppActual}
            target={benchmarks.marketing.sqlToOpp}
          />
          <ConversionCard
            label="Opp → Proposal"
            actual={oppToProposalActual}
            target={benchmarks.sales.oppToProposal}
          />
          <ConversionCard
            label="Proposal → Win"
            actual={proposalToWinActual}
            target={benchmarks.sales.proposalToWin}
          />
        </div>
      </section>

      {/* Bottleneck + Narrative */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="border border-slate-800 rounded-2xl bg-slate-900/70 shadow-lg p-4 space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
            Bottleneck Diagnosis
          </h3>
          {bottleneck ? (
            <>
              <p className="text-sm text-slate-50">
                <span className="font-semibold">{bottleneck.key}</span> is
                currently the weakest stage versus target.
              </p>
              <p className="text-xs text-slate-300">
                Actual:{" "}
                <span className="font-semibold">
                  {bottleneck.actual.toFixed(1)}%
                </span>{" "}
                &nbsp; Target:{" "}
                <span className="font-semibold">
                  {bottleneck.target.toFixed(1)}%
                </span>
                . Improving this step will push more volume into downstream
                stages without extra spend at the very top of the funnel.
              </p>
            </>
          ) : (
            <p className="text-xs text-slate-300">
              Add some funnel data and benchmarks to identify the weakest stage.
            </p>
          )}
        </div>

        <div className="border border-slate-800 rounded-2xl bg-slate-900/70 shadow-lg p-4 space-y-2 lg:col-span-2">
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
            Growth Path & Talking Points
          </h3>
          <p className="text-xs text-slate-200 whitespace-pre-line">
            {growthNarrative}
          </p>
        </div>
      </section>
    </section>
  );
}

// ---------- helpers / subcomponents ----------

type MetricCardProps = {
  label: string;
  value: number;
  format?: "currency" | "percent" | "number";
  highlight?: "positive" | "negative";
  helper?: string;
};

function MetricCard({
  label,
  value,
  format = "currency",
  highlight,
  helper,
}: MetricCardProps) {
  const formatted =
    format === "currency"
      ? formatCurrency(value)
      : format === "percent"
      ? `${value.toFixed(1)}%`
      : Math.round(value).toLocaleString();

  const colour =
    highlight === "positive"
      ? "text-emerald-400"
      : highlight === "negative"
      ? "text-rose-400"
      : "text-slate-50";

  return (
    <div className="border border-slate-800 rounded-2xl bg-slate-900/80 px-3 py-3 flex flex-col justify-between">
      <span className="text-[0.68rem] uppercase tracking-[0.2em] text-slate-400">
        {label}
      </span>
      <span className={`mt-1 text-lg font-semibold ${colour}`}>{formatted}</span>
      {helper && (
        <span className="mt-1 text-[0.7rem] text-slate-400">{helper}</span>
      )}
    </div>
  );
}

type ConversionCardProps = {
  label: string;
  actual: number;
  target: number;
};

function ConversionCard({ label, actual, target }: ConversionCardProps) {
  const diff = actual - target;
  const colour =
    diff >= 0 ? "text-emerald-400" : "text-amber-300";

  return (
    <div className="border border-slate-800 rounded-2xl bg-slate-900/80 px-3 py-3">
      <div className="text-[0.68rem] uppercase tracking-[0.18em] text-slate-400 mb-1">
        {label}
      </div>
      <div className="text-sm text-slate-200">
        <span className="font-semibold">{actual.toFixed(1)}%</span>{" "}
        <span className="text-[0.7rem] text-slate-400">actual</span>
      </div>
      <div className="text-xs text-slate-300">
        Target: <span className="font-semibold">{target.toFixed(1)}%</span>
      </div>
      <div className={`mt-1 text-[0.7rem] ${colour}`}>
        {diff >= 0
          ? `+${diff.toFixed(1)} pts vs target`
          : `${diff.toFixed(1)} pts vs target`}
      </div>
    </div>
  );
}

type NumberFieldSmallProps = {
  label: string;
  value: number;
  onChange: (val: string) => void;
};

function NumberFieldSmall({ label, value, onChange }: NumberFieldSmallProps) {
  return (
    <label className="block text-xs text-slate-300 space-y-1">
      <span>{label}</span>
      <input
        type="number"
        className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2 py-1.5 text-xs text-slate-50 focus:outline-none focus:ring-1 focus:ring-sky-500"
        value={Number.isNaN(value) ? "" : value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function pct(part: number, whole: number): number {
  if (!whole || whole <= 0) return 0;
  return (part / whole) * 100;
}

function formatCurrency(val: number): string {
  const sign = val < 0 ? "-" : "";
  const abs = Math.abs(val);
  return `${sign}€${abs.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`;
}

function buildGrowthNarrative(args: {
  projectedArr: number;
  arrGap: number;
  annualisedArrRunRate: number;
  neededNewArrPerMonth: number;
  bottleneck: null | { key: string; actual: number; target: number };
  includeCustomerSuccess: boolean;
  benchmarks: Benchmarks;
}): string {
  const {
    projectedArr,
    arrGap,
    annualisedArrRunRate,
    neededNewArrPerMonth,
    bottleneck,
    includeCustomerSuccess,
    benchmarks,
  } = args;

  const lines: string[] = [];

  lines.push(
    `Based on recent performance, your ARR run rate is approximately €${Math.round(
      annualisedArrRunRate
    ).toLocaleString()}, projecting to around €${Math.round(
      projectedArr
    ).toLocaleString()} by the end of the selected timeframe.`
  );

  if (arrGap > 0) {
    lines.push(
      `There is a remaining gap of about €${Math.round(
        arrGap
      ).toLocaleString()} versus your ARR target, which translates into roughly €${Math.round(
        neededNewArrPerMonth
      ).toLocaleString()} in new ARR per month (assuming a 4-week month).`
    );
  } else {
    lines.push(
      `On current trajectory you are on track to meet or slightly exceed your ARR target in this timeframe.`
    );
  }

  if (bottleneck) {
    lines.push(
      `The most important lever right now is ${bottleneck.key}, where actual conversion is ${bottleneck.actual.toFixed(
        1
      )}% versus a target of ${bottleneck.target.toFixed(
        1
      )}%. Prioritise experiments, enablement, and playbooks here before adding significant spend at the top of the funnel.`
    );
  } else {
    lines.push(
      `Once you have a few weeks of consistent funnel data, this view will highlight the single weakest conversion step to focus experimentation and enablement on.`
    );
  }

  if (includeCustomerSuccess) {
    lines.push(
      `Downstream, Customer Success remains a powerful multiplier. With an NRR target of ${
        benchmarks.cs.nrr
      }% and gross margin of ${benchmarks.cs.grossMargin}%, improving retention and expansion for existing customers can close part of the ARR gap without relying only on new logo acquisition.`
    );
  } else {
    lines.push(
      `This view currently ignores churn and expansion. In a full system view, NRR and margin from existing customers are often as important as new logo acquisition for hitting ambitious ARR targets.`
    );
  }

  return lines.join("\n\n");
}
