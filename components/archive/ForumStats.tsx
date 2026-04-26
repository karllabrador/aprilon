import Link from "next/link";
import type { Topic } from "@/types";
import type { ActivityBucket } from "@/lib/forum";
import ActivityBarChart from "@/components/archive/ActivityBarChart";

type ForumStatsProps = {
  topTopics: Topic[];
  activity: ActivityBucket[];
};

export default function ForumStats({ topTopics, activity }: ForumStatsProps) {
  if (topTopics.length === 0 && activity.every((b) => b.postCount === 0 && b.topicCount === 0)) {
    return null;
  }

  return (
    <div
      className="mb-6 rounded-xl border overflow-hidden"
      style={{
        borderColor: "#2a2b2e",
        backgroundColor: "#1e1f21",
        boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
      }}
    >
      <div className="flex">
        {topTopics.length > 0 && (
          <div className="w-72 shrink-0 p-4 border-r" style={{ borderColor: "#252628" }}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-3">
              Popular Topics
            </p>
            <ol className="space-y-2.5">
              {topTopics.map((topic, i) => (
                <li key={topic.id} className="flex items-baseline gap-2">
                  <span
                    className="shrink-0 text-[10px] font-bold tabular-nums w-4 text-right"
                    style={{ color: ["#58a8f0", "#3070c0", "#2060a8"][i] }}
                  >
                    {i + 1}
                  </span>
                  <Link
                    href={`/archive/topic/${topic.id}`}
                    className="flex-1 min-w-0 text-xs text-gray-400 hover:text-gray-200 transition-colors truncate"
                  >
                    {topic.title}
                  </Link>
                  <span className="shrink-0 text-[10px] tabular-nums text-gray-600">
                    {topic.postCount.toLocaleString()}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="flex-1 min-w-0 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-3">
            Activity (2009 – 2016)
          </p>
          <ActivityBarChart data={activity} height={120} />
        </div>
      </div>
    </div>
  );
}
