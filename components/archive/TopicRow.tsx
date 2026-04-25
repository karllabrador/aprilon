import Link from "next/link";
import { getDisplayName, getAvatarUrl, formatDate, formatDateTime, getUserProfileHref } from "@/lib/forum-display";
import type { Topic } from "@/types";

type TopicRowProps = {
  topic: Topic;
};

export default function TopicRow({ topic }: TopicRowProps) {
  const authorName = getDisplayName(topic.authorId);
  const authorHref = getUserProfileHref(topic.authorId);
  const lastPosterName = getDisplayName(topic.lastPosterId);
  const lastPosterHref = getUserProfileHref(topic.lastPosterId);
  const lastPosterAvatar = getAvatarUrl(topic.lastPosterId);

  return (
    <div
      className="flex items-center gap-6 px-4 py-3.5 border-b last:border-b-0"
      style={{ borderColor: "#1a1f1f" }}
    >
      {/* Left: title + author/date below */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          {topic.isSticky && (
            <span className="shrink-0 text-[10px] uppercase tracking-wider text-amber-600/70 border border-amber-600/30 rounded px-1 py-0.5">
              Sticky
            </span>
          )}
          <Link
            href={`/archive/topic/${topic.id}`}
            className="text-[#ededed] hover:text-white transition-colors truncate font-medium"
          >
            {topic.title}
          </Link>
        </div>
        <p className="text-[11px] text-gray-600">
          {authorHref ? (
            <Link href={authorHref} className="text-gray-500 hover:text-gray-300 transition-colors">
              {authorName}
            </Link>
          ) : (
            <span className="text-gray-500">{authorName}</span>
          )}
          <span className="mx-1.5 text-gray-700">·</span>
          {formatDate(topic.createdAt)}
        </p>
      </div>

      {/* Right: last post info — fixed-width columns so every row aligns */}
      <div className="shrink-0 flex items-stretch border-l" style={{ borderColor: "#1a2424" }}>
        {/* Post count — fixed width */}
        <div className="w-20 flex flex-col items-center justify-center px-3 leading-tight">
          <p className="text-base font-semibold text-gray-400 tabular-nums">
            {topic.postCount.toLocaleString()}
          </p>
          <p className="text-[10px] text-gray-700 uppercase tracking-wide">
            {topic.postCount === 1 ? "reply" : "replies"}
          </p>
        </div>

        {/* Divider */}
        <div className="w-px" style={{ backgroundColor: "#1a2424" }} />

        {/* Last poster — fixed width */}
        <div className="w-52 flex items-center justify-end gap-2.5 px-3">
          <div className="text-right overflow-hidden">
            {lastPosterHref ? (
              <Link href={lastPosterHref} className="text-xs text-gray-400 hover:text-gray-200 transition-colors truncate block">
                {lastPosterName}
              </Link>
            ) : (
              <p className="text-xs text-gray-400 truncate">{lastPosterName}</p>
            )}
            <p className="text-[10px] text-gray-600 whitespace-nowrap">{formatDateTime(topic.lastPostAt)}</p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lastPosterAvatar}
            alt=""
            width={28}
            height={28}
            className="rounded shrink-0"
            style={{
              border: "1px solid #2a4040",
              boxShadow: "0 0 0 1px #1a2e2e",
            }}
          />
        </div>
      </div>
    </div>
  );
}
