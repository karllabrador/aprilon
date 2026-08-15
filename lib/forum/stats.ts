import { allowedForumsClause, allowedIds, getDb, tableExists } from "./db";

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

  const postsClause = allowedForumsClause("t.forum_id");
  const { posts } = db
    .prepare(
      `SELECT COUNT(*) AS posts FROM posts p
       JOIN topics t ON p.topic_id = t.id
       WHERE p.author_id = ? AND ${postsClause.sql}`,
    )
    .get(userId, ...postsClause.params) as { posts: number };

  const topicsClause = allowedForumsClause("forum_id");
  const { topics } = db
    .prepare(`SELECT COUNT(*) AS topics FROM topics WHERE author_id = ? AND ${topicsClause.sql}`)
    .get(userId, ...topicsClause.params) as { topics: number };

  return { posts, topics };
}

export function getUserActivity(userId: number): ActivityBucket[] {
  if (allowedIds.length === 0) return generateBuckets([], []);
  const db = getDb();
  if (!db) return generateBuckets([], []);

  const topicsClause = allowedForumsClause("forum_id");
  const topicRows = db
    .prepare(
      `SELECT strftime('%Y-%m', datetime(created_at, 'unixepoch')) AS period, COUNT(*) AS count
       FROM topics WHERE author_id = ? AND ${topicsClause.sql} GROUP BY period`,
    )
    .all(userId, ...topicsClause.params) as { period: string; count: number }[];

  const postsClause = allowedForumsClause("t.forum_id");
  const postRows = db
    .prepare(
      `SELECT strftime('%Y-%m', datetime(p.created_at, 'unixepoch')) AS period, COUNT(*) AS count
       FROM posts p JOIN topics t ON p.topic_id = t.id
       WHERE p.author_id = ? AND ${postsClause.sql} GROUP BY period`,
    )
    .all(userId, ...postsClause.params) as { period: string; count: number }[];

  return generateBuckets(topicRows, postRows);
}

export function getUserForumActivity(userId: number): ForumActivitySlice[] {
  if (allowedIds.length === 0) return [];
  const db = getDb();
  if (!db) return [];
  const { sql, params } = allowedForumsClause("t.forum_id");

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
       WHERE p.author_id = ? AND ${sql}
       GROUP BY t.forum_id ORDER BY post_count DESC`,
    )
    .all(userId, ...params) as Row[];

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
  const { sql, params } = allowedForumsClause("t.forum_id");

  const postRow = db
    .prepare(
      `SELECT MAX(p.created_at) AS last_post_at
       FROM posts p JOIN topics t ON p.topic_id = t.id
       WHERE p.author_id = ? AND ${sql}`,
    )
    .get(userId, ...params) as { last_post_at: number | null };

  const hasUsersTable = tableExists(db, "users");

  let joinedAt: number | null = null;
  if (hasUsersTable) {
    const userRow = db.prepare("SELECT registered_at FROM users WHERE id = ?").get(userId) as
      | { registered_at: number }
      | undefined;
    joinedAt = userRow?.registered_at ?? null;
  } else {
    const fallback = db
      .prepare(
        `SELECT MIN(p.created_at) AS joined_at
         FROM posts p JOIN topics t ON p.topic_id = t.id
         WHERE p.author_id = ? AND ${sql}`,
      )
      .get(userId, ...params) as { joined_at: number | null };
    joinedAt = fallback.joined_at;
  }

  return { joinedAt, lastPostAt: postRow.last_post_at };
}

export function getArchiveActivity(): ActivityBucket[] {
  if (allowedIds.length === 0) return generateBuckets([], []);
  const db = getDb();
  if (!db) return generateBuckets([], []);

  const topicsClause = allowedForumsClause("forum_id");
  const topicRows = db
    .prepare(
      `SELECT strftime('%Y-%m', datetime(created_at, 'unixepoch')) AS period, COUNT(*) AS count
       FROM topics WHERE ${topicsClause.sql} GROUP BY period`,
    )
    .all(...topicsClause.params) as { period: string; count: number }[];

  const postsClause = allowedForumsClause("t.forum_id");
  const postRows = db
    .prepare(
      `SELECT strftime('%Y-%m', datetime(p.created_at, 'unixepoch')) AS period, COUNT(*) AS count
       FROM posts p JOIN topics t ON p.topic_id = t.id
       WHERE ${postsClause.sql} GROUP BY period`,
    )
    .all(...postsClause.params) as { period: string; count: number }[];

  const hasUsersTable = tableExists(db, "users");

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
