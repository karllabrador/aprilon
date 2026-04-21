import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getContributorsWithSteam } from "@/lib/steam";
import type { Contributor } from "@/types";

const contributors: Contributor[] = [
  { name: "Alice", steamId: "alice", steamId64: "11111111111111111", roles: "Admin" },
  { name: "Bob", steamId: "bob", steamId64: "22222222222222222", roles: "Developer" },
];

const steamProfiles = [
  { steamid: "11111111111111111", personaname: "Alice_Steam", personastate: 1, avatarfull: "", profileurl: "", gameid: undefined },
  { steamid: "22222222222222222", personaname: "Bob_Steam", personastate: 0, avatarfull: "", profileurl: "", gameid: undefined },
];

beforeEach(() => {
  vi.stubEnv("STEAM_API_KEY", "test-key");
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("getContributorsWithSteam", () => {
  it("returns contributors without steam data when STEAM_API_KEY is missing", async () => {
    vi.unstubAllEnvs();
    delete process.env.STEAM_API_KEY;

    const result = await getContributorsWithSteam(contributors);
    expect(result).toHaveLength(2);
    expect(result[0].steam).toBeUndefined();
    expect(result[1].steam).toBeUndefined();
  });

  it("enriches contributors with matching Steam profiles", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ response: { players: steamProfiles } }),
    }));

    const result = await getContributorsWithSteam(contributors);
    expect(result[0].steam?.personaname).toBe("Alice_Steam");
    expect(result[1].steam?.personaname).toBe("Bob_Steam");
  });

  it("returns contributors without steam data when API responds with non-200", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500, statusText: "Server Error" }));

    const result = await getContributorsWithSteam(contributors);
    expect(result[0].steam).toBeUndefined();
    expect(result[1].steam).toBeUndefined();
  });

  it("sets steam to undefined for contributors not returned by the API", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ response: { players: [steamProfiles[0]] } }),
    }));

    const result = await getContributorsWithSteam(contributors);
    expect(result[0].steam?.personaname).toBe("Alice_Steam");
    expect(result[1].steam).toBeUndefined();
  });

  it("returns empty array when contributors is empty", async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);

    const result = await getContributorsWithSteam([]);
    expect(result).toEqual([]);
  });

  it("excludes contributors without steamId64 from the API request", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ response: { players: [steamProfiles[0]] } }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const mixed: Contributor[] = [
      { name: "Alice", steamId: "alice", steamId64: "11111111111111111", roles: "Admin" },
      { name: "NoId", steamId: "", steamId64: "", roles: "Member" },
    ];

    const result = await getContributorsWithSteam(mixed);
    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toContain("11111111111111111");
    expect(url).not.toContain(",,");
    expect(result[1].steam).toBeUndefined();
  });
});
