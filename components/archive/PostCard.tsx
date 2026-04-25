import Link from "next/link";
import { getDisplayName, getAvatarUrl, formatDateTime, getUserProfileHref } from "@/lib/forum-display";
import type { Post } from "@/types";

type PostCardProps = {
  post: Post;
  index: number;
  isOP?: boolean;
};

export default function PostCard({ post, index, isOP = false }: PostCardProps) {
  const name = getDisplayName(post.authorId);
  const avatarUrl = getAvatarUrl(post.authorId);
  const href = getUserProfileHref(post.authorId);

  if (isOP) {
    return (
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1e4a4a 0%, #1a3c3c 50%, #162e2e 100%)",
          padding: "1px",
          boxShadow: "0 0 0 1px rgba(90,160,160,0.12), 0 4px 32px rgba(30,70,70,0.35), 0 1px 8px rgba(0,0,0,0.4)",
        }}
        id={`post-${post.id}`}
      >
        <div className="rounded-[11px] overflow-hidden">
          <div
            className="flex items-center justify-between px-4 py-2.5 border-b"
            style={{ background: "linear-gradient(to right, #162828, #1a2e2e)", borderColor: "#1e3838" }}
          >
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatarUrl} alt="" width={22} height={22} className="rounded-sm" />
              {href ? (
                <Link href={href} className="text-xs font-semibold text-teal-300/80 hover:text-teal-200 transition-colors">
                  {name}
                </Link>
              ) : (
                <span className="text-xs font-semibold text-teal-300/80">{name}</span>
              )}
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide"
                style={{ backgroundColor: "#1a3838", color: "#5ac8c8", border: "1px solid #2a5858" }}
              >
                OP
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>{formatDateTime(post.createdAt)}</span>
              <a href={`#post-${post.id}`} className="text-gray-600 hover:text-gray-400 transition-colors">#1</a>
            </div>
          </div>
          <div
            className="px-4 py-4 text-sm text-gray-200 leading-relaxed prose-archive"
            style={{ backgroundColor: "#1e2e2e" }}
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="border rounded-lg overflow-hidden"
      style={{ borderColor: "#2a2b2e" }}
      id={`post-${post.id}`}
    >
      <div
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{ backgroundColor: "#18191b", borderColor: "#252628" }}
      >
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatarUrl} alt="" width={20} height={20} className="rounded-sm opacity-80" />
          {href ? (
            <Link href={href} className="text-xs font-medium text-gray-400 hover:text-gray-200 transition-colors">
              {name}
            </Link>
          ) : (
            <span className="text-xs font-medium text-gray-400">{name}</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>{formatDateTime(post.createdAt)}</span>
          <a href={`#post-${post.id}`} className="text-gray-600 hover:text-gray-400 transition-colors">
            #{index + 1}
          </a>
        </div>
      </div>
      <div
        className="px-4 py-4 text-sm text-gray-300 leading-relaxed prose-archive"
        style={{ backgroundColor: "#1e1f21" }}
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    </div>
  );
}
