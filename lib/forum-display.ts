import type { Post } from "@/types";
import type { Redactions } from "@/lib/forum";

// ---------------------------------------------------------------------------
// Deterministic pseudonym generation
// Each user ID always maps to the same adjective + animal + noun triple.
// ---------------------------------------------------------------------------

const ADJECTIVES = [
  "Ancient", "Angry", "Bold", "Brave", "Bright", "Burning", "Calm", "Clever",
  "Crimson", "Cunning", "Dark", "Dusty", "Fierce", "Frozen", "Golden", "Grim",
  "Hidden", "Hollow", "Iron", "Jolly", "Lazy", "Mighty", "Noble", "Quick",
  "Reckless", "Rusty", "Shiny", "Silent", "Sneaky", "Stormy", "Swift", "Tiny",
  "Toxic", "Wild", "Wise", "Worthy",
];

const ANIMALS = [
  "Armadillo", "Badger", "Bear", "Beaver", "Capybara", "Cobra", "Eagle",
  "Ferret", "Fox", "Gecko", "Goat", "Hawk", "Hippo", "Hyena", "Lynx",
  "Mantis", "Moose", "Narwhal", "Otter", "Owl", "Panda", "Penguin",
  "Platypus", "Raven", "Rhino", "Sloth", "Tiger", "Vulture", "Walrus",
  "Wombat", "Wolf",
];

const NOUNS = [
  "Axe", "Badge", "Blade", "Boots", "Bow", "Cape", "Claw", "Coin",
  "Crown", "Fang", "Flame", "Forge", "Gate", "Gem", "Helm", "House",
  "Knight", "Map", "Mark", "Rock", "Rune", "Scroll", "Shield", "Spear",
  "Star", "Storm", "Throne", "Tower", "Vault",
];

// Thomas Wang integer hash — low-correlation across all three selections
function hash32(n: number): number {
  let h = n >>> 0;
  h = (Math.imul(h ^ (h >>> 16), 0x45d9f3b)) >>> 0;
  h = (Math.imul(h ^ (h >>> 16), 0x45d9f3b)) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

export function getUserProfileHref(authorId: number | null): string | null {
  if (!authorId || authorId === 1) return null;
  return `/archive/user/${authorId}`;
}

export function getDisplayName(authorId: number | null): string {
  if (!authorId || authorId === 1) return "Anonymous";
  const h1 = hash32(authorId);
  const h2 = hash32(h1 + 1);
  const h3 = hash32(h2 + 1);
  const adj = ADJECTIVES[h1 % ADJECTIVES.length];
  const animal = ANIMALS[h2 % ANIMALS.length];
  const noun = NOUNS[h3 % NOUNS.length];
  return `${adj}${animal}${noun}`;
}

// DiceBear pixel-art avatar — deterministic from the pseudonym
export function getAvatarUrl(authorId: number | null): string {
  if (!authorId || authorId === 1) return "https://api.dicebear.com/9.x/pixel-art/svg?seed=Anonymous";
  const name = getDisplayName(authorId);
  return `https://api.dicebear.com/9.x/pixel-art/svg?seed=${encodeURIComponent(name)}`;
}

// ---------------------------------------------------------------------------
// Redaction
// ---------------------------------------------------------------------------

export function applyRedaction(post: Post, redactions: Redactions): Post {
  const r = redactions.posts[String(post.id)];
  if (!r) return post;
  return {
    ...post,
    contentHtml: r === true ? "<em>[Redacted]</em>" : `<p>${r}</p>`,
  };
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
