/**
 * Migrates a phpBB3 mysqldump .sql file into a SQLite database.
 * Usage: npx tsx scripts/migrate-forum.ts <path-to-dump.sql> [output.db]
 *
 * Reads INSERT statements for phpbb_forums, phpbb_topics, phpbb_posts.
 * Converts post BBCode to sanitized HTML. Usernames are not stored.
 */

import Database from "better-sqlite3";
import * as fs from "fs";
import * as path from "path";
import { computeDisplayName } from "../lib/pseudonyms";

const dumpPath = process.argv[2];
const dbPath = process.argv[3] ?? process.env.DATABASE_PATH ?? "data/forum.db";

if (!dumpPath) {
  console.error(
    "Usage: npx tsx scripts/migrate-forum.ts <dump.sql> [output.db]",
  );
  process.exit(1);
}

if (!fs.existsSync(dumpPath)) {
  console.error(`File not found: ${dumpPath}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// HTML entity decoding (phpBB3 stores forum names / topic titles encoded)
// ---------------------------------------------------------------------------

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) =>
      String.fromCharCode(parseInt(h, 16)),
    );
}

// ---------------------------------------------------------------------------
// YouTube helpers
// ---------------------------------------------------------------------------

function extractYouTubeId(input: string): string | null {
  const s = input.trim();
  const m = s.match(
    /(?:youtube\.com\/(?:watch[^#"]*?[?&]v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  if (m) return m[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  return null;
}

function youTubeEmbed(id: string): string {
  return `<div class="yt-embed"><iframe src="https://www.youtube.com/embed/${id}" allowfullscreen loading="lazy" title="YouTube video"></iframe></div>`;
}

// ---------------------------------------------------------------------------
// BBCode → HTML conversion
// ---------------------------------------------------------------------------

function bbcodeToHtml(raw: string, uid: string): string {
  // Strip phpBB3 uid suffix from tags: [b:uid] → [b]
  let s = uid ? raw.replace(new RegExp(`:(${uid})`, "g"), "") : raw;

  // Handle nested quotes FIRST (before the catch-all strip that would eat [quote] tags).
  // Innermost-first loop: content pattern (?:(?!\[quote)[\s\S])*? matches chars that
  // don't start a new [quote, so we only match the innermost un-nested quote each pass.
  let prev = "";
  while (s !== prev) {
    prev = s;
    s = s
      .replace(
        /\[quote=&quot;([^&]*)&quot;\]((?:(?!\[quote)[\s\S])*?)\[\/quote\]/gi,
        '<blockquote data-author="$1">$2</blockquote>',
      )
      .replace(
        /\[quote="([^"]*)"\]((?:(?!\[quote)[\s\S])*?)\[\/quote\]/gi,
        '<blockquote data-author="$1">$2</blockquote>',
      )
      .replace(
        /\[quote\]((?:(?!\[quote)[\s\S])*?)\[\/quote\]/gi,
        "<blockquote>$1</blockquote>",
      );
  }

  // Convert common tags
  s = s
    .replace(/\[b\]([\s\S]*?)\[\/b\]/gi, "<strong>$1</strong>")
    .replace(/\[i\]([\s\S]*?)\[\/i\]/gi, "<em>$1</em>")
    .replace(/\[u\]([\s\S]*?)\[\/u\]/gi, "<u>$1</u>")
    .replace(/\[s\]([\s\S]*?)\[\/s\]/gi, "<s>$1</s>")
    .replace(
      /\[url=([^\]]+)\]([\s\S]*?)\[\/url\]/gi,
      (_, href: string, text: string) => {
        if (/^(javascript|data|vbscript):/i.test(href.trim())) return text;
        return `<a href="${href.trim()}" rel="noopener noreferrer">${text}</a>`;
      },
    )
    .replace(/\[url\]([\s\S]*?)\[\/url\]/gi, (_, href: string) => {
      if (/^(javascript|data|vbscript):/i.test(href.trim())) return href;
      return `<a href="${href.trim()}" rel="noopener noreferrer">${href.trim()}</a>`;
    })
    .replace(
      /\[img\]([\s\S]*?)\[\/img\]/gi,
      '<img src="$1" alt="" loading="lazy">',
    )
    .replace(/\[code\]([\s\S]*?)\[\/code\]/gi, "<pre><code>$1</code></pre>")
    .replace(/\[color=[^\]]+\]([\s\S]*?)\[\/color\]/gi, "$1")
    .replace(/\[size=[^\]]+\]([\s\S]*?)\[\/size\]/gi, "$1")
    .replace(/\[list\]([\s\S]*?)\[\/list\]/gi, "<ul>$1</ul>")
    .replace(/\[list=1\]([\s\S]*?)\[\/list\]/gi, "<ol>$1</ol>")
    .replace(/\[\*\](.*?)(?=\[\*\]|\[\/list\])/gi, "<li>$1</li>")
    .replace(/\[youtube\]([\s\S]*?)\[\/youtube\]/gi, (_, inner) => {
      const id = extractYouTubeId(inner);
      return id ? youTubeEmbed(id) : inner;
    })
    // Strip any remaining unknown BBCode tags
    .replace(/\[[^\]]+\]/g, "");

  // phpBB3 stores newlines as \n — convert to <br>
  s = s.replace(/\r?\n/g, "<br>");

  // Replace phpBB3 smilies path placeholder
  s = s.replace(/\{SMILIES_PATH\}/g, "/images/archive/smilies");

  // Auto-linked YouTube URLs: <a href="https://youtu.be/...">https://...</a>
  s = s.replace(
    /<a\b[^>]*\bhref="(https?:\/\/(?:www\.)?(?:youtube\.com\/watch[^"]*|youtu\.be\/[^"]*?))"[^>]*>https?:\/\/[^<]*<\/a>/gi,
    (match, href) => {
      const id = extractYouTubeId(href);
      return id ? youTubeEmbed(id) : match;
    },
  );

  // Plain-text YouTube URLs not inside an HTML attribute
  s = s.replace(
    /(?<!["'=])(https?:\/\/(?:www\.)?(?:youtube\.com\/watch[^\s<"]*?[?&]v=([a-zA-Z0-9_-]{11})[^\s<"]*|youtu\.be\/([a-zA-Z0-9_-]{11})(?:[?&][^\s<"]*)?))(?![^<]*?>)/g,
    (match, _url, id1, id2) => {
      const id = id1 ?? id2;
      return id ? youTubeEmbed(id) : match;
    },
  );

  return s;
}

// ---------------------------------------------------------------------------
// SQL value tuple parser
// ---------------------------------------------------------------------------
// Parses a single row tuple like (1,'text',NULL,42) → array of string|null
function parseTuple(s: string): (string | null)[] {
  const values: (string | null)[] = [];
  let i = 0;

  while (i < s.length) {
    // skip leading whitespace / comma
    while (i < s.length && (s[i] === " " || s[i] === "\t")) i++;
    if (i >= s.length) break;

    if (s[i] === "'") {
      // quoted string
      i++; // skip opening quote
      let val = "";
      while (i < s.length) {
        if (s[i] === "\\" && i + 1 < s.length) {
          const next = s[i + 1];
          if (next === "'") val += "'";
          else if (next === "\\") val += "\\";
          else if (next === "n") val += "\n";
          else if (next === "r") val += "\r";
          else if (next === "t") val += "\t";
          else val += next;
          i += 2;
        } else if (s[i] === "'") {
          i++; // skip closing quote
          break;
        } else {
          val += s[i++];
        }
      }
      values.push(val);
    } else {
      // unquoted value (number, NULL, hex)
      let val = "";
      while (i < s.length && s[i] !== ",") val += s[i++];
      values.push(val.trim().toUpperCase() === "NULL" ? null : val.trim());
    }

    // skip comma
    while (i < s.length && (s[i] === " " || s[i] === "\t")) i++;
    if (i < s.length && s[i] === ",") i++;
  }

  return values;
}

// Extract all tuples from a VALUES clause, e.g. "(...),(...),(...)"
function parseTuples(valueClause: string): (string | null)[][] {
  const tuples: (string | null)[][] = [];
  let i = 0;

  while (i < valueClause.length) {
    while (i < valueClause.length && valueClause[i] !== "(") i++;
    if (i >= valueClause.length) break;
    i++; // skip (

    // find matching closing paren (handle nested parens not expected in phpBB data,
    // but be safe)
    let depth = 1;
    const start = i;
    while (i < valueClause.length && depth > 0) {
      if (valueClause[i] === "'") {
        // skip string
        i++;
        while (i < valueClause.length) {
          if (valueClause[i] === "\\" && i + 1 < valueClause.length) {
            i += 2;
          } else if (valueClause[i] === "'") {
            i++;
            break;
          } else {
            i++;
          }
        }
      } else if (valueClause[i] === "(") {
        depth++;
        i++;
      } else if (valueClause[i] === ")") {
        depth--;
        if (depth > 0) i++;
        else break;
      } else {
        i++;
      }
    }

    const inner = valueClause.slice(start, i);
    tuples.push(parseTuple(inner));
    i++; // skip )
  }

  return tuples;
}

// ---------------------------------------------------------------------------
// Column extraction helpers for phpBB3 tables
// ---------------------------------------------------------------------------

// phpBB3 column positions (0-indexed) — these are stable across versions
// but we detect them from the CREATE TABLE statement when possible.
// Fallback to known positions for phpBB3.3.x

type ColMap = Record<string, number>;

// Parse column names from a collected CREATE TABLE statement by reading
// line by line. Each data column starts with a backtick; KEY/INDEX lines
// start with keywords and are skipped. Stops at the closing ")".
function detectColumns(createStmt: string): ColMap {
  const colMap: ColMap = {};
  let idx = 0;
  const lines = createStmt.split("\n");
  for (let i = 1; i < lines.length; i++) {
    const trimmed = lines[i].trimStart();
    if (trimmed.startsWith(")")) break; // closing paren of CREATE TABLE
    const m = trimmed.match(/^`([^`]+)`/);
    if (m) colMap[m[1]] = idx++;
  }
  return colMap;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`Reading dump: ${dumpPath}`);

  // Detect table prefix from file
  let tablePrefix = "phpbb_";

  // Collect CREATE TABLE statements and INSERT data per table
  const createStmts: Record<string, string> = {};
  const insertRows: Record<string, (string | null)[][]> = {};

  const targetSuffixes = ["forums", "topics", "posts", "users", "privmsgs_to", "log"];

  // We need to handle multi-line INSERT statements
  // mysqldump usually outputs extended inserts:
  // INSERT INTO `table` VALUES (...),\n(...),\n(...);
  // We read the whole file and process section by section.

  const content = fs.readFileSync(dumpPath, "utf-8");
  const lines = content.split("\n");

  // First pass: detect prefix and collect CREATE TABLE bodies
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trimEnd();
    const createMatch = line.match(/^CREATE TABLE `([^`]+)`/i);
    if (createMatch) {
      const tableName = createMatch[1];
      // detect prefix from first matching table
      for (const suffix of targetSuffixes) {
        if (tableName.endsWith(`_${suffix}`) || tableName === suffix) {
          if (tableName !== suffix) {
            tablePrefix = tableName.slice(0, tableName.length - suffix.length);
          }
        }
      }
      // Collect full CREATE statement — stop when a line starts with ")"
      // (mysqldump ends tables with ") ENGINE=InnoDB...;" not ");")
      let stmt = line;
      let j = i + 1;
      while (j < lines.length && !lines[j].trimStart().startsWith(")")) {
        stmt += "\n" + lines[j];
        j++;
      }
      if (j < lines.length) stmt += "\n" + lines[j]; // include closing ) line
      i = j;
      createStmts[tableName] = stmt;
    }
  }

  console.log(`Detected table prefix: "${tablePrefix}"`);

  // Build target table names
  const targetTables = targetSuffixes.map((s) => `${tablePrefix}${s}`);

  // Second pass: collect INSERT rows
  for (const t of targetTables) insertRows[t] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trimEnd();
    const insertMatch = line.match(/^INSERT INTO `([^`]+)` VALUES /i);
    if (insertMatch) {
      const tableName = insertMatch[1];
      if (targetTables.includes(tableName)) {
        // Collect until line ends with ;
        let fullLine = line;
        while (!fullLine.trimEnd().endsWith(";") && i + 1 < lines.length) {
          i++;
          fullLine += lines[i].trimEnd();
        }
        // Strip INSERT INTO `t` VALUES prefix and trailing ;
        const valuesStr = fullLine
          .replace(/^INSERT INTO `[^`]+` VALUES /i, "")
          .replace(/;$/, "");
        const tuples = parseTuples(valuesStr);
        insertRows[tableName].push(...tuples);
      }
    }
    i++;
  }

  for (const t of targetTables) {
    console.log(`  ${t}: ${insertRows[t].length} rows`);
  }

  // ---------------------------------------------------------------------------
  // Resolve column maps
  // ---------------------------------------------------------------------------

  function col(tableName: string, colName: string, fallback: number): number {
    const map = detectColumns(createStmts[tableName] ?? "");
    return map[colName] ?? fallback;
  }

  // phpBB3.3.x default column positions (0-indexed)
  const forumsTable = `${tablePrefix}forums`;
  const topicsTable = `${tablePrefix}topics`;
  const postsTable = `${tablePrefix}posts`;
  const usersTable = `${tablePrefix}users`;

  // Build username → userId map for quote attribution anonymisation
  const U = {
    user_id: col(usersTable, "user_id", 0),
    username: col(usersTable, "username", 7),
    user_regdate: col(usersTable, "user_regdate", 5),
  };
  const usernameToId = new Map<string, number>();
  const userRegdates = new Map<number, number>();
  for (const r of insertRows[usersTable] ?? []) {
    const uid = Number(r[U.user_id]);
    const uname = r[U.username];
    if (uid > 1 && uname) {
      usernameToId.set(uname.toLowerCase(), uid);
      const regdate = Number(r[U.user_regdate] ?? 0);
      if (regdate > 0) userRegdates.set(uid, regdate);
    }
  }

  // forums: forum_id(0), parent_id(1), left_id(2), right_id(3), ...
  // We'll use column detection; fallback indices are phpBB3.3.x defaults
  const F = {
    forum_id: col(forumsTable, "forum_id", 0),
    parent_id: col(forumsTable, "parent_id", 1),
    left_id: col(forumsTable, "left_id", 2),
    forum_name: col(forumsTable, "forum_name", 5),
    forum_desc: col(forumsTable, "forum_desc", 7),
  };

  const T = {
    topic_id: col(topicsTable, "topic_id", 0),
    forum_id: col(topicsTable, "forum_id", 1),
    topic_poster: col(topicsTable, "topic_poster", 3),
    topic_title: col(topicsTable, "topic_title", 5),
    topic_first_post_id: col(topicsTable, "topic_first_post_id", 6),
    topic_first_poster_name: col(topicsTable, "topic_first_poster_name", 10),
    topic_last_post_time: col(topicsTable, "topic_last_post_time", 12),
    topic_last_poster_id: col(topicsTable, "topic_last_poster_id", 20),
    topic_posts_approved: col(topicsTable, "topic_posts_approved", 17),
    topic_type: col(topicsTable, "topic_type", 25),
    topic_time: col(topicsTable, "topic_time", 4),
    topic_status: col(topicsTable, "topic_status", 24),
  };

  const P = {
    post_id: col(postsTable, "post_id", 0),
    topic_id: col(postsTable, "topic_id", 1),
    forum_id: col(postsTable, "forum_id", 2),
    poster_id: col(postsTable, "poster_id", 3),
    post_time: col(postsTable, "post_time", 6),
    post_text: col(postsTable, "post_text", 14),
    bbcode_uid: col(postsTable, "bbcode_uid", 18),
  };

  // ---------------------------------------------------------------------------
  // Create SQLite database
  // ---------------------------------------------------------------------------

  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  fs.mkdirSync(path.dirname(path.resolve(dbPath)), { recursive: true });

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE forums (
      id INTEGER PRIMARY KEY,
      parent_id INTEGER,
      name TEXT NOT NULL,
      description TEXT,
      topic_count INTEGER DEFAULT 0,
      post_count INTEGER DEFAULT 0,
      display_order INTEGER
    );

    CREATE TABLE topics (
      id INTEGER PRIMARY KEY,
      forum_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      author_id INTEGER,
      last_poster_id INTEGER,
      post_count INTEGER DEFAULT 0,
      participant_count INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      last_post_at INTEGER NOT NULL,
      is_sticky INTEGER DEFAULT 0,
      is_locked INTEGER DEFAULT 0,
      locked_by_id INTEGER,
      locked_at INTEGER
    );
    CREATE INDEX idx_topics_forum ON topics(forum_id, last_post_at DESC);

    CREATE TABLE posts (
      id INTEGER PRIMARY KEY,
      topic_id INTEGER NOT NULL,
      author_id INTEGER,
      content_html TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX idx_posts_topic ON posts(topic_id, created_at ASC);

    CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      registered_at INTEGER NOT NULL
    );
    CREATE INDEX idx_users_registered ON users(registered_at ASC);
  `);

  // ---------------------------------------------------------------------------
  // Insert forums
  // ---------------------------------------------------------------------------

  const insertForum = db.prepare(
    "INSERT INTO forums (id, parent_id, name, description, topic_count, post_count, display_order) VALUES (?,?,?,?,?,?,?)",
  );

  const insertForums = db.transaction((rows: (string | null)[][]) => {
    for (const r of rows) {
      insertForum.run(
        Number(r[F.forum_id]),
        r[F.parent_id] !== null ? Number(r[F.parent_id]) : null,
        decodeHtmlEntities(r[F.forum_name] ?? ""),
        r[F.forum_desc] != null ? decodeHtmlEntities(r[F.forum_desc]!) : null,
        0,
        0,
        r[F.left_id] !== null ? Number(r[F.left_id]) : null,
      );
    }
  });

  insertForums(insertRows[forumsTable]);
  console.log(`Inserted ${insertRows[forumsTable].length} forums`);

  // ---------------------------------------------------------------------------
  // Insert topics
  // ---------------------------------------------------------------------------

  const insertTopic = db.prepare(
    "INSERT INTO topics (id, forum_id, title, author_id, last_poster_id, post_count, created_at, last_post_at, is_sticky, is_locked) VALUES (?,?,?,?,?,?,?,?,?,?)",
  );

  const insertTopics = db.transaction((rows: (string | null)[][]) => {
    for (const r of rows) {
      insertTopic.run(
        Number(r[T.topic_id]),
        Number(r[T.forum_id]),
        decodeHtmlEntities(r[T.topic_title] ?? "(untitled)"),
        r[T.topic_poster] !== null ? Number(r[T.topic_poster]) : null,
        r[T.topic_last_poster_id] !== null
          ? Number(r[T.topic_last_poster_id])
          : null,
        Number(r[T.topic_posts_approved] ?? 0),
        Number(r[T.topic_time] ?? 0),
        Number(r[T.topic_last_post_time] ?? 0),
        Number(r[T.topic_type] ?? 0) >= 1 ? 1 : 0,
        Number(r[T.topic_status] ?? 0) === 1 ? 1 : 0,
      );
    }
  });

  insertTopics(insertRows[topicsTable]);
  console.log(`Inserted ${insertRows[topicsTable].length} topics`);

  // ---------------------------------------------------------------------------
  // Insert posts (with BBCode → HTML)
  // ---------------------------------------------------------------------------

  const insertPost = db.prepare(
    "INSERT INTO posts (id, topic_id, author_id, content_html, created_at) VALUES (?,?,?,?,?)",
  );

  const insertPosts = db.transaction((rows: (string | null)[][]) => {
    for (const r of rows) {
      const raw = r[P.post_text] ?? "";
      const uid = r[P.bbcode_uid] ?? "";
      let html = bbcodeToHtml(raw, uid);
      // Replace real usernames in quote attribution with pseudonyms
      html = html.replace(/data-author="([^"]*)"/g, (_, name: string) => {
        const authorId = usernameToId.get(name.toLowerCase());
        return `data-author="${authorId ? computeDisplayName(authorId) : "a member"}"`;
      });
      insertPost.run(
        Number(r[P.post_id]),
        Number(r[P.topic_id]),
        r[P.poster_id] !== null ? Number(r[P.poster_id]) : null,
        html,
        Number(r[P.post_time] ?? 0),
      );
    }
  });

  insertPosts(insertRows[postsTable]);
  console.log(`Inserted ${insertRows[postsTable].length} posts`);

  // ---------------------------------------------------------------------------
  // Insert users (registration dates only)
  // ---------------------------------------------------------------------------

  const insertUser = db.prepare("INSERT INTO users (id, registered_at) VALUES (?,?)");
  const insertUsersStmt = db.transaction(() => {
    for (const [uid, regdate] of userRegdates) {
      insertUser.run(uid, regdate);
    }
  });
  insertUsersStmt();
  console.log(`Inserted ${userRegdates.size} users`);

  // ---------------------------------------------------------------------------
  // Build PM relationship graph from privmsgs_to
  // ---------------------------------------------------------------------------

  const privmsgsToTable = `${tablePrefix}privmsgs_to`;
  const PMTo = {
    user_id: col(privmsgsToTable, "user_id", 1),   // recipient (or sender for their sent copy)
    author_id: col(privmsgsToTable, "author_id", 2), // always the original sender
  };

  // Each row where user_id != author_id is the recipient's copy of a message
  const pmCounts = new Map<string, number>();
  for (const r of insertRows[privmsgsToTable] ?? []) {
    const toId = Number(r[PMTo.user_id]);
    const fromId = Number(r[PMTo.author_id]);
    if (!fromId || !toId || fromId <= 1 || toId <= 1 || fromId === toId) continue;
    const key = `${fromId}:${toId}`;
    pmCounts.set(key, (pmCounts.get(key) ?? 0) + 1);
  }

  db.exec(`
    CREATE TABLE pm_relationships (
      from_id INTEGER NOT NULL,
      to_id   INTEGER NOT NULL,
      count   INTEGER NOT NULL,
      PRIMARY KEY (from_id, to_id)
    );
    CREATE INDEX idx_pm_from ON pm_relationships(from_id);
    CREATE INDEX idx_pm_to   ON pm_relationships(to_id);
  `);

  const insertPmRel = db.prepare(
    "INSERT INTO pm_relationships (from_id, to_id, count) VALUES (?,?,?)",
  );
  db.transaction(() => {
    for (const [key, count] of pmCounts) {
      const colon = key.indexOf(":");
      insertPmRel.run(Number(key.slice(0, colon)), Number(key.slice(colon + 1)), count);
    }
  })();
  console.log(`Inserted ${pmCounts.size} PM relationships`);

  // ---------------------------------------------------------------------------
  // Recompute counts from actual migrated data (subforums included)
  // ---------------------------------------------------------------------------

  // Post count and participant count per topic
  db.exec(`
    UPDATE topics SET post_count = (
      SELECT COUNT(*) FROM posts WHERE posts.topic_id = topics.id
    );
    UPDATE topics SET participant_count = (
      SELECT COUNT(DISTINCT author_id) FROM posts
      WHERE posts.topic_id = topics.id AND author_id IS NOT NULL
    );
  `);

  // Lock details per topic from phpbb_log
  const logTable = `${tablePrefix}log`;
  const L = {
    log_type: col(logTable, "log_type", 1),
    user_id: col(logTable, "user_id", 2),
    topic_id: col(logTable, "topic_id", 4),
    log_time: col(logTable, "log_time", 6),
    log_operation: col(logTable, "log_operation", 7),
  };

  const lockMap = new Map<number, { lockedById: number; lockedAt: number }>();
  for (const r of insertRows[logTable] ?? []) {
    if (Number(r[L.log_type]) !== 1) continue;
    if (r[L.log_operation] !== "LOG_LOCK") continue;
    const topicId = Number(r[L.topic_id]);
    const userId = Number(r[L.user_id]);
    const logTime = Number(r[L.log_time]);
    if (!topicId || !userId) continue;
    const existing = lockMap.get(topicId);
    if (!existing || logTime > existing.lockedAt) {
      lockMap.set(topicId, { lockedById: userId, lockedAt: logTime });
    }
  }

  const updateLock = db.prepare(
    "UPDATE topics SET locked_by_id = ?, locked_at = ? WHERE id = ?",
  );
  db.transaction(() => {
    for (const [topicId, { lockedById, lockedAt }] of lockMap) {
      updateLock.run(lockedById, lockedAt, topicId);
    }
  })();
  console.log(`Updated ${lockMap.size} topics with lock info`);

  // Topic and post counts per forum — include all descendant subforums via
  // a recursive CTE so parent forums show their full depth of content.
  db.exec(`
    WITH RECURSIVE tree(root_id, node_id) AS (
      SELECT id, id FROM forums
      UNION ALL
      SELECT t.root_id, f.id FROM forums f JOIN tree t ON f.parent_id = t.node_id
    )
    UPDATE forums SET topic_count = (
      SELECT COUNT(*) FROM topics
      WHERE forum_id IN (SELECT node_id FROM tree WHERE root_id = forums.id)
    );
  `);

  db.exec(`
    WITH RECURSIVE tree(root_id, node_id) AS (
      SELECT id, id FROM forums
      UNION ALL
      SELECT t.root_id, f.id FROM forums f JOIN tree t ON f.parent_id = t.node_id
    )
    UPDATE forums SET post_count = (
      SELECT COUNT(*) FROM posts WHERE topic_id IN (
        SELECT id FROM topics
        WHERE forum_id IN (SELECT node_id FROM tree WHERE root_id = forums.id)
      )
    );
  `);

  console.log("Recomputed topic and post counts (including subforums)");

  // ---------------------------------------------------------------------------
  // Print forum tree for allowlist configuration
  // ---------------------------------------------------------------------------

  type ForumRow = { id: number; parent_id: number | null; name: string };
  const allForums = db
    .prepare(
      "SELECT id, parent_id, name FROM forums ORDER BY display_order ASC",
    )
    .all() as ForumRow[];

  const forumIds = new Set(allForums.map((f) => f.id));
  const childrenOf = new Map<number, ForumRow[]>();

  for (const f of allForums) {
    // phpBB3 root-level forums have parent_id = 0 (not a real forum id)
    const key = f.parent_id && forumIds.has(f.parent_id) ? f.parent_id : 0;
    if (!childrenOf.has(key)) childrenOf.set(key, []);
    childrenOf.get(key)!.push(f);
  }

  function printTree(parentId: number, depth: number) {
    for (const f of childrenOf.get(parentId) ?? []) {
      console.log(`${"  ".repeat(depth)}[${f.id}] ${f.name}`);
      printTree(f.id, depth + 1);
    }
  }

  console.log(
    "\nForum IDs — add the ones you want to config/forum-allowlist.json:",
  );
  console.log("─".repeat(56));
  printTree(0, 0);

  db.close();
  console.log(`\nDone. Database written to: ${dbPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
