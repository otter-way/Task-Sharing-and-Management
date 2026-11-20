import { expect, it } from "vite-plus/test";
import type { BoardElement } from "./board-element";
import { sceneSignature } from "./scene-signature";

const element = (id: string, version: number): BoardElement => ({
  id,
  type: "rectangle",
  version,
  isDeleted: false,
});

it("changes when an element is edited, added, or the background changes", () => {
  const base = sceneSignature([element("a", 1)], 0, "#ffffff");
  expect(sceneSignature([element("a", 1)], 0, "#ffffff")).toBe(base);
  expect(sceneSignature([element("a", 2)], 0, "#ffffff")).not.toBe(base);
  expect(
    sceneSignature([element("a", 1), element("b", 1)], 0, "#ffffff"),
  ).not.toBe(base);
  expect(sceneSignature([element("a", 1)], 1, "#ffffff")).not.toBe(base);
  expect(sceneSignature([element("a", 1)], 0, "#fff9db")).not.toBe(base);
});
