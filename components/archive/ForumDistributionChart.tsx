"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { ForumActivitySlice } from "@/lib/forum";

const FILLS = [
  "#2a5858", "#265252", "#224c4c", "#1e4646",
  "#1a4040", "#163a3a", "#123434", "#0e2e2e",
];

const tooltipStyle: React.CSSProperties = {
  backgroundColor: "#0c1414",
  border: "1px solid #1e2828",
  borderRadius: "6px",
  fontSize: "11px",
  padding: "6px 10px",
};

type Props = { data: ForumActivitySlice[] };

export default function ForumDistributionChart({ data }: Props) {
  if (!data.length) return null;
  const chartHeight = data.length * 36 + 32;

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 0, right: 20, bottom: 0, left: 0 }}
      >
        <XAxis
          type="number"
          tick={{ fontSize: 9, fill: "#4b5563" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="forumName"
          tick={{ fontSize: 10, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
          width={160}
        />
        <Tooltip
          cursor={{ fill: "rgba(30, 56, 56, 0.2)" }}
          contentStyle={tooltipStyle}
          labelStyle={{ color: "#9ca3af", marginBottom: "4px" }}
          itemStyle={{ color: "#d1d5db" }}
          formatter={(v) => [typeof v === "number" ? v.toLocaleString() : v, "Posts"]}
        />
        <Bar dataKey="postCount" name="Posts" radius={[0, 2, 2, 0]} isAnimationActive={false}>
          {data.map((_, i) => (
            <Cell key={i} fill={FILLS[i % FILLS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
