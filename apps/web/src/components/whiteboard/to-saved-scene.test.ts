import { expect, it } from "vite-plus/test";
import type { BoardElement } from "./board-element";
import { toSavedScene } from "./to-saved-scene";

it("keeps live elements and only the images they still use", () => {
  const elements: BoardElement[] = [
    { id: "a", type: "text", version: 1, isDeleted: false, text: "Fikir" },
    { id: "b", type: "rectangle", version: 3, isDeleted: true },
    { id: "c", type: "image", version: 1, isDeleted: false, fileId: "f1" },
    { id: "d", type: "image", version: 1, isDeleted: true, fileId: "f2" },
  ];

  expect(
    toSavedScene(elements, "#ffffff", { f1: { id: "f1" }, f2: { id: "f2" } }),
  ).toEqual({
    elements: [elements[0], elements[2]],
    appState: { viewBackgroundColor: "#ffffff" },
    files: { f1: { id: "f1" } },
  });
});

it("leaves files out when no image is on the board", () => {
  expect(toSavedScene([], "#ffffff", { f1: {} })).toEqual({
    elements: [],
    appState: { viewBackgroundColor: "#ffffff" },
  });
});
