import Link from "next/link";
import type { UserSearchResult } from "@/lib/forum";
import { getAvatarUrl } from "@/lib/forum-display";

export default function SearchResultUser({ result }: { result: UserSearchResult }) {
  const avatarUrl = getAvatarUrl(result.id);

  return (
    <div className="px-4 py-3 flex items-center gap-3 transition-colors hover:bg-white/2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={avatarUrl}
        alt=""
        width={36}
        height={36}
        className="rounded-lg shrink-0"
        style={{
          border: "1px solid #2a2b2e",
          boxShadow: "0 0 0 1px #18191b",
          imageRendering: "pixelated",
        }}
      />
      <div className="flex-1 min-w-0">
        <Link
          href={`/archive/user/${result.id}`}
          className="text-sm font-medium text-[#ededed] hover:text-white transition-colors"
        >
          {result.displayName}
        </Link>
        <p className="text-xs text-gray-600 mt-0.5">
          {result.postCount.toLocaleString()} posts · {result.topicCount.toLocaleString()} topics
        </p>
      </div>
      <Link
        href={`/archive?uid=${result.id}`}
        className="shrink-0 text-xs text-[#3a6ab0] hover:text-[#5082cc] transition-colors"
      >
        See activity →
      </Link>
    </div>
  );
}
