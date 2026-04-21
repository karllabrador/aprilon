import { describe, expect, it } from "vitest";
import { getStatusStyle } from "@/components/contributor/ContributorCard";

describe("getStatusStyle", () => {
  it("returns gray gradient when steam is undefined", () => {
    const style = getStatusStyle(undefined);
    expect(style.background).toContain("#706C6B");
  });

  it("returns gray gradient when personastate is 0 (offline)", () => {
    const style = getStatusStyle({ personastate: 0 } as never);
    expect(style.background).toContain("#706C6B");
  });

  it("returns blue gradient when personastate is 1 (online)", () => {
    const style = getStatusStyle({ personastate: 1 } as never);
    expect(style.background).toContain("#7BAFD6");
  });

  it("returns blue gradient when personastate is 2 (busy)", () => {
    const style = getStatusStyle({ personastate: 2 } as never);
    expect(style.background).toContain("#7BAFD6");
  });

  it("returns green gradient when gameid is present", () => {
    const style = getStatusStyle({ personastate: 0, gameid: "730" } as never);
    expect(style.background).toContain("#9BC861");
  });

  it("gameid takes priority over personastate for green", () => {
    const style = getStatusStyle({ personastate: 1, gameid: "440" } as never);
    expect(style.background).toContain("#9BC861");
  });

  it('gameid of "0" is treated as falsy — returns blue when personastate is 1', () => {
    const style = getStatusStyle({ personastate: 1, gameid: "0" } as never);
    expect(style.background).toContain("#7BAFD6");
  });

  it('gameid of "0" is treated as falsy — returns gray when personastate is 0', () => {
    const style = getStatusStyle({ personastate: 0, gameid: "0" } as never);
    expect(style.background).toContain("#706C6B");
  });
});
