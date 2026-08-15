import { computeDisplayName } from "@/lib/pseudonyms";
import { getDb, tableExists } from "./db";

export type PmNode = {
  id: number;
  name: string;
  sent: number;
  received: number;
};

export type PmLink = {
  fromId: number;
  toId: number;
  count: number;
};

export type PmGraphData = {
  nodes: PmNode[];
  links: PmLink[];
};

export function getPmGraph(minCount = 1): PmGraphData | null {
  const db = getDb();
  if (!db) return null;
  if (!tableExists(db, "pm_relationships")) return null;

  type RelRow = { from_id: number; to_id: number; count: number };
  const rows = db
    .prepare("SELECT from_id, to_id, count FROM pm_relationships WHERE count >= ?")
    .all(minCount) as RelRow[];

  const sent = new Map<number, number>();
  const received = new Map<number, number>();
  for (const r of rows) {
    sent.set(r.from_id, (sent.get(r.from_id) ?? 0) + r.count);
    received.set(r.to_id, (received.get(r.to_id) ?? 0) + r.count);
  }

  const nodeIds = new Set([...sent.keys(), ...received.keys()]);
  const nodes: PmNode[] = Array.from(nodeIds).map((id) => ({
    id,
    name: computeDisplayName(id),
    sent: sent.get(id) ?? 0,
    received: received.get(id) ?? 0,
  }));

  return {
    nodes,
    links: rows.map((r) => ({ fromId: r.from_id, toId: r.to_id, count: r.count })),
  };
}
