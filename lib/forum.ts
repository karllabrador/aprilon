import allowlist from "@/config/forum-allowlist.json";
import redactionsConfig from "@/config/redactions.json";
import { computeDisplayName } from "@/lib/pseudonyms";
import type { Forum, Post, Topic } from "@/types";
import Database from "better-sqlite3";

type Redactions = {
  topics: number[];
  posts: number[];
  users: number[];
};

const redactions = redactionsConfig as Redactions;
const allowedIds = allowlist as number[];

export const TOPICS_PER_PAGE = 50;
export const POSTS_PER_PAGE = 20;
export const SEARCH_TOPICS_PER_PAGE = 20;
export const SEARCH_POSTS_PER_PAGE = 10;

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

export const USER_SEARCH_LIMIT = 8;

let _db: Database.Database | "unavailable" | null = null;

function getDb(): Database.Database | null {
  if (_db === "unavailable") return null;
  if (_db !== null) return _db;

  const dbPath = process.env.ARCHIVE_DB_PATH;
  if (!dbPath) {
    console.warn("[archive] ARCHIVE_DB_PATH is not set — archive disabled");
    _db = "unavailable";
    return null;
  }

  try {
    const db = new Database(dbPath, { readonly: true });
    _db = db;
    return db;
  } catch (err) {
    console.warn(`[archive] Could not open database at "${dbPath}" — archive disabled`, err);
    _db = "unavailable";
    return null;
  }
}

type ForumRow = {
  id: number;
  parent_id: number | null;
  name: string;
  description: string | null;
  topic_count: number | null;
  post_count: number | null;
  display_order: number | null;
};

type TopicRow = {
  id: number;
  forum_id: number;
  title: string;
  author_id: number | null;
  last_poster_id: number | null;
  post_count: number | null;
  created_at: number | null;
  last_post_at: number | null;
  is_sticky: number;
};

type PostRow = {
  id: number;
  topic_id: number;
  author_id: number | null;
  content_html: string;
  created_at: number;
};

type TopicSearchRow = TopicRow & { forum_name: string };
type PostSearchRow = PostRow & {
  topic_title: string;
  forum_id: number;
  forum_name: string;
  post_index: number;
};

function rowToForum(r: ForumRow): Forum {
  return {
    id: r.id,
    parentId: r.parent_id,
    name: r.name,
    description: r.description ?? null,
    topicCount: r.topic_count ?? 0,
    postCount: r.post_count ?? 0,
  };
}

function rowToTopic(r: TopicRow): Topic {
  return {
    id: r.id,
    forumId: r.forum_id,
    title: r.title,
    authorId: r.author_id,
    lastPosterId: r.last_poster_id ?? null,
    postCount: r.post_count ?? 0,
    createdAt: r.created_at ?? 0,
    lastPostAt: r.last_post_at ?? 0,
    isSticky: r.is_sticky === 1,
  };
}

function rowToPost(r: PostRow): Post {
  return {
    id: r.id,
    topicId: r.topic_id,
    authorId: r.author_id,
    contentHtml: r.content_html,
    createdAt: r.created_at,
  };
}

export function getAllowedForums(): Forum[] {
  if (allowedIds.length === 0) return [];
  const db = getDb();
  if (!db) return [];
  const placeholders = allowedIds.map(() => "?").join(",");
  const hasDisplayOrder =
    db
      .prepare(
        "SELECT 1 FROM pragma_table_info('forums') WHERE name='display_order'",
      )
      .get() !== undefined;
  const rows = db
    .prepare(
      `SELECT * FROM forums WHERE id IN (${placeholders})${hasDisplayOrder ? " ORDER BY display_order ASC" : ""}`,
    )
    .all(...allowedIds) as ForumRow[];
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
  const row = db.prepare("SELECT * FROM forums WHERE id = ?").get(id) as
    | ForumRow
    | undefined;
  return row ? rowToForum(row) : null;
}

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
    .all(
      ...params,
      TOPICS_PER_PAGE,
      (page - 1) * TOPICS_PER_PAGE,
    ) as TopicRow[];

  return { topics: rows.map(rowToTopic), total: count };
}

export function getTopic(id: number): Topic | null {
  const db = getDb();
  if (!db) return null;
  const row = db.prepare("SELECT * FROM topics WHERE id = ?").get(id) as
    | TopicRow
    | undefined;
  if (!row) return null;
  if (!allowedIds.includes(row.forum_id)) return null;
  return rowToTopic(row);
}

export function getFirstPost(topicId: number): Post | null {
  const db = getDb();
  if (!db) return null;
  const row = db
    .prepare(
      "SELECT * FROM posts WHERE topic_id = ? ORDER BY created_at ASC LIMIT 1",
    )
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
    .prepare(
      `SELECT * FROM posts ${where} ORDER BY created_at ASC LIMIT ? OFFSET ?`,
    )
    .all(...params, POSTS_PER_PAGE, (page - 1) * POSTS_PER_PAGE) as PostRow[];

  return { posts: rows.map(rowToPost), total: count };
}

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

  const placeholders = allowedIds.map(() => "?").join(",");
  const params: (string | number)[] = [...allowedIds];
  let where = `WHERE t.forum_id IN (${placeholders})`;

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
    .all(
      ...params,
      SEARCH_TOPICS_PER_PAGE,
      (page - 1) * SEARCH_TOPICS_PER_PAGE,
    ) as TopicSearchRow[];

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

  const placeholders = allowedIds.map(() => "?").join(",");
  const params: (string | number)[] = [...allowedIds];
  let where = `WHERE t.forum_id IN (${placeholders})`;

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
    .prepare(
      `SELECT COUNT(*) as count FROM posts p JOIN topics t ON p.topic_id = t.id ${where}`,
    )
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
    .all(
      ...params,
      SEARCH_POSTS_PER_PAGE,
      (page - 1) * SEARCH_POSTS_PER_PAGE,
    ) as PostSearchRow[];

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
  const ph = allowedIds.map(() => "?").join(",");

  type Row = { author_id: number; post_count: number; topic_count: number };
  const rows = db
    .prepare(
      `SELECT p.author_id,
              COUNT(p.id) AS post_count,
              COUNT(DISTINCT t.id) AS topic_count
       FROM posts p JOIN topics t ON p.topic_id = t.id
       WHERE p.author_id IS NOT NULL AND p.author_id != 1 AND t.forum_id IN (${ph})
       GROUP BY p.author_id`,
    )
    .all(...allowedIds) as Row[];

  const q = query.trim().toLowerCase();
  return rows
    .map((r) => ({
      id: r.author_id,
      displayName: computeDisplayName(r.author_id),
      postCount: r.post_count,
      topicCount: r.topic_count,
    }))
    .filter(
      (u) => u.displayName.toLowerCase().includes(q) || String(u.id) === q,
    )
    .slice(0, USER_SEARCH_LIMIT);
}

export type ActivityBucket = {
  period: string;
  topicCount: number;
  postCount: number;
  newUserCount: number;
};

export type ForumActivitySlice = {
  forumId: number;
  forumName: string;
  postCount: number;
  topicCount: number;
};

const ACTIVITY_START = "2009-01";
const ACTIVITY_END = "2016-12";

function generateBuckets(
  topicRows: { period: string; count: number }[],
  postRows: { period: string; count: number }[],
  userRows: { period: string; count: number }[] = [],
): ActivityBucket[] {
  const topicMap = new Map(topicRows.map((r) => [r.period, r.count]));
  const postMap = new Map(postRows.map((r) => [r.period, r.count]));
  const userMap = new Map(userRows.map((r) => [r.period, r.count]));
  const buckets: ActivityBucket[] = [];
  let [y, m] = ACTIVITY_START.split("-").map(Number);
  const [ey, em] = ACTIVITY_END.split("-").map(Number);
  while (y < ey || (y === ey && m <= em)) {
    const period = `${y}-${String(m).padStart(2, "0")}`;
    buckets.push({
      period,
      topicCount: topicMap.get(period) ?? 0,
      postCount: postMap.get(period) ?? 0,
      newUserCount: userMap.get(period) ?? 0,
    });
    if (++m > 12) {
      m = 1;
      y++;
    }
  }
  return buckets;
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

export function getTopTopics(forumId: number, limit = 3): Topic[] {
  if (!allowedIds.includes(forumId)) return [];
  const db = getDb();
  if (!db) return [];

  const rows = db
    .prepare(`SELECT * FROM topics WHERE forum_id = ? ORDER BY post_count DESC LIMIT ?`)
    .all(forumId, limit) as TopicRow[];
  return rows.map(rowToTopic);
}

export function getForumActivity(forumId: number): ActivityBucket[] {
  if (!allowedIds.includes(forumId)) return generateBuckets([], []);
  const db = getDb();
  if (!db) return generateBuckets([], []);

  const topicRows = db
    .prepare(
      `SELECT strftime('%Y-%m', datetime(created_at, 'unixepoch')) AS period, COUNT(*) AS count
       FROM topics WHERE forum_id = ? GROUP BY period`,
    )
    .all(forumId) as { period: string; count: number }[];

  const postRows = db
    .prepare(
      `SELECT strftime('%Y-%m', datetime(p.created_at, 'unixepoch')) AS period, COUNT(*) AS count
       FROM posts p JOIN topics t ON p.topic_id = t.id
       WHERE t.forum_id = ? GROUP BY period`,
    )
    .all(forumId) as { period: string; count: number }[];

  return generateBuckets(topicRows, postRows);
}

export function getUserStats(userId: number): {
  posts: number;
  topics: number;
} {
  if (allowedIds.length === 0) return { posts: 0, topics: 0 };
  const db = getDb();
  if (!db) return { posts: 0, topics: 0 };
  const ph = allowedIds.map(() => "?").join(",");

  const { posts } = db
    .prepare(
      `SELECT COUNT(*) AS posts FROM posts p
       JOIN topics t ON p.topic_id = t.id
       WHERE p.author_id = ? AND t.forum_id IN (${ph})`,
    )
    .get(userId, ...allowedIds) as { posts: number };

  const { topics } = db
    .prepare(
      `SELECT COUNT(*) AS topics FROM topics WHERE author_id = ? AND forum_id IN (${ph})`,
    )
    .get(userId, ...allowedIds) as { topics: number };

  return { posts, topics };
}

export function getUserActivity(userId: number): ActivityBucket[] {
  if (allowedIds.length === 0) return generateBuckets([], []);
  const db = getDb();
  if (!db) return generateBuckets([], []);
  const ph = allowedIds.map(() => "?").join(",");

  const tParams: (string | number)[] = [userId, ...allowedIds];
  const tWhere = `WHERE author_id = ? AND forum_id IN (${ph})`;

  const topicRows = db
    .prepare(
      `SELECT strftime('%Y-%m', datetime(created_at, 'unixepoch')) AS period, COUNT(*) AS count
       FROM topics ${tWhere} GROUP BY period`,
    )
    .all(...tParams) as { period: string; count: number }[];

  const postRows = db
    .prepare(
      `SELECT strftime('%Y-%m', datetime(p.created_at, 'unixepoch')) AS period, COUNT(*) AS count
       FROM posts p JOIN topics t ON p.topic_id = t.id
       WHERE p.author_id = ? AND t.forum_id IN (${ph}) GROUP BY period`,
    )
    .all(userId, ...allowedIds) as { period: string; count: number }[];

  return generateBuckets(topicRows, postRows);
}

export function getUserForumActivity(userId: number): ForumActivitySlice[] {
  if (allowedIds.length === 0) return [];
  const db = getDb();
  if (!db) return [];
  const ph = allowedIds.map(() => "?").join(",");

  type Row = {
    forum_id: number;
    forum_name: string;
    post_count: number;
    topic_count: number;
  };
  const rows = db
    .prepare(
      `SELECT t.forum_id, f.name AS forum_name,
              COUNT(p.id) AS post_count, COUNT(DISTINCT t.id) AS topic_count
       FROM posts p
       JOIN topics t ON p.topic_id = t.id
       JOIN forums f ON t.forum_id = f.id
       WHERE p.author_id = ? AND t.forum_id IN (${ph})
       GROUP BY t.forum_id ORDER BY post_count DESC`,
    )
    .all(userId, ...allowedIds) as Row[];

  return rows.map((r) => ({
    forumId: r.forum_id,
    forumName: r.forum_name,
    postCount: r.post_count,
    topicCount: r.topic_count,
  }));
}

export function getUserDates(userId: number): {
  joinedAt: number | null;
  lastPostAt: number | null;
} {
  if (allowedIds.length === 0) return { joinedAt: null, lastPostAt: null };
  const db = getDb();
  if (!db) return { joinedAt: null, lastPostAt: null };
  const ph = allowedIds.map(() => "?").join(",");

  const postRow = db
    .prepare(
      `SELECT MAX(p.created_at) AS last_post_at
       FROM posts p JOIN topics t ON p.topic_id = t.id
       WHERE p.author_id = ? AND t.forum_id IN (${ph})`,
    )
    .get(userId, ...allowedIds) as { last_post_at: number | null };

  const hasUsersTable =
    db.prepare("SELECT 1 FROM pragma_table_info('users') LIMIT 1").get() !== undefined;

  let joinedAt: number | null = null;
  if (hasUsersTable) {
    const userRow = db
      .prepare("SELECT registered_at FROM users WHERE id = ?")
      .get(userId) as { registered_at: number } | undefined;
    joinedAt = userRow?.registered_at ?? null;
  } else {
    const fallback = db
      .prepare(
        `SELECT MIN(p.created_at) AS joined_at
         FROM posts p JOIN topics t ON p.topic_id = t.id
         WHERE p.author_id = ? AND t.forum_id IN (${ph})`,
      )
      .get(userId, ...allowedIds) as { joined_at: number | null };
    joinedAt = fallback.joined_at;
  }

  return { joinedAt, lastPostAt: postRow.last_post_at };
}

export function getArchiveActivity(): ActivityBucket[] {
  if (allowedIds.length === 0) return generateBuckets([], []);
  const db = getDb();
  if (!db) return generateBuckets([], []);
  const ph = allowedIds.map(() => "?").join(",");

  const tParams: (string | number)[] = [...allowedIds];
  const tWhere = `WHERE forum_id IN (${ph})`;

  const topicRows = db
    .prepare(
      `SELECT strftime('%Y-%m', datetime(created_at, 'unixepoch')) AS period, COUNT(*) AS count
       FROM topics ${tWhere} GROUP BY period`,
    )
    .all(...tParams) as { period: string; count: number }[];

  const postRows = db
    .prepare(
      `SELECT strftime('%Y-%m', datetime(p.created_at, 'unixepoch')) AS period, COUNT(*) AS count
       FROM posts p JOIN topics t ON p.topic_id = t.id
       WHERE t.forum_id IN (${ph}) GROUP BY period`,
    )
    .all(...allowedIds) as { period: string; count: number }[];

  const hasUsersTable =
    db.prepare("SELECT 1 FROM pragma_table_info('users') LIMIT 1").get() !== undefined;

  const userRows = hasUsersTable
    ? (db
        .prepare(
          `SELECT strftime('%Y-%m', datetime(registered_at, 'unixepoch')) AS period, COUNT(*) AS count
           FROM users WHERE registered_at > 0 GROUP BY period`,
        )
        .all() as { period: string; count: number }[])
    : [];

  return generateBuckets(topicRows, postRows, userRows);
}

export { redactions };
export type { Redactions };
