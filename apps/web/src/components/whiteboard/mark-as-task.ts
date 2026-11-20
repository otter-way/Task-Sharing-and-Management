import {
  type BoardElement,
  TASK_ID_FIELD,
  TASK_KEY_FIELD,
} from "./board-element";

// Excalidraw draws a link badge on any element with a link, which is the
// visible mark. The task id in customData lets the board reopen the task even
// if the link text is edited away. Bumping version and nonce is how Excalidraw
// itself records an edit, so undo and autosave both see it.
export function markAsTask<T extends BoardElement>(
  elements: readonly T[],
  targetId: string,
  task: { id: string; key: string; link: string },
): T[] {
  return elements.map((element) =>
    element.id === targetId
      ? {
          ...element,
          link: task.link,
          customData: {
            ...element.customData,
            [TASK_ID_FIELD]: task.id,
            [TASK_KEY_FIELD]: task.key,
          },
          version: element.version + 1,
          versionNonce: Math.floor(Math.random() * 2 ** 31),
          updated: Date.now(),
        }
      : element,
  );
}
