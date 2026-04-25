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
              border: "2px solid #2a4848",
              boxShadow: "0 0 0 1px #1a2e2e, 0 4px 32px rgba(42,80,80,0.25)",
              imageRendering: "pixelated",
            }}
          />
          <div>
            <h1 className="text-2xl font-bold text-[#ededed]">{displayName}</h1>
            <p className="text-sm text-gray-600 mt-0.5">User #{uid}</p>
            <div className="flex items-center gap-5 mt-4">
              <div>
                <p className="text-xl font-semibold text-gray-300 tabular-nums leading-none">
                  {stats.posts.toLocaleString()}
                </p>
                <p className="text-[10px] text-gray-600 uppercase tracking-wide mt-0.5">Posts</p>
              </div>
              <div className="w-px h-8" style={{ backgroundColor: "#1e2424" }} />
              <div>
                <p className="text-xl font-semibold text-gray-300 tabular-nums leading-none">
                  {stats.topics.toLocaleString()}
                </p>
                <p className="text-[10px] text-gray-600 uppercase tracking-wide mt-0.5">Topics</p>
              </div>
              {dates.joinedAt && (
                <>
                  <div className="w-px h-8" style={{ backgroundColor: "#1e2424" }} />
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
                  <div className="w-px h-8" style={{ backgroundColor: "#1e2424" }} />
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
            style={{ borderColor: "#1a2828", backgroundColor: "#0a1212" }}
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
              style={{ borderColor: "#1a2828", backgroundColor: "#0a1212" }}
            >
              <ForumDistributionChart data={forumActivity} />
            </div>
          </div>
        )}
      </main>
    </>
  );
}
