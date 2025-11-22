import "./globals.css";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "SaaS Throughput Lab",
  description: "Funnel throughput and ARR scenario planner"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
