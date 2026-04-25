import Link from "next/link";
import type { Forum } from "@/types";

type ForumCardProps = {
  forum: Forum;
};

export default function ForumCard({ forum }: ForumCardProps) {
  return (
    <Link
      href={`/archive/forum/${forum.id}`}
      className="group block border rounded-lg p-4 transition-colors hover:bg-[#232426]"
      style={{
        borderColor: "#2a2b2e",
        backgroundColor: "#1e1f21",
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[#ededed] font-medium truncate group-hover:text-white transition-colors">
            {forum.name}
          </p>
          {forum.description && (
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{forum.description}</p>
          )}
        </div>
        <div className="shrink-0 flex">
          <div className="w-24 flex flex-col items-center">
            <p className="text-lg font-semibold text-gray-300 tabular-nums leading-none">
              {forum.topicCount.toLocaleString()}
            </p>
            <p className="text-[10px] text-gray-600 uppercase tracking-wide mt-0.5">topics</p>
          </div>
          <div className="w-24 flex flex-col items-center">
            <p className="text-lg font-semibold text-gray-300 tabular-nums leading-none">
              {forum.postCount.toLocaleString()}
            </p>
            <p className="text-[10px] text-gray-600 uppercase tracking-wide mt-0.5">posts</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
