"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const API_URL = process.env.NEXT_PUBLIC_STATS_API!;
const MAX_POINTS = 20;
const INITIAL_TIMEOUT_MS = 8000;

type Stats = {
  cpu: { loadPercent: string };
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

type HistoryPoint = { time: string; cpu: number; ram: number };

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(API_URL, { cache: "no-store" });
        if (!res.ok) throw new Error("unreachable");
        const data: Stats = await res.json();
        setStats(data);
        setError(null);
        setLastUpdated(new Date().toLocaleTimeString());

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
        setError("signal lost — retrying");
      } finally {
        setInitialLoadDone(true);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    const timeout = setTimeout(
      () => setInitialLoadDone(true),
      INITIAL_TIMEOUT_MS,
    );
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  };

  return (
    <div className="min-h-screen flex flex-col px-6 py-10 md:px-16 md:py-14">
      {/* Hero */}
      <div
        className="border-b pb-6 mb-3"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-sm mb-1" style={{ color: "var(--muted)" }}>
              self-hosted / raspberry pi 5
            </p>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
              harshalpi5
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{
                background: error ? "#E5484D" : "var(--amber)",
                boxShadow: error ? "none" : "0 0 8px var(--amber)",
                animation: !initialLoadDone
                  ? "pulse 1.4s ease-in-out infinite"
                  : "none",
              }}
            />
            <span className="mono text-sm" style={{ color: "var(--muted)" }}>
              {error
                ? error
                : initialLoadDone
                  ? `updated ${lastUpdated}`
                  : "connecting..."}
            </span>
          </div>
        </div>
      </div>

      <p className="text-sm mb-10" style={{ color: "var(--muted)" }}>
        Live stats from a Raspberry Pi 5 I run at home — Nextcloud, Jellyfin,
        and this dashboard, all self-hosted and reachable over Tailscale.
      </p>

      {!initialLoadDone ? (
        <p className="mono" style={{ color: "var(--muted)" }}>
          connecting to pi...
        </p>
      ) : error && !stats ? (
        <p className="mono" style={{ color: "#E5484D" }}>
          could not reach the pi — it may be powered off. this page will connect
          automatically once it&apos;s back online.
        </p>
      ) : stats ? (
        <>
          {/* Readout row */}
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-px mb-10"
            style={{ background: "var(--border)" }}
          >
            <Readout label="cpu load" value={`${stats.cpu.loadPercent}%`} />
            <Readout
              label="memory"
              value={`${stats.memory.usedPercent}%`}
              sub={`${stats.memory.usedGB} / ${stats.memory.totalGB} gb`}
            />
            <Readout
              label="disk (/)"
              value={`${stats.disk[0].usedPercent}%`}
              sub={`${stats.disk[0].usedGB} / ${stats.disk[0].totalGB} gb`}
            />
            <Readout
              label="uptime"
              value={formatUptime(stats.uptime.seconds)}
            />
          </div>

          {/* Chart */}
          <div
            className="border p-6 mb-10"
            style={{ borderColor: "var(--border)", background: "var(--panel)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm" style={{ color: "var(--muted)" }}>
                cpu / memory — last {MAX_POINTS * 5}s
              </h2>
              <div
                className="flex gap-4 mono text-xs"
                style={{ color: "var(--muted)" }}
              >
                <span>
                  <span style={{ color: "var(--amber)" }}>■</span> cpu
                </span>
                <span>
                  <span style={{ color: "var(--cyan)" }}>■</span> ram
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={history}>
                <CartesianGrid
                  strokeDasharray="2 4"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  stroke="var(--muted)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                />
                <YAxis
                  stroke="var(--muted)"
                  fontSize={11}
                  domain={["dataMin - 5", "dataMax + 5"]}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0D1117",
                    border: "1px solid var(--border)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="cpu"
                  stroke="var(--amber)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="ram"
                  stroke="var(--cyan)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Services */}
          <div>
            <h2 className="text-sm mb-4" style={{ color: "var(--muted)" }}>
              services
            </h2>
            <div className="border" style={{ borderColor: "var(--border)" }}>
              {stats.containers.map((c, i) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between px-5 py-4"
                  style={{
                    borderTop: i === 0 ? "none" : "1px solid var(--border)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        background:
                          c.state === "running" ? "var(--amber)" : "#E5484D",
                      }}
                    />
                    <span className="font-medium">{c.name}</span>
                    <span
                      className="mono text-xs"
                      style={{ color: "var(--muted)" }}
                    >
                      {c.image}
                    </span>
                  </div>
                  <span
                    className="mono text-xs"
                    style={{ color: "var(--muted)" }}
                  >
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}

      {/* Footer */}
      <div
        className="mt-auto pt-10 flex flex-wrap gap-x-6 gap-y-2 text-xs mono"
        style={{ color: "var(--muted)" }}
      >
        <a
          href="https://github.com/itsHarshalPatel/pi-dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          dashboard source
        </a>
        <a
          href="https://github.com/itsHarshalPatel/pi-stats-api"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          api source
        </a>
        <a
          href="https://github.com/itsHarshalPatel"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          github
        </a>
      </div>
    </div>
  );
}

function Readout({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="p-5" style={{ background: "var(--panel)" }}>
      <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>
        {label}
      </p>
      <p className="mono text-2xl">{value}</p>
      {sub && (
        <p className="mono text-xs mt-1" style={{ color: "var(--muted)" }}>
          {sub}
        </p>
      )}
    </div>
  );
}
