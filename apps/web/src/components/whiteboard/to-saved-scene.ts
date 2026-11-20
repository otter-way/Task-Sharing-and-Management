import type { SaveProjectBoardRequest } from "@/fetchers/project-board/save-project-board";
import type { BoardElement } from "./board-element";

type SavedScene = SaveProjectBoardRequest["scene"];

// Deleted elements and images no longer on the board are dropped; the board is
// saved whole every time, so leftovers would only grow it.
export function toSavedScene(
  elements: readonly BoardElement[],
  background: string,
  files: Readonly<Record<string, unknown>>,
): SavedScene {
  const live = elements.filter((element) => !element.isDeleted);
  const fileIds = new Set(
    live.flatMap((element) => (element.fileId ? [element.fileId] : [])),
  );
  const usedFiles = Object.fromEntries(
    Object.entries(files).filter(([id]) => fileIds.has(id)),
  );

  return {
    elements: live as unknown as SavedScene["elements"],
    appState: { viewBackgroundColor: background },
    ...(Object.keys(usedFiles).length > 0 ? { files: usedFiles } : {}),
  };
}
