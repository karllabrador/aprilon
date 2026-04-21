import { Contributor, ContributorWithSteam, SteamProfile } from "@/types";

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
