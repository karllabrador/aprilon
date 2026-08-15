import type { Topic } from "@/types";
import { allowedIds, getDb, rowToTopic, TOPICS_PER_PAGE } from "./db";
import type { TopicRow } from "./db";
import { getAllowedForums } from "./forums";

export function getTopics(
  forumId: number,
  opts: { page?: number; query?: string } = {},
): { topics: Topic[]; total: number } {
  if (!allowedIds.includes(forumId)) return { topics: [], total: 0 };
  const db = getDb();
  if (!db) return { topics: [], total: 0 };
  const page = Math.max(1, opts.page ?? 1);
  const query = opts.query?.trim() ?? "";

  const params: (string | number)[] = [forumId];
  let where = "WHERE forum_id = ?";

  if (query) {
    where += " AND title LIKE ?";
    params.push(`%${query}%`);
  }

  const { count } = db
    .prepare(`SELECT COUNT(*) as count FROM topics ${where}`)
    .get(...params) as { count: number };

  const rows = db
    .prepare(
      `SELECT * FROM topics ${where} ORDER BY is_sticky DESC, last_post_at DESC LIMIT ? OFFSET ?`,
    )
    .all(...params, TOPICS_PER_PAGE, (page - 1) * TOPICS_PER_PAGE) as TopicRow[];

  return { topics: rows.map(rowToTopic), total: count };
}

export function getTopic(id: number): Topic | null {
  const db = getDb();
  if (!db) return null;
  const row = db.prepare("SELECT * FROM topics WHERE id = ?").get(id) as TopicRow | undefined;
  if (!row) return null;
  if (!allowedIds.includes(row.forum_id)) return null;
  return rowToTopic(row);
}

export function getTopTopics(forumId: number, limit = 3): Topic[] {
  if (!allowedIds.includes(forumId)) return [];
  const db = getDb();
  if (!db) return [];

  const rows = db
    .prepare(`SELECT * FROM topics WHERE forum_id = ? ORDER BY post_count DESC LIMIT ?`)
    .all(forumId, limit) as TopicRow[];
  return rows.map(rowToTopic);
}

export function getTopicIdsForPosts(postIds: number[]): number[] {
  if (!postIds.length) return [];
  const db = getDb();
  if (!db) return [];
  const placeholders = postIds.map(() => "?").join(",");
  const rows = db
    .prepare(`SELECT DISTINCT topic_id FROM posts WHERE id IN (${placeholders})`)
    .all(...postIds) as Array<{ topic_id: number }>;
  return rows.map((r) => r.topic_id);
}

export function getAllTopicsForSitemap(): { id: number; title: string; lastPostAt: number }[] {
  const forums = getAllowedForums();
  if (!forums.length) return [];
  const db = getDb();
  if (!db) return [];
  const placeholders = forums.map(() => "?").join(",");
  const rows = db
    .prepare(
      `SELECT id, title, last_post_at FROM topics WHERE forum_id IN (${placeholders}) ORDER BY last_post_at DESC`,
    )
    .all(...forums.map((f) => f.id)) as Array<{ id: number; title: string; last_post_at: number }>;
  return rows.map((r) => ({ id: r.id, title: r.title, lastPostAt: r.last_post_at }));
}
