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
  backgroundColor: "#18191b",
  border: "1px solid #2a2b2e",
  borderRadius: "6px",
  fontSize: "11px",
  padding: "6px 10px",
};

export default function ActivityBarChart({ data, height = 180 }: Props) {
  const hasUserData = data.some((b) => b.newUserCount > 0);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 4, right: hasUserData ? 28 : 4, bottom: 0, left: -20 }}>
        <CartesianGrid vertical={false} stroke="#252628" />
        <XAxis
          dataKey="period"
          ticks={YEAR_TICKS}
          tickFormatter={(v: string) => v.slice(0, 4)}
          tick={{ fontSize: 10, fill: "#4b5563" }}
          axisLine={{ stroke: "#2a2b2e" }}
          tickLine={false}
        />
        <YAxis
          yAxisId="activity"
          tick={{ fontSize: 9, fill: "#4b5563" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
          width={28}
        />
        {hasUserData && (
          <YAxis
            yAxisId="users"
            orientation="right"
            tick={{ fontSize: 9, fill: "#4b5563" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            width={28}
          />
        )}
        <Tooltip
          cursor={{ fill: "rgba(90,130,200,0.06)" }}
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
          yAxisId="activity"
          dataKey="postCount"
          name="Posts"
          fill="#2e4a80"
          radius={[2, 2, 0, 0]}
          maxBarSize={10}
          isAnimationActive={false}
        />
        <Line
          yAxisId="activity"
          dataKey="topicCount"
          name="Topics"
          stroke="#5a8fd4"
          strokeWidth={1.5}
          dot={false}
          type="monotone"
          isAnimationActive={false}
        />
        {hasUserData && (
          <Line
            yAxisId="users"
            dataKey="newUserCount"
            name="New Users"
            stroke="#a78bfa"
            strokeWidth={1.5}
            dot={false}
            type="monotone"
            isAnimationActive={false}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
