import redactionsConfig from "@/config/redactions.json";
import {
  getAllowedForums,
  getAllTopicsForSitemap,
  getTopicIdsForPosts,
} from "@/lib/forum";
import { forumHref, topicHref } from "@/lib/forum-display";
import type { MetadataRoute } from "next";

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? "https://aprilon.org").replace(
  /\/$/,
  "",
);

export default function sitemap(): MetadataRoute.Sitemap {
  const forums = getAllowedForums();
  const topics = getAllTopicsForSitemap();

  const redactedAt = redactionsConfig.lastUpdated
    ? new Date(redactionsConfig.lastUpdated).getTime()
    : 0;

  const redactedTopicIds = new Set([
    ...redactionsConfig.topics,
    ...getTopicIdsForPosts(redactionsConfig.posts),
  ]);

  return [
    {
      url: BASE,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${BASE}/archive`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/archive/graph`,
      changeFrequency: "never",
      priority: 0.5,
    },
    ...forums.map((f) => ({
      url: `${BASE}${forumHref(f)}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...topics.map((t) => ({
      url: `${BASE}${topicHref(t)}`,
      lastModified: new Date(
        redactedTopicIds.has(t.id)
          ? Math.max(t.lastPostAt * 1000, redactedAt)
          : t.lastPostAt * 1000,
      ),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
