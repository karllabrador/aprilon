import { notFound } from "next/navigation";
import ArchiveHeader from "@/components/archive/ArchiveHeader";
import PostCard from "@/components/archive/PostCard";
import SearchBar from "@/components/archive/SearchBar";
import Pagination from "@/components/archive/Pagination";
import { getForum, getFirstPost, getForumPath, getPosts, getTopic, redactions, POSTS_PER_PAGE } from "@/lib/forum";
import { applyRedaction, rewriteInternalLinks } from "@/lib/forum-display";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ topicId: string }>;
  searchParams: Promise<{ page?: string; q?: string }>;
};

export default async function TopicPage({ params, searchParams }: Props) {
  const { topicId } = await params;
  const { page: pageParam, q } = await searchParams;

  const tid = Number(topicId);
  if (!tid) notFound();

  const topic = getTopic(tid);
  if (!topic) notFound();

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
      <ArchiveHeader
        breadcrumbs={[
          ...forumPath.map((f) => ({
            label: f.name,
            href: f.linked ? `/archive/forum/${f.id}` : undefined,
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
                <span className="text-gray-300">{topic.postCount.toLocaleString()}</span>{" "}
                {topic.postCount === 1 ? "reply" : "replies"}
              </>
            )}
          </p>
          <SearchBar initialQuery={query} placeholder="Search posts…" />
        </div>

        {pinnedFirst && (
          <div className="mb-6">
            <PostCard post={pinnedFirst} index={0} isOP />
            <div id="posts-start" className="flex items-center gap-3 mt-6">
              <div className="flex-1 h-px" style={{ backgroundColor: "#252628" }} />
              <span className="text-xs text-gray-600">Page {page}</span>
              <div className="flex-1 h-px" style={{ backgroundColor: "#252628" }} />
            </div>
          </div>
        )}

        {posts.length === 0 ? (
          <p className="text-gray-500 py-8 text-center text-sm">
            {query ? `No posts found matching "${query}".` : "No posts in this topic."}
          </p>
        ) : (
          <div className="space-y-4">
            {posts.map((post, i) => (
              <PostCard key={post.id} post={post} index={startIndex + i} isOP={startIndex + i === 0} />
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
