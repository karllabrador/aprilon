import Link from "next/link";
import { notFound } from "next/navigation";
import ArchiveHeader from "@/components/archive/ArchiveHeader";
import ActivityBarChart from "@/components/archive/ActivityBarChart";
import ForumDistributionChart from "@/components/archive/ForumDistributionChart";
import { getUserStats, getUserActivity, getUserForumActivity, getUserDates } from "@/lib/forum";
import { getDisplayName, getAvatarUrl, formatDateTime } from "@/lib/forum-display";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ userId: string }>;
};

export default async function UserPage({ params }: Props) {
  const { userId } = await params;
  const uid = Number(userId);
  if (!uid || uid < 1) notFound();

  const displayName = getDisplayName(uid);
  const avatarUrl = getAvatarUrl(uid);
  const stats = getUserStats(uid);
  const activity = getUserActivity(uid);
  const forumActivity = getUserForumActivity(uid);
  const dates = getUserDates(uid);

  if (stats.posts === 0 && stats.topics === 0) notFound();

  return (
    <>
      <ArchiveHeader breadcrumbs={[{ label: displayName }]} />
      <main className="container max-w-336 mx-auto max-[1344px]:px-6 py-10">

        {/* ── Profile header ── */}
        <div className="flex items-center gap-6 mb-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarUrl}
            alt=""
            width={96}
            height={96}
            className="rounded-xl shrink-0"
            style={{
              border: "2px solid #2e4a90",
              boxShadow: "0 0 0 1px #1e3a78, 0 4px 32px rgba(40,70,170,0.3)",
              imageRendering: "pixelated",
            }}
          />
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-[#ededed]">{displayName}</h1>
              <Link
                href={`/archive?uid=${uid}`}
                className="text-xs px-2 py-1 rounded transition-colors"
                style={{ backgroundColor: "#1e2028", color: "#5a8fd4", border: "1px solid #2e3248" }}
              >
                See all activity →
              </Link>
            </div>
            <p className="text-sm text-gray-600 mt-0.5">User #{uid}</p>
            <div className="flex items-center gap-5 mt-4">
              <div>
                <p className="text-xl font-semibold text-gray-300 tabular-nums leading-none">
                  {stats.posts.toLocaleString()}
                </p>
                <p className="text-[10px] text-gray-600 uppercase tracking-wide mt-0.5">Posts</p>
              </div>
              <div className="w-px h-8" style={{ backgroundColor: "#3d3e45" }} />
              <div>
                <p className="text-xl font-semibold text-gray-300 tabular-nums leading-none">
                  {stats.topics.toLocaleString()}
                </p>
                <p className="text-[10px] text-gray-600 uppercase tracking-wide mt-0.5">Topics</p>
              </div>
              {dates.joinedAt && (
                <>
                  <div className="w-px h-8" style={{ backgroundColor: "#3d3e45" }} />
                  <div>
                    <p className="text-sm font-medium text-gray-300 leading-none">
                      {formatDateTime(dates.joinedAt)}
                    </p>
                    <p className="text-[10px] text-gray-600 uppercase tracking-wide mt-0.5">Joined</p>
                  </div>
                </>
              )}
              {dates.lastPostAt && (
                <>
                  <div className="w-px h-8" style={{ backgroundColor: "#3d3e45" }} />
                  <div>
                    <p className="text-sm font-medium text-gray-300 leading-none">
                      {formatDateTime(dates.lastPostAt)}
                    </p>
                    <p className="text-[10px] text-gray-600 uppercase tracking-wide mt-0.5">Last post</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Activity graph ── */}
        <div className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
            Activity (2009 – 2016)
          </h2>
          <div
            className="rounded-lg border p-4"
            style={{ borderColor: "#2a2b2e", backgroundColor: "#1e1f21" }}
          >
            <ActivityBarChart data={activity} height={200} />
          </div>
        </div>

        {/* ── Forum distribution ── */}
        {forumActivity.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
              Active In
            </h2>
            <div
              className="rounded-lg border p-4"
              style={{ borderColor: "#2a2b2e", backgroundColor: "#1e1f21" }}
            >
              <ForumDistributionChart data={forumActivity} />
            </div>
          </div>
        )}
      </main>
    </>
  );
}
