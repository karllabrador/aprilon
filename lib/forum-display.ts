import type { Post } from "@/types";
import type { Redactions } from "@/lib/forum";
import { getTopic } from "@/lib/forum";
import { computeDisplayName } from "@/lib/pseudonyms";

export function getUserProfileHref(authorId: number | null): string | null {
  if (!authorId || authorId === 1) return null;
  return `/archive/user/${authorId}`;
}

export function getDisplayName(authorId: number | null): string {
  if (!authorId || authorId === 1) return "Anonymous";
  return computeDisplayName(authorId);
}

export function getAvatarUrl(authorId: number | null): string {
  if (!authorId || authorId === 1) return "https://api.dicebear.com/9.x/pixel-art/svg?seed=Anonymous";
  const name = getDisplayName(authorId);
  return `https://api.dicebear.com/9.x/pixel-art/svg?seed=${encodeURIComponent(name)}`;
}

// ---------------------------------------------------------------------------
// Redaction
// ---------------------------------------------------------------------------

export function applyRedaction<T extends Post>(post: T, redactions: Redactions): T {
  const redacted =
    redactions.posts.includes(post.id) ||
    redactions.topics.includes(post.topicId) ||
    (post.authorId !== null && redactions.users.includes(post.authorId));
  if (!redacted) return post;
  return { ...post, contentHtml: "<em>[This post has been redacted in the archive]</em>" };
}

// ---------------------------------------------------------------------------
// Internal link rewriting
// ---------------------------------------------------------------------------

const INTERNAL_LINK_RE =
  /<a(\s[^>]*?)href="https?:\/\/(?:www\.)?aprilon\.(?:net|org)\/(?:forum\/)?viewtopic\.php([^"]*)"([^>]*)>([\s\S]*?)<\/a>/gi;

export function rewriteInternalLinks(html: string): string {
  return html.replace(INTERNAL_LINK_RE, (_match, pre, query, post, text) => {
    const normalized = query.replace(/&amp;/g, "&");
    const idMatch = normalized.match(/[?&]t=(\d+)/);
    if (!idMatch) return _match;

    const topicId = Number(idMatch[1]);
    const newHref = `/archive/topic/${topicId}`;

    const plainText = text.replace(/<[^>]+>/g, "").trim();
    const isUrlLike =
      plainText.includes("viewtopic") ||
      plainText.includes("aprilon.net") ||
      plainText.includes("aprilon.org");

    let newText = text;
    if (isUrlLike) {
      const topic = getTopic(topicId);
      newText = topic ? topic.title : `Topic #${topicId}`;
    }

    return `<a${pre}href="${newHref}"${post}>${newText}</a>`;
  });
}

// ---------------------------------------------------------------------------
// Date formatting
// ---------------------------------------------------------------------------

export function formatDate(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
