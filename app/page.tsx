"use client";

import React, { useMemo, useState } from "react";

type FunnelInputs = {
  periodLabel: string;
  monthsInPeriod: number;
  visitors: number;
  leads: number;
  sqls: number;
  opps: number;
  wins: number;
  asp: number;
};

type ConversionRates = {
  visitToLead: number;
  leadToSql: number;
  sqlToOpp: number;
  oppToWin: number;
};

const BENCHMARKS: ConversionRates = {
  visitToLead: 2.5, // %
  leadToSql: 30,
  sqlToOpp: 60,
  oppToWin: 25
};

function safeRate(numerator: number, denominator: number): number {
  if (!denominator || denominator === 0) return 0;
  return (numerator / denominator) * 100;
}

function formatCurrency(value: number): string {
  if (!isFinite(value)) return "€0";
  return "€" + value.toLocaleString("en-IE", { maximumFractionDigits: 0 });
}

function formatPercent(value: number): string {
  if (!isFinite(value)) return "0%";
  return value.toFixed(1).replace(/\.0$/, "") + "%";
}

function diffVsBenchmark(value: number, benchmark: number): number {
  if (benchmark === 0) return 0;
  return ((value - benchmark) / benchmark) * 100;
}

export default function Page() {
  const [inputs, setInputs] = useState<FunnelInputs>({
    periodLabel: "Last 12 months",
    monthsInPeriod: 12,
    visitors: 100_000,
    leads: 2_000,
    sqls: 600,
    opps: 250,
    wins: 50,
    asp: 20_000
  });

  const [targetArr, setTargetArr] = useState(2_000_000); // simple target
  const [trafficChangePct, setTrafficChangePct] = useState(0); // -50 to +200
  const [conversionUpliftPct, setConversionUpliftPct] = useState(0); // -20 to +50

  const conversions = useMemo<ConversionRates>(() => {
    return {
      visitToLead: safeRate(inputs.leads, inputs.visitors),
      leadToSql: safeRate(inputs.sqls, inputs.leads),
      sqlToOpp: safeRate(inputs.opps, inputs.sqls),
      oppToWin: safeRate(inputs.wins, inputs.opps)
    };
  }, [inputs]);

  const periodNewArr = useMemo(() => inputs.wins * inputs.asp, [inputs]);
  const runRateArr = useMemo(() => {
    if (!inputs.monthsInPeriod) return 0;
    return (periodNewArr / inputs.monthsInPeriod) * 12;
  }, [periodNewArr, inputs.monthsInPeriod]);

  const scenario = useMemo(() => {
    const trafficFactor = 1 + trafficChangePct / 100;
    const convFactor = 1 + conversionUpliftPct / 100;

    const visitors = inputs.visitors * trafficFactor;

    const visitToLead = conversions.visitToLead / 100 * convFactor;
    const leadToSql = conversions.leadToSql / 100 * convFactor;
    const sqlToOpp = conversions.sqlToOpp / 100 * convFactor;
    const oppToWin = conversions.oppToWin / 100 * convFactor;

    const leads = visitors * visitToLead;
    const sqls = leads * leadToSql;
    const opps = sqls * sqlToOpp;
    const wins = opps * oppToWin;

    const scenarioNewArr = wins * inputs.asp;
    const scenarioRunRateArr = inputs.monthsInPeriod
      ? (scenarioNewArr / inputs.monthsInPeriod) * 12
      : 0;

    return {
      visitors,
      leads,
      sqls,
      opps,
      wins,
      scenarioNewArr,
      scenarioRunRateArr
    };
  }, [
    conversions.visitToLead,
    conversions.leadToSql,
    conversions.sqlToOpp,
    conversions.oppToWin,
    trafficChangePct,
    conversionUpliftPct,
    inputs.visitors,
    inputs.asp,
    inputs.monthsInPeriod
  ]);

  const bottleneck = useMemo(() => {
    type StageKey = "visitToLead" | "leadToSql" | "sqlToOpp" | "oppToWin";

    const entries: { key: StageKey; label: string; value: number }[] = [
      { key: "visitToLead", label: "Visit → Lead", value: conversions.visitToLead },
      { key: "leadToSql", label: "Lead → SQL", value: conversions.leadToSql },
      { key: "sqlToOpp", label: "SQL → Opp", value: conversions.sqlToOpp },
      { key: "oppToWin", label: "Opp → Win", value: conversions.oppToWin }
    ];

    let worst = entries[0];
    let worstDelta = diffVsBenchmark(worst.value, BENCHMARKS[worst.key]);

    for (const entry of entries.slice(1)) {
      const delta = diffVsBenchmark(entry.value, BENCHMARKS[entry.key]);
      if (delta < worstDelta) {
        worst = entry;
        worstDelta = delta;
      }
    }

    return {
      stage: worst.label,
      current: worst.value,
      benchmark: BENCHMARKS[worst.key],
      delta: worstDelta
    };
  }, [conversions]);

  const gapToTarget = useMemo(() => {
    const gap = targetArr - runRateArr;
    return {
      gap,
      coveredByScenario: scenario.scenarioRunRateArr - runRateArr,
      scenarioRunRateArr: scenario.scenarioRunRateArr
    };
  }, [targetArr, runRateArr, scenario.scenarioRunRateArr]);

  function updateField<K extends keyof FunnelInputs>(
    field: K,
    value: number | string
  ) {
    setInputs(prev => ({
      ...prev,
      [field]:
        field === "periodLabel"
          ? String(value)
          : Number(value) || 0
    }));
  }

  return (
    <div className="min-h-screen px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl space-y-6 md:space-y-8">
        {/* Header */}
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="badge mb-2">SaaS Throughput Lab</div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-50">
              Funnel throughput and ARR scenario planner
            </h1>
            <p className="mt-2 text-sm text-slate-400 max-w-2xl">
              Input recent funnel performance, see your run-rate ARR, then model
              how traffic and conversion changes move you toward your ARR target.
            </p>
          </div>
          <div className="card md:w-64">
            <div className="card-title">ARR target</div>
            <label className="label">
              <span>Target ARR (run rate)</span>
            </label>
            <input
              type="number"
              value={targetArr}
              onChange={e => setTargetArr(Number(e.target.value) || 0)}
              min={0}
            />
            <p className="metric-label mt-2">
              Current run rate: <span className="font-semibold">{formatCurrency(runRateArr)}</span>
            </p>
          </div>
        </header>

        {/* Top row: inputs + key metrics */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Baseline inputs */}
          <section className="card md:col-span-2 space-y-4">
            <div>
              <h2 className="card-title">1. Baseline funnel</h2>
              <p className="card-subtitle">
                Use your last quarter or last 12 months as the baseline. You can
                refine these later for specific segments or channels.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="label">
                  <span>Period label</span>
                </label>
                <input
                  type="text"
                  value={inputs.periodLabel}
                  onChange={e => updateField("periodLabel", e.target.value)}
                />
              </div>
              <div>
                <label className="label">
                  <span>Months in period</span>
                  <span>Used for run-rate ARR</span>
                </label>
                <input
                  type="number"
                  value={inputs.monthsInPeriod}
                  min={1}
                  onChange={e => updateField("monthsInPeriod", e.target.value)}
                />
              </div>
              <div>
                <label className="label">
                  <span>Average selling price (ASP)</span>
                </label>
                <input
                  type="number"
                  value={inputs.asp}
                  min={0}
                  onChange={e => updateField("asp", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="label">
                  <span>Website visitors</span>
                </label>
                <input
                  type="number"
                  value={inputs.visitors}
                  min={0}
                  onChange={e => updateField("visitors", e.target.value)}
                />
              </div>
              <div>
                <label className="label">
                  <span>Leads</span>
                </label>
                <input
                  type="number"
                  value={inputs.leads}
                  min={0}
                  onChange={e => updateField("leads", e.target.value)}
                />
              </div>
              <div>
                <label className="label">
                  <span>SQLs</span>
                </label>
                <input
                  type="number"
                  value={inputs.sqls}
                  min={0}
                  onChange={e => updateField("sqls", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="label">
                  <span>Opportunities</span>
                </label>
                <input
                  type="number"
                  value={inputs.opps}
                  min={0}
                  onChange={e => updateField("opps", e.target.value)}
                />
              </div>
              <div>
                <label className="label">
                  <span>Wins</span>
                </label>
                <input
                  type="number"
                  value={inputs.wins}
                  min={0}
                  onChange={e => updateField("wins", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Key metrics */}
          <section className="card space-y-4">
            <div>
              <h2 className="card-title">Baseline output</h2>
              <p className="card-subtitle">
                How your current funnel is performing at this run rate.
              </p>
            </div>

            <div>
              <div className="label">
                <span>New ARR in {inputs.periodLabel}</span>
              </div>
              <div className="metric-big">{formatCurrency(periodNewArr)}</div>
              <div className="metric-label">Wins × ASP in period</div>
            </div>

            <div>
              <div className="label">
                <span>ARR run rate</span>
              </div>
              <div className="metric-big">{formatCurrency(runRateArr)}</div>
              <div className="metric-label">
                If you repeat this period&apos;s performance for 12 months
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 space-y-1">
              <p className="text-xs text-slate-300">
                Gap to target:{" "}
                <span className="font-semibold">
                  {gapToTarget.gap >= 0
                    ? formatCurrency(gapToTarget.gap)
                    : "-" + formatCurrency(Math.abs(gapToTarget.gap))}
                </span>
              </p>
              <p className="text-xs text-slate-400">
                Scenario run rate:{" "}
                <span className="font-semibold">
                  {formatCurrency(gapToTarget.scenarioRunRateArr)}
                </span>
              </p>
            </div>
          </section>
        </div>

        {/* Conversion table + bottleneck + scenario controls */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Conversion rates and benchmarks */}
          <section className="card lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="card-title">2. Conversion rates vs benchmarks</h2>
                <p className="card-subtitle">
                  Quick view of where throughput drops across the funnel.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-left border-separate border-spacing-y-1">
                <thead>
                  <tr className="text-[11px] text-slate-400">
                    <th className="py-1 pr-4 font-medium">Stage</th>
                    <th className="py-1 px-4 font-medium">Current</th>
                    <th className="py-1 px-4 font-medium">Benchmark</th>
                    <th className="py-1 px-4 font-medium">% vs benchmark</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      key: "visitToLead" as const,
                      label: "Visit → Lead",
                      value: conversions.visitToLead
                    },
                    {
                      key: "leadToSql" as const,
                      label: "Lead → SQL",
                      value: conversions.leadToSql
                    },
                    {
                      key: "sqlToOpp" as const,
                      label: "SQL → Opp",
                      value: conversions.sqlToOpp
                    },
                    {
                      key: "oppToWin" as const,
                      label: "Opp → Win",
                      value: conversions.oppToWin
                    }
                  ].map(row => {
                    const benchmark = BENCHMARKS[row.key];
                    const delta = diffVsBenchmark(row.value, benchmark);
                    const isNegative = delta < 0;
                    return (
                      <tr key={row.key} className="bg-slate-900/60">
                        <td className="py-2 pr-4 text-slate-100">{row.label}</td>
                        <td className="py-2 px-4 text-slate-100">
                          {formatPercent(row.value)}
                        </td>
                        <td className="py-2 px-4 text-slate-300">
                          {formatPercent(benchmark)}
                        </td>
                        <td
                          className={`py-2 px-4 font-medium ${
                            isNegative ? "text-rose-400" : "text-emerald-400"
                          }`}
                        >
                          {delta >= 0 ? "+" : ""}
                          {delta.toFixed(1).replace(/\.0$/, "")}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Bottleneck card */}
          <section className="card space-y-4">
            <div>
              <h2 className="card-title">3. Biggest bottleneck</h2>
              <p className="card-subtitle">
                Stage with the largest drop vs benchmark.
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-1">Key stage</p>
              <p className="text-sm font-semibold text-slate-50">
                {bottleneck.stage}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-slate-400 mb-1">Current rate</p>
                <p className="text-slate-50 font-semibold">
                  {formatPercent(bottleneck.current)}
                </p>
              </div>
              <div>
                <p className="text-slate-400 mb-1">Benchmark</p>
                <p className="text-slate-50 font-semibold">
                  {formatPercent(bottleneck.benchmark)}
                </p>
              </div>
              <div>
                <p className="text-slate-400 mb-1">% vs benchmark</p>
                <p
                  className={`font-semibold ${
                    bottleneck.delta < 0 ? "text-rose-400" : "text-emerald-400"
                  }`}
                >
                  {bottleneck.delta >= 0 ? "+" : ""}
                  {bottleneck.delta.toFixed(1).replace(/\.0$/, "")}%
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 border-t border-slate-800 pt-3">
              If you only improved one thing, closing the gap at this stage
              would have the biggest impact on throughput and ARR.
            </p>
          </section>
        </div>

        {/* Scenario levers + growth path */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Scenario levers */}
          <section className="card space-y-4 lg:col-span-2">
            <div>
              <h2 className="card-title">4. Scenario planner</h2>
              <p className="card-subtitle">
                Adjust traffic and conversion to see how quickly you can close
                the gap to your ARR target.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="label">
                  <span>Traffic change</span>
                  <span>
                    {trafficChangePct >= 0 ? "+" : ""}
                    {trafficChangePct}%
                  </span>
                </label>
                <input
                  type="range"
                  min={-50}
                  max={200}
                  value={trafficChangePct}
                  onChange={e => setTrafficChangePct(Number(e.target.value))}
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Models growth in qualified traffic from all acquisition
                  channels.
                </p>
              </div>

              <div>
                <label className="label">
                  <span>Conversion uplift</span>
                  <span>
                    {conversionUpliftPct >= 0 ? "+" : ""}
                    {conversionUpliftPct}%
                  </span>
                </label>
                <input
                  type="range"
                  min={-20}
                  max={50}
                  value={conversionUpliftPct}
                  onChange={e =>
                    setConversionUpliftPct(Number(e.target.value))
                  }
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Applies across all funnel stages. In practice this would be
                  achieved with better targeting, messaging, and sales plays.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 mt-2">
              <div>
                <p className="label">
                  <span>Scenario wins</span>
                </p>
                <div className="metric-big">
                  {Math.round(scenario.wins).toLocaleString("en-IE")}
                </div>
                <p className="metric-label">Expected closed-won deals</p>
              </div>
              <div>
                <p className="label">
                  <span>Scenario new ARR</span>
                </p>
                <div className="metric-big">
                  {formatCurrency(scenario.scenarioNewArr)}
                </div>
                <p className="metric-label">
                  For {inputs.periodLabel.toLowerCase()}
                </p>
              </div>
              <div>
                <p className="label">
                  <span>Scenario ARR run rate</span>
                </p>
                <div className="metric-big">
                  {formatCurrency(scenario.scenarioRunRateArr)}
                </div>
                <p className="metric-label">
                  {gapToTarget.scenarioRunRateArr >= targetArr
                    ? "You reach or exceed your target in this scenario."
                    : "You still have a gap to the target in this scenario."}
                </p>
              </div>
            </div>
          </section>

          {/* Growth path copy block */}
          <section className="card space-y-3">
            <div>
              <h2 className="card-title">5. Growth path summary</h2>
            </div>

            <p className="text-xs text-slate-300">
              With your current inputs, your run-rate ARR is{" "}
              <span className="font-semibold">
                {formatCurrency(runRateArr)}
              </span>{" "}
              and your target is{" "}
              <span className="font-semibold">
                {formatCurrency(targetArr)}
              </span>
              .
            </p>

            <p className="text-xs text-slate-300">
              The scenario above models{" "}
              <span className="font-semibold">
                {trafficChangePct >= 0 ? "+" : ""}
                {trafficChangePct}% traffic change
              </span>{" "}
              and{" "}
              <span className="font-semibold">
                {conversionUpliftPct >= 0 ? "+" : ""}
                {conversionUpliftPct}% conversion improvement
              </span>{" "}
              across the funnel, leading to an estimated run-rate of{" "}
              <span className="font-semibold">
                {formatCurrency(scenario.scenarioRunRateArr)}
              </span>
              .
            </p>

            <p className="text-xs text-slate-300">
              In a real GTM plan, you can translate this into concrete plays:
              improving the bottleneck stage through better qualification and
              sales enablement, while layering predictable traffic growth from
              paid, content, and partner channels.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
