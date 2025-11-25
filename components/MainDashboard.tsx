// components/MainDashboard.tsx
"use client";

import React, { useMemo, useState } from "react";
import HeroCard from "@/components/HeroCard";
import { Benchmarks } from "@/components/BenchmarksPanel";

type Timeframe = "30" | "60" | "90";

type Actuals = {
  timeframe: Timeframe;
  leads: number;
  mqls: number;
  sqls: number;
  opps: number;
  proposals: number;
  wins: number;
  newArr: number;
  includeCustomerSuccess: boolean;
};

type ScenarioId = "weakest-stage" | "acv-gap" | "boost-leads" | null;

type ScenarioMetrics = {
  forecastArr: number;
  gapToTarget: number;
  currentRunRate: number;
};

type MainDashboardProps = {
  benchmarks: Benchmarks;
};

const formatCurrency = (value: number) =>
  `€${value.toLocaleString("en-IE", {
    maximumFractionDigits: 0,
  })}`;

const formatPercent = (value: number) =>
  `${(value * 100).toFixed(1)}%`;

const formatInteger = (value: number) =>
  value.toLocaleString("en-IE", {
    maximumFractionDigits: 0,
  });

function getMonthsFromTimeframe(timeframe: Timeframe): number {
  const days = parseInt(timeframe, 10);
  return days / 30;
}

function clampNumber(num: number) {
  return Number.isFinite(num) ? num : 0;
}

const MainDashboard: React.FC<MainDashboardProps> = ({
  benchmarks,
}) => {
  const [actuals, setActuals] = useState<Actuals>({
    timeframe: "90",
    leads: 1300,
    mqls: 400,
    sqls: 150,
    opps: 90,
    proposals: 60,
    wins: 25,
    newArr: 900_000,
    includeCustomerSuccess: true,
  });

  const [activeScenario, setActiveScenario] =
    useState<ScenarioId>(null);
  const [scenarioMetrics, setScenarioMetrics] =
    useState<ScenarioMetrics | null>(null);

  const monthsInPeriod = useMemo(
    () => getMonthsFromTimeframe(actuals.timeframe),
    [actuals.timeframe]
  );

  // Base ACV is derived from actuals, but we NEVER overwrite newArr here.
  const baseAcv = useMemo(() => {
    if (actuals.wins > 0) {
      const acv = actuals.newArr / actuals.wins;
      return clampNumber(acv);
    }
    // fall back to ACV benchmark if no wins
    return benchmarks.acv;
  }, [actuals.newArr, actuals.wins, benchmarks.acv]);

  const baseMetrics = useMemo(() => {
    const currentRunRate =
      monthsInPeriod > 0
        ? actuals.newArr / monthsInPeriod
        : 0;

    const weeksInTimeframe = benchmarks.timeframeWeeks;
    const monthsInTargetPeriod = weeksInTimeframe / 4.345;

    const nrrFactor = actuals.includeCustomerSuccess
      ? benchmarks.nrr
      : 1;

    const forecastArr =
      currentRunRate * monthsInTargetPeriod * nrrFactor;

    const gapToTarget = forecastArr - benchmarks.targetArr;

    const requiredRunRate =
      monthsInTargetPeriod > 0
        ? benchmarks.targetArr / monthsInTargetPeriod
        : 0;

    return {
      currentRunRate: clampNumber(currentRunRate),
      forecastArr: clampNumber(forecastArr),
      gapToTarget: clampNumber(gapToTarget),
      requiredRunRate: clampNumber(requiredRunRate),
      monthsInTargetPeriod,
    };
  }, [
    actuals.newArr,
    monthsInPeriod,
    actuals.includeCustomerSuccess,
    benchmarks,
  ]);

  const selectedMetrics = scenarioMetrics || baseMetrics;

  const conversionRates = useMemo(() => {
    const leadToMql =
      actuals.leads > 0 ? actuals.mqls / actuals.leads : 0;
    const mqlToSql =
      actuals.mqls > 0 ? actuals.sqls / actuals.mqls : 0;
    const sqlToOpp =
      actuals.sqls > 0 ? actuals.opps / actuals.sqls : 0;
    const oppToProposal =
      actuals.opps > 0
        ? actuals.proposals / actuals.opps
        : 0;
    const proposalToWin =
      actuals.proposals > 0
        ? actuals.wins / actuals.proposals
        : 0;

    return {
      leadToMql,
      mqlToSql,
      sqlToOpp,
      oppToProposal,
      proposalToWin,
    };
  }, [actuals]);

  const weakestStage = useMemo(() => {
    const stages = [
      {
        id: "mqlToSql" as const,
        label: "MQL → SQL",
        actual: conversionRates.mqlToSql,
        target: benchmarks.mqlToSql,
      },
      {
        id: "sqlToOpp" as const,
        label: "SQL → Opp",
        actual: conversionRates.sqlToOpp,
        target: benchmarks.sqlToOpp,
      },
      {
        id: "oppToProposal" as const,
        label: "Opp → Proposal",
        actual: conversionRates.oppToProposal,
        target: benchmarks.oppToProposal,
      },
      {
        id: "proposalToWin" as const,
        label: "Proposal → Win",
        actual: conversionRates.proposalToWin,
        target: benchmarks.proposalToWin,
      },
    ];

    const withGap = stages.map((s) => ({
      ...s,
      gap: s.target - s.actual,
    }));

    const negativeOnly = withGap.filter(
      (s) => s.gap > 0.001
    );
    if (!negativeOnly.length) return null;

    negativeOnly.sort((a, b) => b.gap - a.gap);
    return negativeOnly[0];
  }, [conversionRates, benchmarks]);

  const monthsInTargetPeriod =
    baseMetrics.monthsInTargetPeriod;

  // Funnel stage vs benchmark (absolute counts and diff)
  const funnelBenchmarkComparisons = useMemo(() => {
    const items = [];

    const leadsToMqlExpected =
      actuals.leads * benchmarks.leadsToMql;
    items.push({
      key: "leadsToMql",
      label: "Leads → MQLs",
      actual: actuals.mqls,
      expected: leadsToMqlExpected,
    });

    const mqlToSqlExpected =
      actuals.mqls * benchmarks.mqlToSql;
    items.push({
      key: "mqlToSql",
      label: "MQL → SQLs",
      actual: actuals.sqls,
      expected: mqlToSqlExpected,
    });

    const sqlToOppExpected =
      actuals.sqls * benchmarks.sqlToOpp;
    items.push({
      key: "sqlToOpp",
      label: "SQL → Opps",
      actual: actuals.opps,
      expected: sqlToOppExpected,
    });

    const oppToProposalExpected =
      actuals.opps * benchmarks.oppToProposal;
    items.push({
      key: "oppToProposal",
      label: "Opp → Proposals",
      actual: actuals.proposals,
      expected: oppToProposalExpected,
    });

    const proposalToWinExpected =
      actuals.proposals * benchmarks.proposalToWin;
    items.push({
      key: "proposalToWin",
      label: "Proposal → Wins",
      actual: actuals.wins,
      expected: proposalToWinExpected,
    });

    return items.map((item) => ({
      ...item,
      diff: item.actual - item.expected,
    }));
  }, [actuals, benchmarks]);

  // New leads baseline vs benchmark (per timeframe)
  const leadsExpected =
    benchmarks.newLeadsPerMonth * monthsInPeriod;
  const leadsDiff = actuals.leads - leadsExpected;

  // Is lead volume the primary issue? (>50% below benchmark)
  const leadShortfallRatio =
    leadsExpected > 0
      ? Math.abs(leadsDiff) / leadsExpected
      : 0;
  const leadVolumeIsUnderBenchmark =
    leadsDiff < 0 && leadShortfallRatio >= 0.5;

  const computeScenarioMetricsFromNewArr = (
    scenarioNewArr: number
  ): ScenarioMetrics => {
    const currentRunRate =
      monthsInPeriod > 0
        ? scenarioNewArr / monthsInPeriod
        : 0;

    const nrrFactor = actuals.includeCustomerSuccess
      ? benchmarks.nrr
      : 1;

    const forecastArr =
      currentRunRate * monthsInTargetPeriod * nrrFactor;

    const gapToTarget = forecastArr - benchmarks.targetArr;

    return {
      forecastArr: clampNumber(forecastArr),
      gapToTarget: clampNumber(gapToTarget),
      currentRunRate: clampNumber(currentRunRate),
    };
  };

  const applyScenario = (scenario: ScenarioId) => {
    if (!scenario) {
      setActiveScenario(null);
      setScenarioMetrics(null);
      return;
    }

    // SCENARIO 1: Primary fix
    if (scenario === "weakest-stage") {
      // If lead volume is the main issue, FIRST fix lead volume back to benchmark
      if (leadVolumeIsUnderBenchmark) {
        const targetLeads = leadsExpected;
        const mqls =
          targetLeads * conversionRates.leadToMql;
        const sqls =
          mqls * conversionRates.mqlToSql;
        const opps =
          sqls * conversionRates.sqlToOpp;
        const proposals =
          opps * conversionRates.oppToProposal;
        const wins =
          proposals * conversionRates.proposalToWin;

        const scenarioNewArr = wins * baseAcv;
        const metrics =
          computeScenarioMetricsFromNewArr(
            scenarioNewArr
          );

        setActiveScenario("weakest-stage");
        setScenarioMetrics(metrics);
        return;
      }

      // Otherwise, fall back to fixing the weakest funnel stage
      if (weakestStage) {
        let { mqls, sqls, opps, proposals } = actuals;
        let wins = actuals.wins;

        if (weakestStage.id === "mqlToSql") {
          const newSqls = Math.round(
            mqls * benchmarks.mqlToSql
          );
          const newOpps =
            conversionRates.sqlToOpp * newSqls;
          const newProposals =
            conversionRates.oppToProposal * newOpps;
          const newWins =
            conversionRates.proposalToWin *
            newProposals;
          wins = newWins;
        } else if (weakestStage.id === "sqlToOpp") {
          const newOpps = Math.round(
            sqls * benchmarks.sqlToOpp
          );
          const newProposals =
            conversionRates.oppToProposal * newOpps;
          const newWins =
            conversionRates.proposalToWin *
            newProposals;
          wins = newWins;
        } else if (weakestStage.id === "oppToProposal") {
          const newProposals = Math.round(
            opps * benchmarks.oppToProposal
          );
          const newWins =
            conversionRates.proposalToWin *
            newProposals;
          wins = newWins;
        } else if (
          weakestStage.id === "proposalToWin"
        ) {
          const newWins = Math.round(
            proposals * benchmarks.proposalToWin
          );
          wins = newWins;
        }

        const scenarioNewArr = wins * baseAcv;
        const metrics =
          computeScenarioMetricsFromNewArr(
            scenarioNewArr
          );

        setActiveScenario("weakest-stage");
        setScenarioMetrics(metrics);
        return;
      }

      // If nothing is weak, just return base
      setActiveScenario("weakest-stage");
      setScenarioMetrics(baseMetrics);
      return;
    }

    // SCENARIO 2: ACV GAP – bring ACV back to benchmark if it's below, else +10%
    if (scenario === "acv-gap") {
      let targetAcv = baseAcv;

      if (baseAcv < benchmarks.acv) {
        targetAcv = benchmarks.acv;
      } else {
        targetAcv = baseAcv * 1.1;
      }

      const scenarioNewArr = actuals.wins * targetAcv;
      const metrics =
        computeScenarioMetricsFromNewArr(
          scenarioNewArr
        );

      setActiveScenario("acv-gap");
      setScenarioMetrics(metrics);
      return;
    }

    // SCENARIO 3: Boost leads by 20%
    if (scenario === "boost-leads") {
      const boostedLeads = actuals.leads * 1.2;
      const mqls =
        boostedLeads * conversionRates.leadToMql;
      const sqls =
        mqls * conversionRates.mqlToSql;
      const opps =
        sqls * conversionRates.sqlToOpp;
      const proposals =
        opps * conversionRates.oppToProposal;
      const wins =
        proposals * conversionRates.proposalToWin;

      const scenarioNewArr = wins * baseAcv;
      const metrics =
        computeScenarioMetricsFromNewArr(
          scenarioNewArr
        );

      setActiveScenario("boost-leads");
      setScenarioMetrics(metrics);
      return;
    }
  };

  const handleActualChange = (
    field: keyof Actuals,
    value: string
  ) => {
    setActiveScenario(null);
    setScenarioMetrics(null);

    setActuals((prev) => {
      if (field === "timeframe") {
        return {
          ...prev,
          timeframe: value as Timeframe,
        };
      }

      if (field === "includeCustomerSuccess") {
        return {
          ...prev,
          includeCustomerSuccess:
            value === "true",
        };
      }

      // Special handling for New ARR field
      if (field === "newArr") {
        const cleaned = value.replace(/[^\d]/g, "");
        if (!cleaned) {
          return {
            ...prev,
            newArr: 0,
          };
        }
        const numeric = Number(cleaned);
        return {
          ...prev,
          newArr: Number.isFinite(numeric)
            ? numeric
            : prev.newArr,
        };
      }

      const num = Number(value);
      return {
        ...prev,
        [field]: Number.isFinite(num) ? num : 0,
      };
    });
  };

  const gapStatusLabel =
    selectedMetrics.gapToTarget >= 0
      ? "Ahead"
      : "Behind";

  const gapStatusTone =
    selectedMetrics.gapToTarget >= 0
      ? "good"
      : "bad";

  const runRateStatusTone =
    selectedMetrics.currentRunRate >=
    baseMetrics.requiredRunRate
      ? "good"
      : "warning";

  const gapAbs = Math.abs(
    selectedMetrics.gapToTarget
  );

  const avgAcvDisplay =
    actuals.wins > 0
      ? formatCurrency(baseAcv)
      : "—";

  // For New ARR in Period vs what is required in this period
  const periodTargetArr =
    baseMetrics.requiredRunRate * monthsInPeriod;
  const arrStatusIsAbove =
    actuals.newArr >= periodTargetArr && actuals.newArr > 0;

  // ACV diff vs benchmark
  const acvDiff = baseAcv - benchmarks.acv;
  const acvIsBelowBenchmark = acvDiff < 0;

  // Scenario summary text
  const scenarioName =
    activeScenario === "weakest-stage"
      ? leadVolumeIsUnderBenchmark
        ? "Fix lead volume back to benchmark"
        : "Fix weakest funnel stage"
