import type { Forum } from "@/types";
import { allowedForumsClause, allowedIds, getDb, hasColumn, rowToForum } from "./db";
import type { ForumRow } from "./db";

export function getAllowedForums(): Forum[] {
  if (allowedIds.length === 0) return [];
  const db = getDb();
  if (!db) return [];
  const { sql, params } = allowedForumsClause("id");
  const hasDisplayOrder = hasColumn(db, "forums", "display_order");
  const rows = db
    .prepare(`SELECT * FROM forums WHERE ${sql}${hasDisplayOrder ? " ORDER BY display_order ASC" : ""}`)
    .all(...params) as ForumRow[];
  if (hasDisplayOrder) return rows.map(rowToForum);
  // Fallback: preserve allowlist order
  const byId = new Map(rows.map((r) => [r.id, r]));
  return allowedIds.flatMap((id) => {
    const r = byId.get(id);
    return r ? [rowToForum(r)] : [];
  });
}

export function getForum(id: number): Forum | null {
  if (!allowedIds.includes(id)) return null;
  const db = getDb();
  if (!db) return null;
  const row = db.prepare("SELECT * FROM forums WHERE id = ?").get(id) as ForumRow | undefined;
  return row ? rowToForum(row) : null;
}

export type ForumCrumb = { id: number; name: string; linked: boolean };

export function getForumPath(forumId: number): ForumCrumb[] {
  const db = getDb();
  if (!db) return [];
  const path: ForumCrumb[] = [];
  let id: number | null = forumId;
  while (id !== null && id > 0) {
    const row = db
      .prepare("SELECT id, parent_id, name FROM forums WHERE id = ?")
      .get(id) as { id: number; parent_id: number | null; name: string } | undefined;
    if (!row) break;
    path.unshift({ id: row.id, name: row.name, linked: allowedIds.includes(row.id) });
    id = row.parent_id && row.parent_id > 0 ? row.parent_id : null;
  }
  return path;
}

export function getTrashcanCounterpart(forumName: string): Forum | null {
  const db = getDb();
  if (!db) return null;
  const row = db
    .prepare(
      `SELECT f.id FROM forums f
       JOIN forums p ON f.parent_id = p.id
       WHERE LOWER(p.name) = 'trashcan' AND LOWER(f.name) = LOWER(?)
       LIMIT 1`,
    )
    .get(forumName) as { id: number } | undefined;
  if (!row) return null;
  return getForum(row.id); // returns null if not in allowlist
}
