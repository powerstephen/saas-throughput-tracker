import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SaaS Throughput Lab",
  description: "Throughput-based ARR diagnostic and scenario planner"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slateBg text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
