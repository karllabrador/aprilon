"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { ActivityBucket } from "@/lib/forum";

const YEAR_TICKS = Array.from({ length: 8 }, (_, i) => `${2009 + i}-01`);

type Props = {
  data: ActivityBucket[];
  height?: number;
};

function formatLabel(period: string) {
  const [y, mo] = period.split("-");
  return new Date(Number(y), Number(mo) - 1).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
}

const tooltipStyle: React.CSSProperties = {
  backgroundColor: "#0c1414",
  border: "1px solid #1e2828",
  borderRadius: "6px",
  fontSize: "11px",
  padding: "6px 10px",
};

export default function ActivityBarChart({ data, height = 180 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <CartesianGrid vertical={false} stroke="#111c1c" />
        <XAxis
          dataKey="period"
          ticks={YEAR_TICKS}
          tickFormatter={(v: string) => v.slice(0, 4)}
          tick={{ fontSize: 10, fill: "#4b5563" }}
          axisLine={{ stroke: "#1e2424" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 9, fill: "#4b5563" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
          width={28}
        />
        <Tooltip
          cursor={{ fill: "rgba(30, 56, 56, 0.25)" }}
          contentStyle={tooltipStyle}
          labelStyle={{ color: "#9ca3af", marginBottom: "4px" }}
          itemStyle={{ color: "#d1d5db" }}
          labelFormatter={(label) => formatLabel(String(label))}
        />
        <Legend
          iconType="square"
          iconSize={8}
          wrapperStyle={{ fontSize: "10px", paddingTop: "8px", color: "#6b7280" }}
        />
        <Bar
          dataKey="postCount"
          name="Posts"
          fill="#1e3838"
          radius={[1, 1, 0, 0]}
          maxBarSize={10}
          isAnimationActive={false}
        />
        <Line
          dataKey="topicCount"
          name="Topics"
          stroke="#3a7070"
          strokeWidth={1.5}
          dot={false}
          type="monotone"
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
