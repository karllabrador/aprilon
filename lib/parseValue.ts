export function parseValue(str: string) {
  const m = str.match(/^([\d.]+)([A-Za-z]*)$/);

  if (!m) return { num: 0, suffix: str, decimals: 0 };

  const num = parseFloat(m[1]);
  const decimals = (m[1].split(".")[1] ?? "").length;

  return {
    num,
    suffix: m[2],
    decimals,
  };
}
