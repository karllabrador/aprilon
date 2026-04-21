import { describe, expect, it } from "vitest";
import { parseValue } from "@/lib/parseValue";

describe("parseValue", () => {
  it("parses a value with a decimal and suffix", () => {
    expect(parseValue("21.3K")).toEqual({ num: 21.3, suffix: "K", decimals: 1 });
  });

  it("preserves the decimal count from the string, not the number", () => {
    expect(parseValue("322.3K")).toEqual({ num: 322.3, suffix: "K", decimals: 1 });
  });

  it("parses a decimal value with no suffix", () => {
    expect(parseValue("1.5")).toEqual({ num: 1.5, suffix: "", decimals: 1 });
  });

  it("parses an integer with no suffix", () => {
    expect(parseValue("123")).toEqual({ num: 123, suffix: "", decimals: 0 });
  });

  it("parses zero with a suffix", () => {
    expect(parseValue("0K")).toEqual({ num: 0, suffix: "K", decimals: 0 });
  });

  it("returns num=0 and suffix=input for non-numeric strings", () => {
    expect(parseValue("invalid")).toEqual({ num: 0, suffix: "invalid", decimals: 0 });
  });

  it("returns num=0 and empty suffix for empty string", () => {
    expect(parseValue("")).toEqual({ num: 0, suffix: "", decimals: 0 });
  });

  it("handles multi-character suffix", () => {
    expect(parseValue("1.5GB")).toEqual({ num: 1.5, suffix: "GB", decimals: 1 });
  });
});
