import allowlist from "@/config/forum-allowlist.json";
import redactionsConfig from "@/config/redactions.json";
import type { Forum, Post, Topic } from "@/types";
import Database from "better-sqlite3";

export type Redactions = {
  topics: number[];
  posts: number[];
  users: number[];
};

export const redactions = redactionsConfig as Redactions;
export const allowedIds = allowlist as number[];

export const TOPICS_PER_PAGE = 50;
export const POSTS_PER_PAGE = 20;
export const SEARCH_TOPICS_PER_PAGE = 20;
export const SEARCH_POSTS_PER_PAGE = 10;
export const USER_SEARCH_LIMIT = 8;

let _db: Database.Database | "unavailable" | null = null;

export function getDb(): Database.Database | null {
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

export function tableExists(db: Database.Database, table: string): boolean {
  return db.prepare(`SELECT 1 FROM pragma_table_info('${table}') LIMIT 1`).get() !== undefined;
}

export function hasColumn(db: Database.Database, table: string, column: string): boolean {
  return (
    db.prepare(`SELECT 1 FROM pragma_table_info('${table}') WHERE name='${column}'`).get() !==
    undefined
  );
}

export function allowedForumsClause(column = "forum_id"): { sql: string; params: number[] } {
  return {
    sql: `${column} IN (${allowedIds.map(() => "?").join(",")})`,
    params: [...allowedIds],
  };
}

export type ForumRow = {
  id: number;
  parent_id: number | null;
  name: string;
  description: string | null;
  topic_count: number | null;
  post_count: number | null;
  display_order: number | null;
};

export type TopicRow = {
  id: number;
  forum_id: number;
  title: string;
  author_id: number | null;
  last_poster_id: number | null;
  post_count: number | null;
  participant_count?: number | null;
  created_at: number | null;
  last_post_at: number | null;
  is_sticky: number;
  is_locked?: number;
  locked_by_id?: number | null;
  locked_at?: number | null;
};

export type PostRow = {
  id: number;
  topic_id: number;
  author_id: number | null;
  content_html: string;
  created_at: number;
};

export type TopicSearchRow = TopicRow & { forum_name: string };
export type PostSearchRow = PostRow & {
  topic_title: string;
  forum_id: number;
  forum_name: string;
  post_index: number;
};

export function rowToForum(r: ForumRow): Forum {
  return {
    id: r.id,
    parentId: r.parent_id,
    name: r.name,
    description: r.description ?? null,
    topicCount: r.topic_count ?? 0,
    postCount: r.post_count ?? 0,
  };
}

export function rowToTopic(r: TopicRow): Topic {
  return {
    id: r.id,
    forumId: r.forum_id,
    title: r.title,
    authorId: r.author_id,
    lastPosterId: r.last_poster_id ?? null,
    postCount: r.post_count ?? 0,
    participantCount: r.participant_count ?? 0,
    createdAt: r.created_at ?? 0,
    lastPostAt: r.last_post_at ?? 0,
    isSticky: r.is_sticky === 1,
    isLocked: (r.is_locked ?? 0) === 1,
    lockedById: r.locked_by_id ?? null,
    lockedAt: r.locked_at ?? null,
  };
}

export function rowToPost(r: PostRow): Post {
  return {
    id: r.id,
    topicId: r.topic_id,
    authorId: r.author_id,
    contentHtml: r.content_html,
    createdAt: r.created_at,
  };
}
