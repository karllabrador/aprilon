import Link from "next/link";
import type { TopicSearchResult } from "@/lib/forum";
import { getDisplayName, formatDate, getUserProfileHref } from "@/lib/forum-display";

export default function SearchResultTopic({ result }: { result: TopicSearchResult }) {
  const authorName = getDisplayName(result.authorId);
  const authorHref = getUserProfileHref(result.authorId);

  return (
    <div className="px-4 py-3">
      <div className="text-xs text-gray-600 mb-1">{result.forumName}</div>
      <Link
        href={`/archive/topic/${result.id}`}
        className="text-sm font-medium text-[#ededed] hover:text-white transition-colors"
      >
        {result.title}
      </Link>
      <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
        {authorHref ? (
          <Link href={authorHref} className="text-gray-500 hover:text-gray-300 transition-colors">
            {authorName}
          </Link>
        ) : (
          <span>{authorName}</span>
        )}
        <span>{result.postCount.toLocaleString()} {result.postCount === 1 ? "reply" : "replies"}</span>
        <span>{formatDate(result.lastPostAt)}</span>
      </div>
    </div>
  );
}
