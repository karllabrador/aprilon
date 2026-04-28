import ArchiveHeader from "@/components/archive/ArchiveHeader";
import Pagination from "@/components/archive/Pagination";
import PostCard from "@/components/archive/PostCard";
import PostHighlighter from "@/components/archive/PostHighlighter";
import SearchBar from "@/components/archive/SearchBar";
import {
  getFirstPost,
  getForum,
  getForumPath,
  getPosts,
  getTopic,
  POSTS_PER_PAGE,
  redactions,
} from "@/lib/forum";
import {
  applyRedaction,
  formatDate,
  forumHref,
  getDisplayName,
  getUserProfileHref,
  rewriteInternalLinks,
  slugify,
} from "@/lib/forum-display";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ topicId: string }>;
  searchParams: Promise<{ page?: string; q?: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ topicId: string }> }) {
  const topic = getTopic(parseInt((await params).topicId, 10));
  if (!topic) return {};
  const forum = getForum(topic.forumId);
  const title = `${topic.title} (Topic #${topic.id}) — Aprilon Forum Archive`;
  const forumName = forum?.name ?? "the Aprilon community forums";
  const year = new Date(topic.createdAt * 1000).getFullYear();
  const description = `Read the full discussion in the Aprilon Forum Archive. ${topic.postCount.toLocaleString()} ${topic.postCount === 1 ? "reply" : "replies"} from ${topic.participantCount} ${topic.participantCount === 1 ? "participant" : "participants"} in ${forumName}. Originally posted in ${year}.`;
  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function TopicPage({ params, searchParams }: Props) {
  const { topicId } = await params;
  const { page: pageParam, q } = await searchParams;

  const tid = parseInt(topicId, 10);
  if (!tid) notFound();

  const topic = getTopic(tid);
  if (!topic) notFound();

  const expectedParam = `${tid}-${slugify(topic.title)}`;
  if (topicId !== expectedParam) {
    const qs = new URLSearchParams();
    if (pageParam) qs.set("page", pageParam);
    if (q) qs.set("q", q);
    const suffix = qs.size > 0 ? `?${qs}` : "";
    permanentRedirect(`/archive/topic/${expectedParam}${suffix}`);
  }

  const forum = getForum(topic.forumId);
  if (!forum) notFound();

  const forumPath = getForumPath(topic.forumId);

  const page = Math.max(1, Number(pageParam) || 1);
  const query = q?.trim() ?? "";

  const { posts: rawPosts, total } = getPosts(tid, { page, query });
  const posts = rawPosts.map((p) => {
    const r = applyRedaction(p, redactions);
    return { ...r, contentHtml: rewriteInternalLinks(r.contentHtml) };
  });
  const totalPages = Math.ceil(total / POSTS_PER_PAGE);
  const startIndex = (page - 1) * POSTS_PER_PAGE;

  const pinnedFirst =
    page > 1
      ? (() => {
          const raw = getFirstPost(tid);
          if (!raw) return null;
          const r = applyRedaction(raw, redactions);
          return { ...r, contentHtml: rewriteInternalLinks(r.contentHtml) };
        })()
      : null;

  return (
    <>
      <PostHighlighter />
      <ArchiveHeader
        breadcrumbs={[
          ...forumPath.map((f) => ({
            label: f.name,
            href: f.linked ? forumHref(f) : undefined,
          })),
          { label: topic.title },
        ]}
      />
      <main className="container max-w-336 mx-auto max-[1344px]:px-6 py-10">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[#ededed]">{topic.title}</h1>
        </div>

        <div className="flex items-center justify-between gap-4 mb-4">
          <p className="text-sm text-gray-500">
            {query ? (
              <>
                <span className="text-gray-300">{total.toLocaleString()}</span>{" "}
                {total === 1 ? "result" : "results"} for &ldquo;{query}&rdquo;
              </>
            ) : (
              <>
                <span className="text-gray-300">
                  {topic.postCount.toLocaleString()}
                </span>{" "}
                {topic.postCount === 1 ? "reply" : "replies"}
                {topic.participantCount > 0 && (
                  <>
                    {" "}
                    &nbsp;·&nbsp;{" "}
                    <span className="text-gray-300">
                      {topic.participantCount}
                    </span>{" "}
                    {topic.participantCount === 1
                      ? "participant"
                      : "participants"}
                  </>
                )}
                {topic.isLocked && (
                  <>
                    {" "}
                    &nbsp;·&nbsp; 🔒{" "}
                    {topic.lockedById ? (
                      <>
                        Locked by{" "}
                        {(() => {
                          const href = getUserProfileHref(topic.lockedById);
                          const name = getDisplayName(topic.lockedById);
                          return href ? (
                            <Link
                              href={href}
                              className="hover:opacity-80"
                              style={{ color: "#9ca3af" }}
                            >
                              {name}
                            </Link>
                          ) : (
                            name
                          );
                        })()}
                        {topic.lockedAt && (
                          <> on {formatDate(topic.lockedAt)}</>
                        )}
                      </>
                    ) : (
                      "locked"
                    )}
                  </>
                )}
              </>
            )}
          </p>
          <SearchBar initialQuery={query} placeholder="Search posts…" />
        </div>

        {pinnedFirst && (
          <div className="mb-6">
            <PostCard post={pinnedFirst} index={0} isOP />
            <div id="posts-start" className="flex items-center gap-3 mt-6">
              <div
                className="flex-1 h-px"
                style={{ backgroundColor: "#252628" }}
              />
              <span className="text-xs text-gray-600">Page {page}</span>
              <div
                className="flex-1 h-px"
                style={{ backgroundColor: "#252628" }}
              />
            </div>
          </div>
        )}

        {posts.length === 0 ? (
          <p className="text-gray-500 py-8 text-center text-sm">
            {query
              ? `No posts found matching "${query}".`
              : "No posts in this topic."}
          </p>
        ) : (
          <div className="space-y-4">
            {posts.map((post, i) => (
              <PostCard
                key={post.id}
                post={post}
                index={startIndex + i}
                isOP={startIndex + i === 0}
              />
            ))}
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          scrollTargetId="posts-start"
          params={query ? { q: query } : undefined}
          totalItems={query ? total : topic.postCount}
          rangeStart={posts.length > 0 ? startIndex + 1 : undefined}
          rangeEnd={posts.length > 0 ? startIndex + posts.length : undefined}
          firstDate={topic.createdAt || undefined}
          lastDate={topic.lastPostAt || undefined}
          currentStartDate={posts[0]?.createdAt}
          currentEndDate={posts[posts.length - 1]?.createdAt}
          itemLabel="post"
        />
      </main>
    </>
  );
}
