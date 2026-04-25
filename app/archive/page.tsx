import ArchiveHeader from "@/components/archive/ArchiveHeader";
import ForumCard from "@/components/archive/ForumCard";
import SearchBar from "@/components/archive/SearchBar";
import Pagination from "@/components/archive/Pagination";
import SearchResultTopic from "@/components/archive/SearchResultTopic";
import SearchResultPost from "@/components/archive/SearchResultPost";
import ActivityBarChart from "@/components/archive/ActivityBarChart";
import {
  getAllowedForums,
  searchTopics,
  searchPosts,
  getArchiveActivity,
  SEARCH_TOPICS_PER_PAGE,
  SEARCH_POSTS_PER_PAGE,
} from "@/lib/forum";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ q?: string; tp?: string; pp?: string }>;
};

export default async function ArchivePage({ searchParams }: Props) {
  const { q, tp, pp } = await searchParams;
  const query = q?.trim() ?? "";
  const topicPage = Math.max(1, Number(tp) || 1);
  const postPage = Math.max(1, Number(pp) || 1);

  const forums = getAllowedForums();
  const roots = forums.filter((f) => !f.parentId || !forums.some((p) => p.id === f.parentId));
  const children = forums.filter((f) => f.parentId && forums.some((p) => p.id === f.parentId));

  const topicResults = query ? searchTopics(query, { page: topicPage }) : { results: [], total: 0 };
  const postResults = query ? searchPosts(query, { page: postPage }) : { results: [], total: 0 };

  const topicTotalPages = Math.ceil(topicResults.total / SEARCH_TOPICS_PER_PAGE);
  const postTotalPages = Math.ceil(postResults.total / SEARCH_POSTS_PER_PAGE);

  const activity = query ? null : getArchiveActivity();

  const listStyle = { borderColor: "#1e2424" };
  const rowStyle = "border-b last:border-b-0";

  return (
    <>
      <ArchiveHeader />
      <main className="container max-w-336 mx-auto max-[1344px]:px-6 py-10">
        <div className="flex items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-[#ededed]">Forum Archive</h1>
          <SearchBar initialQuery={query} placeholder="Search archive…" />
        </div>

        {query ? (
          <div className="space-y-10">
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
                  <div className="border rounded overflow-hidden" style={listStyle}>
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
                  <div className="border rounded overflow-hidden" style={listStyle}>
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
        ) : forums.length === 0 ? (
          <p className="text-gray-500">No forums are configured in the allowlist yet.</p>
        ) : (
          <div className="space-y-8">
            {activity && (
              <div
                className="rounded-lg border p-4"
                style={{ borderColor: "#1a2828", backgroundColor: "#0a1212" }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600 mb-3">
                  Archive Activity (2009 – 2016)
                </p>
                <ActivityBarChart data={activity} height={160} />
              </div>
            )}

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
