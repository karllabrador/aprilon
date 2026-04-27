import Link from "next/link";
import ArchiveHeader from "@/components/archive/ArchiveHeader";
import ForumCard from "@/components/archive/ForumCard";
import SearchBar from "@/components/archive/SearchBar";
import Pagination from "@/components/archive/Pagination";
import SearchResultTopic from "@/components/archive/SearchResultTopic";
import SearchResultPost from "@/components/archive/SearchResultPost";
import SearchResultUser from "@/components/archive/SearchResultUser";
import ActivityBarChart from "@/components/archive/ActivityBarChart";
import {
  getAllowedForums,
  searchTopics,
  searchPosts,
  searchUsers,
  getArchiveActivity,
  redactions,
  SEARCH_TOPICS_PER_PAGE,
  SEARCH_POSTS_PER_PAGE,
} from "@/lib/forum";
import { getDisplayName, getAvatarUrl, applyRedaction } from "@/lib/forum-display";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Forum Archive — Aprilon",
  description: "Browse the archived Aprilon community forums. Read topics, posts, and member activity from 2009–2016.",
  openGraph: {
    title: "Forum Archive — Aprilon",
    description: "Browse the archived Aprilon community forums. Read topics, posts, and member activity from 2009–2016.",
  },
};

type Props = {
  searchParams: Promise<{ q?: string; uid?: string; tp?: string; pp?: string }>;
};

export default async function ArchivePage({ searchParams }: Props) {
  const { q, uid, tp, pp } = await searchParams;
  const query = q?.trim() ?? "";
  const userId = Number(uid) || 0;
  const topicPage = Math.max(1, Number(tp) || 1);
  const postPage = Math.max(1, Number(pp) || 1);

  const forums = getAllowedForums();
  const roots = forums.filter((f) => !f.parentId || !forums.some((p) => p.id === f.parentId));
  const children = forums.filter((f) => f.parentId && forums.some((p) => p.id === f.parentId));

  const listStyle = { borderColor: "#2a2b2e", backgroundColor: "#1e1f21" };
  const rowStyle = "border-b last:border-b-0";

  // ── User activity mode ────────────────────────────────────────────────────
  if (userId > 1) {
    const displayName = getDisplayName(userId);
    const avatarUrl = getAvatarUrl(userId);

    const topicResults = searchTopics(query, { page: topicPage, userId });
    const rawPostResults = searchPosts(query, { page: postPage, userId });
    const postResults = { ...rawPostResults, results: rawPostResults.results.map((p) => applyRedaction(p, redactions)) };
    const topicTotalPages = Math.ceil(topicResults.total / SEARCH_TOPICS_PER_PAGE);
    const postTotalPages = Math.ceil(postResults.total / SEARCH_POSTS_PER_PAGE);

    const baseParams: Record<string, string> = { uid: String(userId) };
    if (query) baseParams.q = query;

    return (
      <>
        <ArchiveHeader breadcrumbs={[{ label: displayName }]} />
        <main className="container max-w-336 mx-auto max-[1344px]:px-6 py-10">
          {/* User header */}
          <div className="flex items-center gap-4 mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt=""
              width={52}
              height={52}
              className="rounded-xl shrink-0"
              style={{
                border: "2px solid #1e3a78",
                boxShadow: "0 0 0 1px #141c48",
                imageRendering: "pixelated",
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <Link
                  href={`/archive/user/${userId}`}
                  className="text-xl font-bold text-[#ededed] hover:text-white transition-colors"
                >
                  {displayName}
                </Link>
                <span className="text-sm text-gray-600">All activity</span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">User #{userId}</p>
            </div>
            <SearchBar
              initialQuery={query}
              placeholder={`Filter ${displayName}'s activity…`}
              extraParams={{ uid: String(userId) }}
            />
          </div>

          <div className="space-y-10">
            {/* Topics */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                Topics{" "}
                <span className="font-normal normal-case tracking-normal text-gray-600">
                  {topicResults.total.toLocaleString()} {topicResults.total === 1 ? "result" : "results"}
                </span>
              </h2>
              {topicResults.results.length === 0 ? (
                <p className="text-sm text-gray-600 py-2">No topics found.</p>
              ) : (
                <>
                  <div className="border rounded-lg overflow-hidden" style={listStyle}>
                    {topicResults.results.map((r) => (
                      <div key={r.id} className={rowStyle} style={listStyle}>
                        <SearchResultTopic result={r} />
                      </div>
                    ))}
                  </div>
                  <Pagination
                    currentPage={topicPage}
                    totalPages={topicTotalPages}
                    pageParam="tp"
                    params={{ ...baseParams, ...(postPage > 1 ? { pp: String(postPage) } : {}) }}
                  />
                </>
              )}
            </section>

            {/* Posts */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                Posts{" "}
                <span className="font-normal normal-case tracking-normal text-gray-600">
                  {postResults.total.toLocaleString()} {postResults.total === 1 ? "result" : "results"}
                </span>
              </h2>
              {postResults.results.length === 0 ? (
                <p className="text-sm text-gray-600 py-2">No posts found.</p>
              ) : (
                <>
                  <div className="border rounded-lg overflow-hidden" style={listStyle}>
                    {postResults.results.map((r) => (
                      <div key={r.id} className={rowStyle} style={listStyle}>
                        <SearchResultPost result={r} query={query} />
                      </div>
                    ))}
                  </div>
                  <Pagination
                    currentPage={postPage}
                    totalPages={postTotalPages}
                    pageParam="pp"
                    params={{ ...baseParams, ...(topicPage > 1 ? { tp: String(topicPage) } : {}) }}
                  />
                </>
              )}
            </section>
          </div>
        </main>
      </>
    );
  }

  // ── Text search mode ──────────────────────────────────────────────────────
  if (query) {
    const topicResults = searchTopics(query, { page: topicPage });
    const rawPostResults = searchPosts(query, { page: postPage });
    const postResults = { ...rawPostResults, results: rawPostResults.results.map((p) => applyRedaction(p, redactions)) };
    const userResults = searchUsers(query);
    const topicTotalPages = Math.ceil(topicResults.total / SEARCH_TOPICS_PER_PAGE);
    const postTotalPages = Math.ceil(postResults.total / SEARCH_POSTS_PER_PAGE);

    return (
      <>
        <ArchiveHeader />
        <main className="container max-w-336 mx-auto max-[1344px]:px-6 py-10">
          <div className="flex items-center justify-between gap-4 mb-8">
            <h1 className="text-2xl font-bold text-[#ededed]">Forum Archive</h1>
            <SearchBar initialQuery={query} placeholder="Search archive…" />
          </div>

          <div className="space-y-10">
            {/* Users */}
            {userResults.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                  Users
                </h2>
                <div className="border rounded-lg overflow-hidden" style={listStyle}>
                  {userResults.map((r) => (
                    <div key={r.id} className={rowStyle} style={listStyle}>
                      <SearchResultUser result={r} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Topics */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                Topics{" "}
                <span className="font-normal normal-case tracking-normal text-gray-600">
                  {topicResults.total.toLocaleString()} {topicResults.total === 1 ? "result" : "results"}
                </span>
              </h2>
              {topicResults.results.length === 0 ? (
                <p className="text-sm text-gray-600 py-2">No topics found.</p>
              ) : (
                <>
                  <div className="border rounded-lg overflow-hidden" style={listStyle}>
                    {topicResults.results.map((r) => (
                      <div key={r.id} className={rowStyle} style={listStyle}>
                        <SearchResultTopic result={r} />
                      </div>
                    ))}
                  </div>
                  <Pagination
                    currentPage={topicPage}
                    totalPages={topicTotalPages}
                    pageParam="tp"
                    params={{ q: query, ...(postPage > 1 ? { pp: String(postPage) } : {}) }}
                  />
                </>
              )}
            </section>

            {/* Posts */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                Posts{" "}
                <span className="font-normal normal-case tracking-normal text-gray-600">
                  {postResults.total.toLocaleString()} {postResults.total === 1 ? "result" : "results"}
                </span>
              </h2>
              {postResults.results.length === 0 ? (
                <p className="text-sm text-gray-600 py-2">No posts found.</p>
              ) : (
                <>
                  <div className="border rounded-lg overflow-hidden" style={listStyle}>
                    {postResults.results.map((r) => (
                      <div key={r.id} className={rowStyle} style={listStyle}>
                        <SearchResultPost result={r} query={query} />
                      </div>
                    ))}
                  </div>
                  <Pagination
                    currentPage={postPage}
                    totalPages={postTotalPages}
                    pageParam="pp"
                    params={{ q: query, ...(topicPage > 1 ? { tp: String(topicPage) } : {}) }}
                  />
                </>
              )}
            </section>
          </div>
        </main>
      </>
    );
  }

  // ── Default: forum list ───────────────────────────────────────────────────
  const activity = getArchiveActivity();

  return (
    <>
      <ArchiveHeader />
      <main className="container max-w-336 mx-auto max-[1344px]:px-6 py-10">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-[#ededed]">Forum Archive</h1>
          <SearchBar initialQuery="" placeholder="Search archive…" />
        </div>

        <div
          className="rounded-lg mb-8 p-0.5"
          style={{ background: "linear-gradient(135deg, #ff6b6b, #ffa94d, #ffe066, #69db7c, #4dabf7, #cc5de8)" }}
        >
          <div className="rounded-md overflow-hidden" style={{ backgroundColor: "#151618" }}>
            <div className="flex items-start gap-4 px-5 py-4">
              {/* Icon */}
              <div
                className="mt-0.5 shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-base"
                style={{ backgroundColor: "#1e1f24", border: "1px solid #2a2b32" }}
              >
                📜
              </div>
              {/* Text */}
              <div>
                <p className="text-sm font-semibold mb-1 text-[#c0c0c8]">
                  Archive Notice
                </p>
                <p className="text-sm leading-relaxed text-gray-500">
                  This is a read-only archive of the Aprilon forums. All usernames have been
                  anonymised to protect member privacy. To request redaction of a post or topic,
                  email{" "}
                  <a
                    href="mailto:admin@aprilon.org"
                    className="underline underline-offset-2 hover:opacity-80 transition-opacity text-gray-400"
                  >
                    admin@aprilon.org
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>

        {forums.length === 0 ? (
          <p className="text-gray-500">No forums are configured in the allowlist yet.</p>
        ) : (
          <div className="space-y-8">
            <div
              className="rounded-lg border p-4"
              style={{ borderColor: "#2a2b2e", backgroundColor: "#1e1f21" }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">
                  Archive Activity (2009 – 2016)
                </p>
                <Link
                  href="/archive/graph"
                  className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full transition-colors"
                  style={{ color: "#5a8fd4", backgroundColor: "#1a1f2e", border: "1px solid #2a3550" }}
                >
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: "#3a6ab0" }}
                  />
                  DM Graph
                </Link>
              </div>
              <ActivityBarChart data={activity} height={160} />
            </div>

            {roots.map((parent) => {
              const sub = children.filter((c) => c.parentId === parent.id);
              return (
                <div key={parent.id}>
                  {sub.length > 0 ? (
                    <>
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                        {parent.name}
                      </h2>
                      <div className="space-y-2">
                        {sub.map((f) => (
                          <ForumCard key={f.id} forum={f} />
                        ))}
                      </div>
                    </>
                  ) : (
                    <ForumCard forum={parent} />
                  )}
                </div>
              );
            })}

          </div>
        )}
      </main>
    </>
  );
}
