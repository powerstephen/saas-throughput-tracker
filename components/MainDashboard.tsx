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

  const stages
