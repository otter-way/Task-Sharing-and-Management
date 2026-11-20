import { expect, it } from "vite-plus/test";
import { pngFileName } from "./png-file-name";

it("keeps Turkish letters and removes characters file systems refuse", () => {
  expect(pngFileName("Rehberlik: 8/A  fikir tahtası")).toBe(
    "Rehberlik 8A fikir tahtası.png",
  );
  expect(pngFileName(" :*? ")).toBe("whiteboard.png");
});
