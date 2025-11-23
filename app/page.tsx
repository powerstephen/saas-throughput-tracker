// app/page.tsx
import React from "react";
import MainDashboard from "@/components/MainDashboard";
import "./globals.css";

export default function HomePage() {
  return (
    <main className="dashboard-root">
      <MainDashboard />
    </main>
  );
}
