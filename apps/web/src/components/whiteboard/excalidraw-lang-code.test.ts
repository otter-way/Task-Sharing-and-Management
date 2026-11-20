import { expect, it } from "vite-plus/test";
import { excalidrawLangCode } from "./excalidraw-lang-code";

it("maps app locales to Excalidraw language codes", () => {
  expect(excalidrawLangCode("tr-TR")).toBe("tr-TR");
  expect(excalidrawLangCode("en-US")).toBe("en");
  expect(excalidrawLangCode("de-DE")).toBe("de-DE");
});
