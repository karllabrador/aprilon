import { notFound } from "next/navigation";
import ArchiveHeader from "@/components/archive/ArchiveHeader";
import ForumCard from "@/components/archive/ForumCard";
import TopicRow from "@/components/archive/TopicRow";
import SearchBar from "@/components/archive/SearchBar";
import Pagination from "@/components/archive/Pagination";
import { getAllowedForums, getForum, getForumActivity, getForumPath, getTopics, getTopTopics, TOPICS_PER_PAGE } from "@/lib/forum";
import ForumStats from "@/components/archive/ForumStats";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ forumId: string }>;
  searchParams: Promise<{ page?: string; q?: string }>;
};

export default async function ForumPage({ params, searchParams }: Props) {
  const { forumId } = await params;
  const { page: pageParam, q } = await searchParams;

  const id = Number(forumId);
  if (!id) notFound();

  const forum = getForum(id);
  if (!forum) notFound();

  const page = Math.max(1, Number(pageParam) || 1);
  const query = q?.trim() ?? "";

  const forumPath = getForumPath(id);
  const subforums = getAllowedForums().filter((f) => f.parentId === id);
  const topTopics = getTopTopics(id);
  const activity = getForumActivity(id);

  const { topics, total } = getTopics(id, { page, query });
  const totalPages = Math.ceil(total / TOPICS_PER_PAGE);

  return (
    <>
      <ArchiveHeader
        breadcrumbs={forumPath.map((f, i) => ({
          label: f.name,
          href: i < forumPath.length - 1 && f.linked ? `/archive/forum/${f.id}` : undefined,
        }))}
      />
      <main className="container max-w-336 mx-auto max-[1344px]:px-6 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#ededed]">{forum.name}</h1>
          {forum.description && (
            <p className="text-sm text-gray-500 mt-1">{forum.description}</p>
          )}
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
                <span className="text-gray-300">{forum.topicCount.toLocaleString()}</span>{" "}topics
                &nbsp;·&nbsp;
                <span className="text-gray-300">{forum.postCount.toLocaleString()}</span>{" "}posts
              </>
            )}
          </p>
          <SearchBar initialQuery={query} placeholder="Search topics…" />
        </div>

        <ForumStats topTopics={topTopics} activity={activity} />

        {subforums.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Subforums
            </h2>
            <div className="space-y-2">
              {subforums.map((f) => (
                <ForumCard key={f.id} forum={f} />
              ))}
            </div>
          </div>
        )}

        {topics.length === 0 ? (
          <p className="text-gray-500 py-8 text-center text-sm">
            {query ? `No topics found matching "${query}".` : "No topics in this forum."}
          </p>
        ) : (
          <div className="border rounded-lg overflow-hidden" style={{ borderColor: "#2a2b2e", backgroundColor: "#1e1f21" }}>
            {topics.map((topic) => (
              <TopicRow key={topic.id} topic={topic} />
            ))}
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          params={query ? { q: query } : undefined}
          totalItems={query ? total : forum.topicCount}
          rangeStart={topics.length > 0 ? (page - 1) * TOPICS_PER_PAGE + 1 : undefined}
          rangeEnd={topics.length > 0 ? (page - 1) * TOPICS_PER_PAGE + topics.length : undefined}
          itemLabel="topic"
        />
      </main>
    </>
  );
}
