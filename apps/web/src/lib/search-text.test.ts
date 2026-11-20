import { describe, expect, it } from "vite-plus/test";
import { foldSearchText, isSameText, matchesSearch } from "./search-text";

describe("foldSearchText", () => {
  it("treats every Turkish i as the same letter", () => {
    expect(foldSearchText("İstanbul")).toBe("istanbul");
    expect(foldSearchText("ISTANBUL")).toBe("istanbul");
    expect(foldSearchText("IŞIK")).toBe("isik");
  });

  it("ignores Turkish letter marks", () => {
    expect(foldSearchText("Görev Güncelleme Çağrısı")).toBe(
      "gorev guncelleme cagrisi",
    );
  });
});

describe("matchesSearch", () => {
  it("finds Turkish text however the query is typed", () => {
    expect(matchesSearch("Işık raporu", "ışık")).toBe(true);
    expect(matchesSearch("Işık raporu", "ISIK")).toBe(true);
    expect(matchesSearch("İstanbul toplantısı", "istanbul")).toBe(true);
    expect(matchesSearch("Görev listesi", "gorev")).toBe(true);
    expect(matchesSearch("Görev listesi", "proje")).toBe(false);
  });

  it("matches everything for an empty query", () => {
    expect(matchesSearch("Görev", "  ")).toBe(true);
    expect(matchesSearch(null, "")).toBe(true);
  });
});

describe("isSameText", () => {
  it("ignores case with Turkish rules", () => {
    expect(isSameText("IŞIK", "ışık")).toBe(true);
    expect(isSameText("İzmir", "izmir")).toBe(true);
  });

  it("keeps letter marks apart", () => {
    expect(isSameText("Işık", "Isik")).toBe(false);
  });
});
