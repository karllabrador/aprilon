"use client";

import { useState } from "react";
import type { PmGraphData } from "@/lib/forum";

type Props = { data: PmGraphData };

const MAX_NODES = 50;
const CX = 440;
const CY = 440;
const RING_R = 370;
const SVG_W = 880;
const SVG_H = 880;

export default function PmGraph({ data }: Props) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  // Top nodes by total volume
  const nodes = [...data.nodes]
    .sort((a, b) => b.sent + b.received - (a.sent + a.received))
    .slice(0, MAX_NODES);

  const nodeSet = new Set(nodes.map((n) => n.id));
  const links = data.links.filter((l) => nodeSet.has(l.fromId) && nodeSet.has(l.toId));
  const maxCount = Math.max(...links.map((l) => l.count), 1);

  // Circular positions
  const pos = new Map<number, { x: number; y: number; angle: number }>();
  nodes.forEach((n, i) => {
    const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
    pos.set(n.id, { x: CX + RING_R * Math.cos(angle), y: CY + RING_R * Math.sin(angle), angle });
  });

  const hoveredLinks = hoveredId
    ? new Set(
        links
          .filter((l) => l.fromId === hoveredId || l.toId === hoveredId)
          .flatMap((l) => [l.fromId, l.toId]),
      )
    : null;

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ borderColor: "#2a2b2e", backgroundColor: "#16171a" }}
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        style={{ display: "block", maxHeight: "70vh" }}
      >
        {/* Edges */}
        {links.map((link, i) => {
          const from = pos.get(link.fromId);
          const to = pos.get(link.toId);
          if (!from || !to) return null;

          const isActive =
            hoveredId === null ||
            link.fromId === hoveredId ||
            link.toId === hoveredId;

          const t = link.count / maxCount;
          const opacity = isActive ? 0.12 + t * 0.55 : 0.03;

          // Bezier curve slightly pulled toward center for readability
          const mx = (from.x + to.x) / 2;
          const my = (from.y + to.y) / 2;
          const cx = mx + (CX - mx) * 0.35;
          const cy = my + (CY - my) * 0.35;

          return (
            <path
              key={i}
              d={`M${from.x},${from.y} Q${cx},${cy} ${to.x},${to.y}`}
              fill="none"
              stroke={`rgba(90,130,200,${opacity.toFixed(2)})`}
              strokeWidth={0.5 + t * 2}
            />
          );
        })}

        {/* Nodes + labels */}
        {nodes.map((node) => {
          const p = pos.get(node.id)!;
          const r = Math.min(28, Math.max(5, Math.sqrt(node.sent + node.received) * 2.8));
          const isHovered = node.id === hoveredId;
          const isDimmed = hoveredLinks !== null && !hoveredLinks.has(node.id);

          // Label placement: radially outward
          const labelDist = r + 10;
          const lx = CX + (RING_R + labelDist) * Math.cos(p.angle);
          const ly = CY + (RING_R + labelDist) * Math.sin(p.angle);
          const anchor =
            Math.abs(p.angle) < 0.2 || Math.abs(p.angle - Math.PI) < 0.2
              ? "middle"
              : p.angle > -Math.PI / 2 && p.angle < Math.PI / 2
              ? "start"
              : "end";

          return (
            <g
              key={node.id}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHoveredId(node.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={r + 6}
                fill="transparent"
              />
              <circle
                cx={p.x}
                cy={p.y}
                r={r}
                fill={isHovered ? "#6090d0" : "#2e4a80"}
                stroke={isHovered ? "#88b0f0" : "#4872c0"}
                strokeWidth={isHovered ? 1.5 : 0.8}
                opacity={isDimmed ? 0.2 : 1}
              />
              <text
                x={lx}
                y={ly}
                textAnchor={anchor}
                dominantBaseline="middle"
                fontSize={11}
                fill={isHovered ? "#d1d5db" : isDimmed ? "#374151" : "#6b7280"}
                style={{ userSelect: "none", pointerEvents: "none" }}
              >
                {node.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Hover tooltip */}
      <div className="border-t px-4 py-3 min-h-13 flex items-center" style={{ borderColor: "#2a2b2e" }}>
        {hoveredId !== null ? (() => {
          const node = nodes.find((n) => n.id === hoveredId);
          if (!node) return null;
          const outgoing = links.filter((l) => l.fromId === hoveredId).sort((a, b) => b.count - a.count);
          const incoming = links.filter((l) => l.toId === hoveredId).sort((a, b) => b.count - a.count);
          return (
            <div className="flex items-baseline gap-6 text-sm w-full flex-wrap">
              <span className="font-semibold text-[#ededed]">{node.name}</span>
              <span className="text-gray-500 text-xs">
                <span className="text-gray-300">{node.sent}</span> sent &nbsp;·&nbsp;
                <span className="text-gray-300">{node.received}</span> received
              </span>
              {outgoing.length > 0 && (
                <span className="text-gray-600 text-xs">
                  Top to:{" "}
                  {outgoing.slice(0, 3).map((l, i) => {
                    const name = nodes.find((n) => n.id === l.toId)?.name ?? `#${l.toId}`;
                    return (
                      <span key={l.toId}>
                        {i > 0 && ", "}
                        <span className="text-gray-400">{name}</span>
                        <span className="text-gray-600"> ×{l.count}</span>
                      </span>
                    );
                  })}
                </span>
              )}
              {incoming.length > 0 && (
                <span className="text-gray-600 text-xs">
                  Top from:{" "}
                  {incoming.slice(0, 3).map((l, i) => {
                    const name = nodes.find((n) => n.id === l.fromId)?.name ?? `#${l.fromId}`;
                    return (
                      <span key={l.fromId}>
                        {i > 0 && ", "}
                        <span className="text-gray-400">{name}</span>
                        <span className="text-gray-600"> ×{l.count}</span>
                      </span>
                    );
                  })}
                </span>
              )}
            </div>
          );
        })() : (
          <p className="text-xs text-gray-700">Hover a node to see connections</p>
        )}
      </div>
    </div>
  );
}
