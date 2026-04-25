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
        className="rounded-lg overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #2a5050 0%, #1e3838 50%, #1e3030 100%)",
          padding: "1px",
          boxShadow: "0 0 0 1px #1a2e2e, 0 4px 24px rgba(42, 80, 80, 0.2), 0 1px 6px rgba(0,0,0,0.4)",
        }}
        id={`post-${post.id}`}
      >
        <div className="rounded-[7px] overflow-hidden">
          {/* OP header */}
          <div
            className="flex items-center justify-between px-4 py-2.5 border-b"
            style={{
              background: "linear-gradient(to right, #0f2020, #0d1a1a)",
              borderColor: "#1e3030",
            }}
          >
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt=""
                width={22}
                height={22}
                className="rounded-sm"
                style={{ opacity: 1 }}
              />
              {href ? (
                <Link href={href} className="text-xs font-semibold text-gray-300 hover:text-gray-100 transition-colors">
                  {name}
                </Link>
              ) : (
                <span className="text-xs font-semibold text-gray-300">{name}</span>
              )}
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide"
                style={{ backgroundColor: "#1a3838", color: "#5a9898", border: "1px solid #2a5050" }}
              >
                OP
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>{formatDateTime(post.createdAt)}</span>
              <a href={`#post-${post.id}`} className="text-gray-600 hover:text-gray-400 transition-colors">
                #1
              </a>
            </div>
          </div>

          {/* OP body */}
          <div
            className="px-4 py-4 text-sm text-gray-200 leading-relaxed prose-archive"
            style={{ backgroundColor: "#0c1616" }}
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="border rounded overflow-hidden"
      style={{ borderColor: "#1e2424" }}
      id={`post-${post.id}`}
    >
      {/* Post header */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{ backgroundColor: "#0f1414", borderColor: "#1e2424" }}
      >
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarUrl}
            alt=""
            width={20}
            height={20}
            className="rounded-sm opacity-80"
          />
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

      {/* Post body */}
      <div
        className="px-4 py-4 text-sm text-gray-300 leading-relaxed prose-archive"
        style={{ backgroundColor: "#0c1010" }}
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    </div>
  );
}
