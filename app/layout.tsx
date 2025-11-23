/** app/layout.tsx */
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SaaS Throughput & ARR Tracker",
  description:
    "Benchmark your SaaS funnel, see your ARR path, and model high-impact scenarios to hit target.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-navyBg text-slate-100 antialiased">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
          {children}
        </div>
      </body>
    </html>
  );
}
