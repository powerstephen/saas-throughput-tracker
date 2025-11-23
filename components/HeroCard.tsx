// components/HeroCard.tsx
import React from "react";

type HeroCardProps = {
  title: string;
  value: string;
  subtitle: string;
  statusLabel: string;
  statusTone: "good" | "warning" | "bad";
};

export default function HeroCard({
  title,
  value,
  subtitle,
  statusLabel,
  statusTone,
}: HeroCardProps) {
  const statusClass =
    statusTone === "good"
      ? "hero-status-good"
      : statusTone === "warning"
      ? "hero-status-warning"
      : "hero-status-bad";

  return (
    <div className="hero-card">
      <div className="hero-title">{title}</div>
      <div className="hero-value">{value}</div>
      <div className="hero-subtitle">{subtitle}</div>
      <div className={`hero-status-pill ${statusClass}`}>{statusLabel}</div>
    </div>
  );
}
