import { describe, expect, it } from "vite-plus/test";
import { capitalizeText, toUpperText } from "./text-case";

describe("toUpperText", () => {
  it("uses Turkish rules for Turkish", () => {
    expect(toUpperText("ilker ışık", "tr-TR")).toBe("İLKER IŞIK");
  });

  it("uses the language's own rules elsewhere", () => {
    expect(toUpperText("ilker", "en-US")).toBe("ILKER");
  });
});

describe("capitalizeText", () => {
  it("uppercases only the first letter", () => {
    expect(capitalizeText("istanbul", "tr-TR")).toBe("İstanbul");
    expect(capitalizeText("", "tr-TR")).toBe("");
  });
});
