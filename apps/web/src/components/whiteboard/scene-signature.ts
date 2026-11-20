import type { BoardElement } from "./board-element";

// Every Excalidraw edit, deletion and undo bumps an element's version, so the
// count plus the version sum changes whenever the drawing does. Cheap enough to
// run on every editor change, unlike serialising the scene.
export function sceneSignature(
  elements: readonly BoardElement[],
  fileCount: number,
  background: string,
) {
  let versions = 0;
  for (const element of elements) versions += element.version;
  return `${elements.length}:${versions}:${fileCount}:${background}`;
}
