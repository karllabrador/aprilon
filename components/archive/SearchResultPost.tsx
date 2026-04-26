import Link from "next/link";
import type { PostSearchResult } from "@/lib/forum";
import { getDisplayName, formatDate, getUserProfileHref } from "@/lib/forum-display";
import { POSTS_PER_PAGE } from "@/lib/forum";

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function getExcerpt(text: string, query: string, contextLen = 120): string {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) return text.slice(0, contextLen * 2);
  const start = Math.max(0, idx - contextLen);
  const end = Math.min(text.length, idx + query.length + contextLen);
  return (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
}

export default function SearchResultPost({ result, query }: { result: PostSearchResult; query: string }) {
  const page = Math.ceil(result.postIndex / POSTS_PER_PAGE);
  const href = `/archive/topic/${result.topicId}${page > 1 ? `?page=${page}` : ""}`;
  const excerpt = getExcerpt(stripHtml(result.contentHtml), query);
  const authorName = getDisplayName(result.authorId);
  const authorHref = getUserProfileHref(result.authorId);

  return (
    <div className="px-4 py-3 transition-colors hover:bg-white/2.5">
      <div className="text-xs text-gray-600 mb-1">
        {result.forumName}
        {" › "}
        <Link
          href={`/archive/topic/${result.topicId}`}
          className="hover:text-gray-400 transition-colors"
        >
          {result.topicTitle}
        </Link>
      </div>
      <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">{excerpt}</p>
      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-600">
        <Link href={href} className="text-[#3a6ab0] hover:text-[#5082cc] transition-colors">
          View post
        </Link>
        {authorHref ? (
          <Link href={authorHref} className="text-gray-500 hover:text-gray-300 transition-colors">
            {authorName}
          </Link>
        ) : (
          <span>{authorName}</span>
        )}
        <span>{formatDate(result.createdAt)}</span>
      </div>
    </div>
  );
}
