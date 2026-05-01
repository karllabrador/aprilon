import { Contributor, ContributorWithSteam, SteamProfile } from "@/types";

export async function getSteamGroupMemberCount(groupUrl: string): Promise<number | null> {
  try {
    const name = groupUrl.replace(/\/$/, "").split("/").pop();
    const res = await fetch(
      `https://steamcommunity.com/groups/${name}/memberslistxml/?xml=1`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return null;
    const xml = await res.text();
    const m = xml.match(/<memberCount>(\d+)<\/memberCount>/);
    return m ? Number(m[1]) : null;
  } catch {
    return null;
  }
}

type SteamApiResponse = {
  response: {
    players: SteamProfile[];
  };
};

export async function getContributorsWithSteam(
  contributors: Contributor[],
): Promise<ContributorWithSteam[]> {
  if (!process.env.STEAM_API_KEY) {
    console.warn(
      "STEAM_API_KEY is not set. Returning contributors without Steam data.",
    );
    return contributors.map((x) => ({ ...x, steam: undefined }));
  }

  const steamIds = contributors
    .filter((x) => x.steamId64)
    .map((x) => x.steamId64)
    .join(",");

  if (!steamIds) {
    return contributors.map((x) => ({ ...x, steam: undefined }));
  }

  const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${steamIds}`;

  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) {
    console.error(
      `Steam API request failed: ${res.status} ${res.statusText} with SteamIDs ${steamIds}`,
    );
    return contributors.map((x) => ({ ...x, steam: undefined }));
  }

  const json: SteamApiResponse = await res.json();

  const profileMap = new Map(json.response.players.map((x) => [x.steamid, x]));
  return contributors.map((x) => ({
    ...x,
    steam: profileMap.get(x.steamId64),
  }));
}
