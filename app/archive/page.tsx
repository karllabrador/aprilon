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
  SEARCH_TOPICS_PER_PAGE,
  SEARCH_POSTS_PER_PAGE,
} from "@/lib/forum";
import { getDisplayName, getAvatarUrl } from "@/lib/forum-display";

export const dynamic = "force-dynamic";

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
    const postResults = searchPosts(query, { page: postPage, userId });
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
                border: "2px solid #2a4848",
                boxShadow: "0 0 0 1px #1a2e2e",
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
    const postResults = searchPosts(query, { page: postPage });
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
        <div className="flex items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-[#ededed]">Forum Archive</h1>
          <SearchBar initialQuery="" placeholder="Search archive…" />
        </div>

        {forums.length === 0 ? (
          <p className="text-gray-500">No forums are configured in the allowlist yet.</p>
        ) : (
          <div className="space-y-8">
            <div
              className="rounded-lg border p-4"
              style={{ borderColor: "#2a2b2e", backgroundColor: "#1e1f21" }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600 mb-3">
                Archive Activity (2009 – 2016)
              </p>
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
