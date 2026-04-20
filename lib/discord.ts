export type DiscordStats = {
  memberCount: number;
  onlineCount: number;
};

export async function getDiscordStats(
  inviteCode: string,
): Promise<DiscordStats | null> {
  try {
    const res = await fetch(
      `https://discord.com/api/v9/invites/${inviteCode}?with_counts=true`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      memberCount: data.approximate_member_count,
      onlineCount: data.approximate_presence_count,
    };
  } catch {
    return null;
  }
}
