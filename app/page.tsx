"use client";

import MainDashboard from "@/components/MainDashboard";

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <MainDashboard />
      </div>
    </main>
  );
}
