"use client";

import React from "react";

export type Currency = "EUR" | "USD" | "GBP";

export interface Benchmarks {
  marketing: {
    leadsTarget: number;
    leadToMql: number;
    mqlToSql: number;
    sqlToOpp: number;
  };
  sales: {
    oppToProposal: number;
    proposalToWin: number;
    acvTarget: number;
  };
  cs: {
    monthlyChurn: number;
    expansion: number;
    nrr: number;
    grossMargin: number;
  };
  arr: {
    currentArr: number;
    targetArr: number;
    timeframeWeeks: number;
    blendedCacTarget: number;
    currency: Currency;
  };
}

interface BenchmarksPanelProps {
  benchmarks: Benchmarks;
  onChange: (b: Benchmarks) => void;
  onRunAnalysis: () => void;
}

export const BenchmarksPanel: React.FC<BenchmarksPanelProps> = ({
  benchmarks,
  onChange,
  onRunAnalysis,
}) => {
  const currencySymbol =
    benchmarks.arr.currency === "EUR"
      ? "€"
      : benchmarks.arr.currency === "USD"
      ? "$"
      : "£";

  const handleFieldChange = (
    section: keyof Benchmarks,
    field: string,
    value: number | string
  ) => {
    onChange({
      ...benchmarks,
      [section]: {
        ...(benchmarks as any)[section],
        [field]: value,
      },
    });
  };

  const handleCurrencyChange = (currency: Currency) => {
    onChange({
      ...benchmarks,
      arr: {
        ...benchmarks.arr,
        currency,
      },
    });
  };

  const inputBase =
    "w-full rounded-xl bg-slate-900/60 border border-slate-700 px-4 py-3 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500";

  const labelBase = "text-xs text-slate-400 mb-1 block";

  const cardBase =
    "bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3";

  const pillButton = (active: boolean) =>
    `px-3 py-1 text-xs rounded-full border ${
      active
        ? "bg-sky-500 text-white border-sky-500"
        : "border-slate-600 text-slate-300 hover:bg-slate-800"
    }`;

  return (
    <section className="bg-slate-950/40 border border-slate-800 rounded-3xl p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Benchmarks</h2>
          <p className="text-xs text-slate-400 mt-1">
            These benchmarks drive diagnostic colour-coding and run-rate comparisons across the dashboard.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 mr-4">
            <span>Display currency:</span>
            <div className="inline-flex rounded-full bg-slate-900/80 border border-slate-700 p-1">
              {(["EUR", "USD", "GBP"] as Currency[]).map((cur) => (
                <button
                  key={cur}
                  type="button"
                  onClick={() => handleCurrencyChange(cur)}
                  className={pillButton(benchmarks.arr.currency === cur)}
                >
                  {cur}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onRunAnalysis}
            className="inline-flex items-center gap-2 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-xs font-medium px-4 py-2 transition"
          >
            Run analysis
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 mt-2">
        {/* Marketing */}
        <div className={cardBase}>
          <h3 className="text-sm font-semibold text-slate-100">Marketing</h3>

          <div>
            <label className={labelBase}>Lead volume target (per period)</label>
            <div className="relative">
              <input
                type="number"
                className={inputBase}
                value={benchmarks.marketing.leadsTarget}
                onChange={(e) =>
                  handleFieldChange(
                    "marketing",
                    "leadsTarget",
                    Number(e.target.value || 0)
                  )
                }
              />
            </div>
          </div>

          <div>
            <label className={labelBase}>Lead → MQL target</label>
            <div className="relative">
              <input
                type="number"
                className={inputBase}
                value={benchmarks.marketing.leadToMql}
                onChange={(e) =>
                  handleFieldChange(
                    "marketing",
                    "leadToMql",
                    Number(e.target.value || 0)
                  )
                }
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                %
              </span>
            </div>
          </div>

          <div>
            <label className={labelBase}>MQL → SQL target</label>
            <div className="relative">
              <input
                type="number"
                className={inputBase}
                value={benchmarks.marketing.mqlToSql}
                onChange={(e) =>
                  handleFieldChange(
                    "marketing",
                    "mqlToSql",
                    Number(e.target.value || 0)
                  )
                }
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                %
              </span>
            </div>
          </div>

          <div>
            <label className={labelBase}>SQL → Opp target</label>
            <div className="relative">
              <input
                type="number"
                className={inputBase}
                value={benchmarks.marketing.sqlToOpp}
                onChange={(e) =>
                  handleFieldChange(
                    "marketing",
                    "sqlToOpp",
                    Number(e.target.value || 0)
                  )
                }
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                %
              </span>
            </div>
          </div>
        </div>

        {/* Sales */}
        <div className={cardBase}>
          <h3 className="text-sm font-semibold text-slate-100">Sales</h3>

          <div>
            <label className={labelBase}>Opp → Proposal target</label>
            <div className="relative">
              <input
                type="number"
                className={inputBase}
                value={benchmarks.sales.oppToProposal}
                onChange={(e) =>
                  handleFieldChange(
                    "sales",
                    "oppToProposal",
                    Number(e.target.value || 0)
                  )
                }
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                %
              </span>
            </div>
          </div>

          <div>
            <label className={labelBase}>Proposal → Win target</label>
            <div className="relative">
              <input
                type="number"
                className={inputBase}
                value={benchmarks.sales.proposalToWin}
                onChange={(e) =>
                  handleFieldChange(
                    "sales",
                    "proposalToWin",
                    Number(e.target.value || 0)
                  )
                }
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                %
              </span>
            </div>
          </div>

          <div>
            <label className={labelBase}>ACV target</label>
            <div className="relative">
              <input
                type="number"
                className={inputBase}
                value={benchmarks.sales.acvTarget}
                onChange={(e) =>
                  handleFieldChange(
                    "sales",
                    "acvTarget",
                    Number(e.target.value || 0)
                  )
                }
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                {currencySymbol}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Success */}
        <div className={cardBase}>
          <h3 className="text-sm font-semibold text-slate-100">
            Customer Success
          </h3>

          <div>
            <label className={labelBase}>Monthly churn target</label>
            <div className="relative">
              <input
                type="number"
                className={inputBase}
                value={benchmarks.cs.monthlyChurn}
                onChange={(e) =>
                  handleFieldChange(
                    "cs",
                    "monthlyChurn",
                    Number(e.target.value || 0)
                  )
                }
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                %
              </span>
            </div>
          </div>

          <div>
            <label className={labelBase}>Expansion target</label>
            <div className="relative">
              <input
                type="number"
                className={inputBase}
                value={benchmarks.cs.expansion}
                onChange={(e) =>
                  handleFieldChange(
                    "cs",
                    "expansion",
                    Number(e.target.value || 0)
                  )
                }
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                %
              </span>
            </div>
          </div>

          <div>
            <label className={labelBase}>NRR target</label>
            <div className="relative">
              <input
                type="number"
                className={inputBase}
                value={benchmarks.cs.nrr}
                onChange={(e) =>
                  handleFieldChange("cs", "nrr", Number(e.target.value || 0))
                }
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                %
              </span>
            </div>
          </div>

          <div>
            <label className={labelBase}>Gross margin target</label>
            <div className="relative">
              <input
                type="number"
                className={inputBase}
                value={benchmarks.cs.grossMargin}
                onChange={(e) =>
                  handleFieldChange(
                    "cs",
                    "grossMargin",
                    Number(e.target.value || 0)
                  )
                }
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                %
              </span>
            </div>
          </div>
        </div>

        {/* ARR Target + CAC */}
        <div className={cardBase}>
          <h3 className="text-sm font-semibold text-slate-100">ARR Target</h3>

          <div>
            <label className={labelBase}>Current ARR</label>
            <div className="relative">
              <input
                type="number"
                className={inputBase}
                value={benchmarks.arr.currentArr}
                onChange={(e) =>
                  handleFieldChange(
                    "arr",
                    "currentArr",
                    Number(e.target.value || 0)
                  )
                }
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                {currencySymbol}
              </span>
            </div>
          </div>

          <div>
            <label className={labelBase}>ARR target</label>
            <div className="relative">
              <input
                type="number"
                className={inputBase}
                value={benchmarks.arr.targetArr}
                onChange={(e) =>
                  handleFieldChange(
                    "arr",
                    "targetArr",
                    Number(e.target.value || 0)
                  )
                }
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                {currencySymbol}
              </span>
            </div>
          </div>

          <div>
            <label className={labelBase}>Timeframe</label>
            <div className="relative">
              <input
                type="number"
                className={inputBase}
                value={benchmarks.arr.timeframeWeeks}
                onChange={(e) =>
                  handleFieldChange(
                    "arr",
                    "timeframeWeeks",
                    Number(e.target.value || 0)
                  )
                }
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                weeks
              </span>
            </div>
          </div>

          <div>
            <label className={labelBase}>Blended CAC target</label>
            <div className="relative">
              <input
                type="number"
                className={inputBase}
                value={benchmarks.arr.blendedCacTarget}
                onChange={(e) =>
                  handleFieldChange(
                    "arr",
                    "blendedCacTarget",
                    Number(e.target.value || 0)
                  )
                }
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                {currencySymbol}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
