import ArchiveHeader from "@/components/archive/ArchiveHeader";
import ForumCard from "@/components/archive/ForumCard";
import ForumStats from "@/components/archive/ForumStats";
import Pagination from "@/components/archive/Pagination";
import SearchBar from "@/components/archive/SearchBar";
import TopicRow from "@/components/archive/TopicRow";
import {
  getAllowedForums,
  getForum,
  getForumActivity,
  getForumPath,
  getTopics,
  getTopTopics,
  getTrashcanCounterpart,
  TOPICS_PER_PAGE,
} from "@/lib/forum";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ forumId: string }>;
  searchParams: Promise<{ page?: string; q?: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ forumId: string }> }) {
  const { forumId } = await params;
  const forum = getForum(Number(forumId));
  if (!forum) return {};
  const title = `Forum: ${forum.name} — Aprilon Forum Archive`;
  const description = forum.description
    ? `${forum.description} Browse ${forum.topicCount.toLocaleString()} topics and ${forum.postCount.toLocaleString()} posts in this section of the Aprilon Forum Archive.`
    : `Browse ${forum.topicCount.toLocaleString()} topics and ${forum.postCount.toLocaleString()} posts in ${forum.name}. Part of the Aprilon Forum Archive, covering the gaming community from 2009–2016.`;
  return {
    title,
    description,
    openGraph: { title, description },
  };
}

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
  const trashcan = getTrashcanCounterpart(forum.name);
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
          href:
            i < forumPath.length - 1 && f.linked
              ? `/archive/forum/${f.id}`
              : undefined,
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
                <span className="text-gray-300">
                  {forum.topicCount.toLocaleString()}
                </span>{" "}
                topics &nbsp;·&nbsp;
                <span className="text-gray-300">
                  {forum.postCount.toLocaleString()}
                </span>{" "}
                posts
              </>
            )}
          </p>
          <SearchBar initialQuery={query} placeholder="Search topics…" />
        </div>

        <ForumStats topTopics={topTopics} activity={activity} />

        {trashcan && trashcan.id !== id && (
          <Link
            href={`/archive/forum/${trashcan.id}`}
            className="flex items-center gap-3 mb-6 px-4 py-3 rounded-lg text-sm transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "#1c1810",
              border: "1px solid #3a2e18",
              color: "#b89a5a",
            }}
          >
            <span className="text-base shrink-0">🗑️</span>
            <span className="flex-1">
              Older topics may have been moved to the Trashcan. Click to take a
              look.
            </span>
            <span className="shrink-0 opacity-60">→</span>
          </Link>
        )}

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
            {query
              ? `No topics found matching "${query}".`
              : "No topics in this forum."}
          </p>
        ) : (
          <div
            className="border rounded-lg overflow-hidden"
            style={{ borderColor: "#2a2b2e", backgroundColor: "#1e1f21" }}
          >
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
          rangeStart={
            topics.length > 0 ? (page - 1) * TOPICS_PER_PAGE + 1 : undefined
          }
          rangeEnd={
            topics.length > 0
              ? (page - 1) * TOPICS_PER_PAGE + topics.length
              : undefined
          }
          itemLabel="topic"
        />
      </main>
    </>
  );
}
