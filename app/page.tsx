"use client";

import { useEffect, useState } from "react";
import BentoDashboard from "@/src/components/ui/bento-dashboard";

const API_URL = process.env.NEXT_PUBLIC_STATS_API!;
const MAX_POINTS = 20;

type Stats = {
  cpu: { loadPercent: string };
  temperature: { celsius: number };
  memory: { totalGB: string; usedGB: string; usedPercent: string };
  disk: {
    mount: string;
    totalGB: string;
    usedGB: string;
    usedPercent: number;
  }[];
  uptime: { seconds: number };
  containers: { name: string; image: string; state: string; status: string }[];
};

export default function Page() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [history, setHistory] = useState<
    { time: string; cpu: number; ram: number }[]
  >([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(API_URL, { cache: "no-store" });
        if (!res.ok) throw new Error("unreachable");
        const data: Stats = await res.json();
        setStats(data);
        setError(false);
        setHistory((prev) => [
          ...prev.slice(-(MAX_POINTS - 1)),
          {
            time: new Date().toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            cpu: parseFloat(data.cpu.loadPercent),
            ram: parseFloat(data.memory.usedPercent),
          },
        ]);
      } catch {
        setError(true);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-black font-mono font-bold text-black dark:text-white">
        {error ? "PI OFFLINE — RETRYING..." : "CONNECTING..."}
      </div>
    );
  }

  const cpu = parseFloat(stats.cpu.loadPercent);
  const ram = parseFloat(stats.memory.usedPercent);
  const disk = stats.disk[0].usedPercent;
  const uptimeDays = stats.uptime.seconds / 86400;
  const runningPct =
    (stats.containers.filter((c) => c.state === "running").length /
      stats.containers.length) *
    100;

  const tempPercent = Math.min(
    Math.max(((stats.temperature.celsius - 40) / (85 - 40)) * 100, 0),
    100,
  );

  const radarData = [
    { label: "CPU", value: cpu, color: "#f87171" },
    { label: "RAM", value: ram, color: "#4ade80" },
    { label: "DISK", value: disk, color: "#60a5fa" },
    { label: "TEMP", value: tempPercent, color: "#fb923c" },
    { label: "SERVICES", value: runningPct, color: "#a78bfa" },
  ];

  const rawSplit = [
    { label: "CPU", raw: cpu, color: "#f87171" },
    { label: "MEMORY", raw: ram, color: "#4ade80" },
    { label: "DISK", raw: disk, color: "#60a5fa" },
  ];
  const totalRaw = rawSplit.reduce((s, d) => s + d.raw, 0) || 1;
  const pieData = rawSplit.map((d) => ({
    label: d.label,
    value: (d.raw / totalRaw) * 100,
    color: d.color,
  }));

  return (
    <BentoDashboard
      hostname="harshalpi5"
      statusLabel={error ? "signal lost" : "online"}
      isError={error}
      tempCelsius={stats.temperature.celsius}
      lineData={history}
      radarData={radarData}
      pieData={pieData}
      services={stats.containers}
    />
  );
}
