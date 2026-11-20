import { describe, expect, it } from "vite-plus/test";
import { foldSearchText } from "../../../apps/api/src/search/fold-search-text";

describe("foldSearchText", () => {
  it("treats every Turkish i as the same letter", () => {
    expect(foldSearchText("İstanbul")).toBe("istanbul");
    expect(foldSearchText("ISTANBUL")).toBe("istanbul");
    expect(foldSearchText("IŞIK")).toBe("isik");
    expect(foldSearchText("ışık")).toBe("isik");
  });

  it("ignores Turkish letter marks", () => {
    expect(foldSearchText("Görev Güncelleme Çağrısı")).toBe(
      "gorev guncelleme cagrisi",
    );
    expect(foldSearchText("ŞEKER")).toBe("seker");
  });

  it("joins decomposed letters before folding", () => {
    expect(foldSearchText("Şeker")).toBe("seker");
  });

  it("leaves other accents alone so the database matches the same text", () => {
    expect(foldSearchText("Café")).toBe("café");
  });
});
