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

// Matches <a href="..."> or <a href='...'> pointing to any aprilon viewtopic URL
const INTERNAL_LINK_RE =
  /<a(\s[^>]*?)href=(["'])https?:\/\/(?:[\w-]+\.)*aprilon\.(?:net|org)\/[^"']*?viewtopic\.php([^"']*)\2([^>]*)>([\s\S]*?)<\/a>/gi;

// Matches bare aprilon viewtopic URLs not inside an HTML attribute (not preceded by = " ')
const BARE_URL_RE =
  /(?<![="'])https?:\/\/(?:[\w-]+\.)*aprilon\.(?:net|org)\/[^\s"'<>]*?viewtopic\.php[^\s"'<>]*/gi;

function resolveTopicUrl(rawQuery: string): string | null {
  const normalized = rawQuery.replace(/&amp;/g, "&").replace(/%26/g, "&");
  const m = normalized.match(/[?&]t=(\d+)/);
  return m ? `/archive/topic/${m[1]}` : null;
}

function decodeHrefEntities(html: string): string {
  return html.replace(/href=(["'])([^"']*)\1/gi, (_, quote, url) =>
    `href=${quote}${url.replace(/&#(\d+);/g, (_: string, n: string) => String.fromCharCode(Number(n)))}${quote}`,
  );
}

export function rewriteInternalLinks(html: string): string {
  const decoded = decodeHrefEntities(html);
  // Rewrite <a href> links
  let result = decoded.replace(INTERNAL_LINK_RE, (_match, pre, _quote, query, post, text) => {
    const newHref = resolveTopicUrl(query);
    if (!newHref) return _match;

    const topicId = Number(newHref.split("/").pop());
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

  // Rewrite any bare URLs not inside an attribute
  result = result.replace(BARE_URL_RE, (match) => {
    const newHref = resolveTopicUrl(match);
    if (!newHref) return match;
    const topicId = Number(newHref.split("/").pop());
    const topic = getTopic(topicId);
    const label = topic ? topic.title : `Topic #${topicId}`;
    return `<a href="${newHref}">${label}</a>`;
  });

  return result;
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
