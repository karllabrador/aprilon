import { computeDisplayName } from "@/lib/pseudonyms";
import type { Post, Topic } from "@/types";
import {
  allowedForumsClause,
  allowedIds,
  getDb,
  redactions,
  rowToPost,
  rowToTopic,
  SEARCH_POSTS_PER_PAGE,
  SEARCH_TOPICS_PER_PAGE,
  USER_SEARCH_LIMIT,
} from "./db";
import type { PostSearchRow, TopicSearchRow } from "./db";

export type TopicSearchResult = Topic & { forumName: string };
export type PostSearchResult = Post & {
  topicTitle: string;
  forumId: number;
  forumName: string;
  postIndex: number;
};
export type UserSearchResult = {
  id: number;
  displayName: string;
  postCount: number;
  topicCount: number;
};

export function searchTopics(
  query: string,
  opts: { page?: number; userId?: number } = {},
): { results: TopicSearchResult[]; total: number } {
  if (allowedIds.length === 0) return { results: [], total: 0 };
  if (!query.trim() && !opts.userId) return { results: [], total: 0 };
  const db = getDb();
  if (!db) return { results: [], total: 0 };
  const page = Math.max(1, opts.page ?? 1);
  const q = query.trim();

  const forumsClause = allowedForumsClause("t.forum_id");
  const params: (string | number)[] = [...forumsClause.params];
  let where = `WHERE ${forumsClause.sql}`;

  if (q) {
    where += " AND t.title LIKE ?";
    params.push(`%${q}%`);
  }
  if (opts.userId) {
    where += " AND t.author_id = ?";
    params.push(opts.userId);
  }

  const { count } = db
    .prepare(`SELECT COUNT(*) as count FROM topics t ${where}`)
    .get(...params) as { count: number };

  const rows = db
    .prepare(
      `SELECT t.*, f.name AS forum_name
       FROM topics t JOIN forums f ON t.forum_id = f.id
       ${where}
       ORDER BY t.last_post_at DESC LIMIT ? OFFSET ?`,
    )
    .all(...params, SEARCH_TOPICS_PER_PAGE, (page - 1) * SEARCH_TOPICS_PER_PAGE) as TopicSearchRow[];

  return {
    results: rows.map((r) => ({ ...rowToTopic(r), forumName: r.forum_name })),
    total: count,
  };
}

export function searchPosts(
  query: string,
  opts: { page?: number; userId?: number } = {},
): { results: PostSearchResult[]; total: number } {
  if (allowedIds.length === 0) return { results: [], total: 0 };
  if (!query.trim() && !opts.userId) return { results: [], total: 0 };
  const db = getDb();
  if (!db) return { results: [], total: 0 };
  const page = Math.max(1, opts.page ?? 1);
  const q = query.trim();

  const forumsClause = allowedForumsClause("t.forum_id");
  const params: (string | number)[] = [...forumsClause.params];
  let where = `WHERE ${forumsClause.sql}`;

  const redactedPostIds = redactions.posts;
  if (redactedPostIds.length > 0) {
    where += ` AND p.id NOT IN (${redactedPostIds.map(() => "?").join(",")})`;
    params.push(...redactedPostIds);
  }

  if (q) {
    where += " AND p.content_html LIKE ?";
    params.push(`%${q}%`);
  }
  if (opts.userId) {
    where += " AND p.author_id = ?";
    params.push(opts.userId);
  }

  const { count } = db
    .prepare(`SELECT COUNT(*) as count FROM posts p JOIN topics t ON p.topic_id = t.id ${where}`)
    .get(...params) as { count: number };

  const rows = db
    .prepare(
      `SELECT p.*, t.title AS topic_title, t.forum_id, f.name AS forum_name,
        (SELECT COUNT(*) FROM posts p2 WHERE p2.topic_id = p.topic_id AND p2.id <= p.id) AS post_index
       FROM posts p
       JOIN topics t ON p.topic_id = t.id
       JOIN forums f ON t.forum_id = f.id
       ${where}
       ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
    )
    .all(...params, SEARCH_POSTS_PER_PAGE, (page - 1) * SEARCH_POSTS_PER_PAGE) as PostSearchRow[];

  return {
    results: rows.map((r) => ({
      ...rowToPost(r),
      topicTitle: r.topic_title,
      forumId: r.forum_id,
      forumName: r.forum_name,
      postIndex: r.post_index,
    })),
    total: count,
  };
}

export function searchUsers(query: string): UserSearchResult[] {
  if (!query.trim() || allowedIds.length === 0) return [];
  const db = getDb();
  if (!db) return [];
  const forumsClause = allowedForumsClause("t.forum_id");

  type Row = { author_id: number; post_count: number; topic_count: number };
  const rows = db
    .prepare(
      `SELECT p.author_id,
              COUNT(p.id) AS post_count,
              COUNT(DISTINCT t.id) AS topic_count
       FROM posts p JOIN topics t ON p.topic_id = t.id
       WHERE p.author_id IS NOT NULL AND p.author_id != 1 AND ${forumsClause.sql}
       GROUP BY p.author_id`,
    )
    .all(...forumsClause.params) as Row[];

  const q = query.trim().toLowerCase();
  return rows
    .map((r) => ({
      id: r.author_id,
      displayName: computeDisplayName(r.author_id),
      postCount: r.post_count,
      topicCount: r.topic_count,
    }))
    .filter((u) => u.displayName.toLowerCase().includes(q) || String(u.id) === q)
    .slice(0, USER_SEARCH_LIMIT);
}
