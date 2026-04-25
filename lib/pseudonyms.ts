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

function hash32(n: number): number {
  let h = n >>> 0;
  h = (Math.imul(h ^ (h >>> 16), 0x45d9f3b)) >>> 0;
  h = (Math.imul(h ^ (h >>> 16), 0x45d9f3b)) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

export function computeDisplayName(id: number): string {
  const h1 = hash32(id);
  const h2 = hash32(h1 + 1);
  const h3 = hash32(h2 + 1);
  return `${ADJECTIVES[h1 % ADJECTIVES.length]}${ANIMALS[h2 % ANIMALS.length]}${NOUNS[h3 % NOUNS.length]}`;
}
