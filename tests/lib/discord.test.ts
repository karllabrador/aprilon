import { afterEach, describe, expect, it, vi } from "vitest";
import { getDiscordStats } from "@/lib/discord";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getDiscordStats", () => {
  it("returns memberCount and onlineCount on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        approximate_member_count: 31,
        approximate_presence_count: 5,
      }),
    }));

    const result = await getDiscordStats("testcode");
    expect(result).toEqual({ memberCount: 31, onlineCount: 5 });
  });

  it("returns null when response is not ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
    }));

    const result = await getDiscordStats("testcode");
    expect(result).toBeNull();
  });

  it("returns null when fetch throws a network error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));

    const result = await getDiscordStats("testcode");
    expect(result).toBeNull();
  });

  it("returns null when json() throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => { throw new Error("Malformed JSON"); },
    }));

    const result = await getDiscordStats("testcode");
    expect(result).toBeNull();
  });

  it("calls the correct Discord API URL", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        approximate_member_count: 10,
        approximate_presence_count: 2,
      }),
    });
    vi.stubGlobal("fetch", mockFetch);

    await getDiscordStats("sTBfWTG");

    expect(mockFetch).toHaveBeenCalledWith(
      "https://discord.com/api/v9/invites/sTBfWTG?with_counts=true",
      expect.objectContaining({ next: { revalidate: 300 } }),
    );
  });
});
