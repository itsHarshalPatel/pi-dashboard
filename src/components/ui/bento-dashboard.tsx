"use client";

import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type ChartItem = { label: string; value: number; color: string };
type HistoryPoint = { time: string; cpu: number; ram: number };

// =========================================
// 1. BRUTALIST LINE CHART (CPU / RAM trend)
// =========================================
const BrutalistLineChart = ({
  data,
  title,
}: {
  data: HistoryPoint[];
  title: string;
}) => {
  return (
    <div className="w-full h-full bg-white dark:bg-zinc-900 border-[3px] border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] relative flex flex-col p-6 transition-colors duration-200">
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none z-0 bg-[radial-gradient(#000_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:12px_12px]" />
      <div className="flex items-center justify-between mb-6 border-b-[3px] border-black dark:border-white pb-2 relative z-10">
        <h3 className="font-black uppercase text-xl text-black dark:text-white">
          {title}
        </h3>
        <div className="flex gap-3 font-mono text-[10px] font-bold uppercase">
          <span className="flex items-center gap-1.5 text-black dark:text-white">
            <span className="w-3 h-3 bg-red-400 border-2 border-black dark:border-white inline-block" />{" "}
            CPU
          </span>
          <span className="flex items-center gap-1.5 text-black dark:text-white">
            <span className="w-3 h-3 bg-blue-400 border-2 border-black dark:border-white inline-block" />{" "}
            RAM
          </span>
        </div>
      </div>
      <div className="flex-1 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="currentColor"
              className="text-black/15 dark:text-white/15"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              fontSize={11}
              tickLine={false}
              axisLine={{ strokeWidth: 3 }}
              stroke="black"
              className="dark:stroke-white font-mono"
            />
            <YAxis
              domain={["dataMin - 5", "dataMax + 5"]}
              fontSize={11}
              tickLine={false}
              axisLine={{ strokeWidth: 3 }}
              stroke="black"
              className="dark:stroke-white font-mono"
            />
            <Tooltip
              contentStyle={{
                background: "white",
                border: "3px solid black",
                borderRadius: 0,
                fontFamily: "monospace",
                fontWeight: 700,
                fontSize: 12,
                boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)",
              }}
            />
            <Line
              type="monotone"
              dataKey="cpu"
              stroke="#f87171"
              strokeWidth={4}
              dot={{ r: 3, strokeWidth: 2, fill: "#f87171", stroke: "black" }}
            />
            <Line
              type="monotone"
              dataKey="ram"
              stroke="#60a5fa"
              strokeWidth={4}
              dot={{ r: 3, strokeWidth: 2, fill: "#60a5fa", stroke: "black" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ==========================================
// 2. BRUTALIST RADAR CHART
// ==========================================
const RADAR_SIZE = 200;
const CENTER = RADAR_SIZE / 2;
const RADIUS = 80;
const angleToRad = (angle: number) => (Math.PI / 180) * angle;

const BrutalistRadarChart = ({
  data,
  title,
}: {
  data: ChartItem[];
  title: string;
}) => {
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);
  const numAxes = data.length;

  const getCoords = (value: number, index: number) => {
    const angle = angleToRad((360 / numAxes) * index - 90);
    const r = (Math.min(value, 100) / 100) * RADIUS;
    return { x: CENTER + r * Math.cos(angle), y: CENTER + r * Math.sin(angle) };
  };

  const pathData =
    data
      .map((d, i) => {
        const c = getCoords(d.value, i);
        return `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`;
      })
      .join(" ") + " Z";

  const gridLevels = [100, 75, 50, 25];

  return (
    <div className="w-full h-full bg-zinc-50 dark:bg-zinc-900 border-[3px] border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-6 flex flex-col sm:flex-row gap-6 relative overflow-hidden transition-colors duration-200">
      <div className="flex-1 flex items-center justify-center relative min-h-[200px]">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 dark:opacity-10">
          <span className="text-7xl font-black uppercase text-black dark:text-white">
            STATS
          </span>
        </div>
        <svg
          viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`}
          className="w-full h-full max-w-[200px] overflow-visible"
        >
          {gridLevels.map((level, lvlIdx) => (
            <path
              key={lvlIdx}
              d={
                data
                  .map((_, i) => {
                    const c = getCoords(level, i);
                    return `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`;
                  })
                  .join(" ") + " Z"
              }
              fill="none"
              className="stroke-black/10 dark:stroke-white/10"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          ))}
          {data.map((_, i) => {
            const outer = getCoords(100, i);
            return (
              <line
                key={i}
                x1={CENTER}
                y1={CENTER}
                x2={outer.x}
                y2={outer.y}
                className="stroke-black/10 dark:stroke-white/10"
                strokeWidth="2"
              />
            );
          })}
          <motion.path
            d={pathData}
            fill="rgba(167, 139, 250, 0.5)"
            className="stroke-black dark:stroke-white"
            strokeWidth="4"
            strokeLinejoin="round"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: 0.2,
            }}
            style={{ originX: "50%", originY: "50%" }}
          />
          {data.map((d, i) => {
            const coords = getCoords(d.value, i);
            const isHovered = hoveredMetric === d.label;
            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredMetric(d.label)}
                onMouseLeave={() => setHoveredMetric(null)}
                className="cursor-pointer"
              >
                <circle cx={coords.x} cy={coords.y} r="20" fill="transparent" />
                <motion.circle
                  cx={coords.x}
                  cy={coords.y}
                  r="6"
                  className="fill-white dark:fill-zinc-900 stroke-black dark:stroke-white"
                  strokeWidth="3"
                  animate={{
                    scale: isHovered ? 2 : 1,
                    strokeWidth: isHovered ? 4 : 3,
                    fill: isHovered ? d.color : undefined,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                />
              </g>
            );
          })}
        </svg>
      </div>
      <div className="w-full sm:w-40 flex flex-col justify-center gap-2 z-10">
        <h3 className="font-black uppercase text-lg mb-2 border-b-[3px] border-black dark:border-white pb-2 text-black dark:text-white">
          {title}
        </h3>
        {data.map((item, i) => (
          <motion.div
            key={i}
            onMouseEnter={() => setHoveredMetric(item.label)}
            onMouseLeave={() => setHoveredMetric(null)}
            className="flex items-center justify-between p-2 border-2 border-transparent hover:border-black dark:hover:border-white hover:bg-white dark:hover:bg-zinc-800 cursor-pointer transition-colors"
            animate={{ x: hoveredMetric === item.label ? 10 : 0 }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 border-2 border-black dark:border-white"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs font-bold font-mono text-black dark:text-zinc-200">
                {item.label}
              </span>
            </div>
            <span className="font-black text-sm text-black dark:text-white">
              {item.value.toFixed(0)}%
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// =========================================
// 3. BRUTALIST DONUT CHART (reduced height)
// =========================================
const springConfig = { type: "spring" as const, stiffness: 300, damping: 20 };
const getPieCoords = (percent: number) => [
  Math.cos(2 * Math.PI * percent),
  Math.sin(2 * Math.PI * percent),
];

const BrutalistDonut = ({
  data,
  title,
  centerLabel,
}: {
  data: ChartItem[];
  title: string;
  centerLabel: string;
}) => {
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);
  let cumulativePercent = 0;

  return (
    <div className="w-full h-full bg-white dark:bg-zinc-900 border-[3px] border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-5 flex flex-col sm:flex-row items-center gap-5 overflow-hidden relative transition-colors duration-200">
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none z-0 bg-[radial-gradient(#000_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:12px_12px]" />

      <div className="relative w-32 h-32 flex-shrink-0 z-10">
        <motion.svg
          viewBox="-1.2 -1.2 2.4 2.4"
          className="-rotate-90 overflow-visible w-full h-full"
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: -90, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
            delay: 0.2,
          }}
        >
          {data.map((slice) => {
            const startPercent = cumulativePercent;
            const endPercent = cumulativePercent + slice.value / 100;
            cumulativePercent = endPercent;
            const [startX, startY] = getPieCoords(startPercent);
            const [endX, endY] = getPieCoords(endPercent);
            const largeArcFlag = slice.value / 100 > 0.5 ? 1 : 0;
            const pathData = [
              `M ${startX} ${startY}`,
              `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
              `L 0 0`,
            ].join(" ");
            const isHovered = hoveredSlice === slice.label;
            const isDimmed = hoveredSlice !== null && !isHovered;

            return (
              <motion.path
                key={slice.label}
                d={pathData}
                fill={slice.color}
                className="stroke-black dark:stroke-white"
                strokeWidth="0.05"
                strokeLinecap="round"
                strokeLinejoin="round"
                animate={{
                  scale: isHovered ? 1.05 : 1,
                  opacity: isDimmed ? 0.3 : 1,
                  filter: isDimmed ? "grayscale(80%)" : "grayscale(0%)",
                }}
                transition={springConfig}
                onMouseEnter={() => setHoveredSlice(slice.label)}
                onMouseLeave={() => setHoveredSlice(null)}
              />
            );
          })}
          <motion.circle
            cx="0"
            cy="0"
            r="0.55"
            className="fill-white dark:fill-zinc-900 stroke-black dark:stroke-white"
            strokeWidth="0.05"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, ...springConfig }}
          />
        </motion.svg>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <AnimatePresence mode="popLayout">
            {hoveredSlice ? (
              <motion.div
                key="hover"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={springConfig}
                className="flex flex-col items-center"
              >
                <span className="text-sm font-black leading-none text-black dark:text-white">
                  {data.find((d) => d.label === hoveredSlice)?.value.toFixed(0)}
                  %
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="default"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={springConfig}
                className="flex flex-col items-center"
              >
                <span className="text-xs font-black leading-none text-black dark:text-white text-center px-1">
                  {centerLabel}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex-1 z-10 min-w-0">
        <h3 className="font-black uppercase text-lg mb-2 border-b-[3px] border-black dark:border-white pb-1 text-black dark:text-white">
          {title}
        </h3>
        <div className="flex flex-col gap-1.5">
          {data.map((item) => (
            <motion.div
              key={item.label}
              onMouseEnter={() => setHoveredSlice(item.label)}
              onMouseLeave={() => setHoveredSlice(null)}
              animate={{
                opacity: hoveredSlice && hoveredSlice !== item.label ? 0.3 : 1,
              }}
              className="flex items-center justify-between gap-2 px-2 py-1 border-2 border-transparent hover:border-black dark:hover:border-white cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-2.5 h-2.5 border-2 border-black dark:border-white flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs font-bold uppercase text-black dark:text-white truncate">
                  {item.label}
                </span>
              </div>
              <span className="font-black text-xs text-black dark:text-white flex-shrink-0">
                {item.value.toFixed(0)}%
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// =========================================
// 4. MAIN BENTO LAYOUT
// =========================================
export default function BentoDashboard({
  hostname,
  statusLabel,
  isError,
  tempCelsius,
  lineData,
  radarData,
  pieData,
  services,
}: {
  hostname: string;
  statusLabel: string;
  isError: boolean;
  tempCelsius: number;
  lineData: HistoryPoint[];
  radarData: ChartItem[];
  pieData: ChartItem[];
  services: { name: string; image: string; state: string; status: string }[];
}) {
  return (
    <div className="min-h-screen w-full bg-zinc-100 dark:bg-black p-4 md:p-12 font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black flex flex-col transition-colors duration-200">
      <div className="fixed inset-0 pointer-events-none opacity-5 bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="max-w-7xl w-full mx-auto relative z-10 flex flex-col flex-1">
        <header className="mb-6 md:mb-10 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2 text-black dark:text-white">
              {hostname}
            </h1>
            <p className="font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-xs md:text-sm">
              Self-hosted Raspberry Pi 5 — live system overview
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border-[3px] border-black dark:border-white px-3 py-2 bg-white dark:bg-zinc-900">
              <span className="font-bold text-xs uppercase font-mono text-black dark:text-white">
                🌡 {tempCelsius}°C
              </span>
            </div>
            <div className="flex items-center gap-2 border-[3px] border-black dark:border-white px-3 py-2 bg-white dark:bg-zinc-900">
              <span
                className={cn(
                  "h-2.5 w-2.5 border-2 border-black dark:border-white",
                  isError ? "bg-red-400" : "bg-yellow-300",
                )}
              />
              <span className="font-bold text-xs uppercase font-mono text-black dark:text-white">
                {statusLabel}
              </span>
            </div>
          </div>
        </header>

        {/* Row 1: full-width line chart */}
        <div className="w-full h-[380px] mb-6">
          <BrutalistLineChart data={lineData} title="CPU / MEMORY — LIVE" />
        </div>

        {/* Row 2: radar + shorter donut */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="min-h-[260px]">
            <BrutalistRadarChart data={radarData} title="SYSTEM HEALTH" />
          </div>
          <div className="min-h-[260px]">
            <BrutalistDonut
              data={pieData}
              title="RESOURCE SPLIT"
              centerLabel="LIVE"
            />
          </div>
        </div>

        {/* Row 3: services */}
        <div className="bg-white dark:bg-zinc-900 border-[3px] border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-6">
          <h3 className="font-black uppercase text-xl mb-4 border-b-[3px] border-black dark:border-white pb-2 text-black dark:text-white">
            Services
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {services.map((c) => (
              <div
                key={c.name}
                className="flex items-center justify-between border-2 border-black dark:border-white p-3"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-2 w-2 border-2 border-black dark:border-white",
                      c.state === "running" ? "bg-yellow-300" : "bg-red-400",
                    )}
                  />
                  <span className="font-bold text-sm text-black dark:text-white">
                    {c.name}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-mono font-bold uppercase text-zinc-500 dark:text-zinc-400">
          <a
            href="https://github.com/itsHarshalPatel/pi-dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline hover:text-black dark:hover:text-white"
          >
            dashboard source
          </a>
          <a
            href="https://github.com/itsHarshalPatel/pi-stats-api"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline hover:text-black dark:hover:text-white"
          >
            api source
          </a>
          <a
            href="https://harshalpatel.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline hover:text-black dark:hover:text-white"
          >
            Portfolio
          </a>
        </div>
      </div>
    </div>
  );
}
