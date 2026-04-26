import type { Post } from "@/types";
import type { Redactions } from "@/lib/forum";
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
    (post.authorId !== null && redactions.users.includes(post.authorId));
  if (!redacted) return post;
  return { ...post, contentHtml: "<em>[This post has been redacted in the archive]</em>" };
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
