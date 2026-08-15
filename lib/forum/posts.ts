import type { Post } from "@/types";
import { getDb, POSTS_PER_PAGE, rowToPost } from "./db";
import type { PostRow } from "./db";

export function getFirstPost(topicId: number): Post | null {
  const db = getDb();
  if (!db) return null;
  const row = db
    .prepare("SELECT * FROM posts WHERE topic_id = ? ORDER BY created_at ASC LIMIT 1")
    .get(topicId) as PostRow | undefined;
  return row ? rowToPost(row) : null;
}

export function getPosts(
  topicId: number,
  opts: { page?: number; query?: string } = {},
): { posts: Post[]; total: number } {
  const db = getDb();
  if (!db) return { posts: [], total: 0 };
  const page = Math.max(1, opts.page ?? 1);
  const query = opts.query?.trim() ?? "";

  const params: (string | number)[] = [topicId];
  let where = "WHERE topic_id = ?";

  if (query) {
    where += " AND content_html LIKE ?";
    params.push(`%${query}%`);
  }

  const { count } = db
    .prepare(`SELECT COUNT(*) as count FROM posts ${where}`)
    .get(...params) as { count: number };

  const rows = db
    .prepare(`SELECT * FROM posts ${where} ORDER BY created_at ASC LIMIT ? OFFSET ?`)
    .all(...params, POSTS_PER_PAGE, (page - 1) * POSTS_PER_PAGE) as PostRow[];

  return { posts: rows.map(rowToPost), total: count };
}
