import type {
  BinaryFileData,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types";
import type { ProjectBoard } from "@/fetchers/project-board/get-project-board";

// Loads a teammate's save into an open, unchanged canvas. It stays out of the
// undo history: undo should not bring back a version someone else replaced.
export async function applyRemoteScene(
  api: ExcalidrawImperativeAPI,
  board: ProjectBoard,
) {
  const { restoreElements } = await import("@excalidraw/excalidraw");
  const files = Object.values(board.scene?.files ?? {}) as BinaryFileData[];
  if (files.length > 0) api.addFiles(files);
  api.updateScene({
    elements: restoreElements(
      (board.scene?.elements ?? []) as unknown as Parameters<
        typeof restoreElements
      >[0],
      null,
    ),
    appState: {
      viewBackgroundColor:
        (board.scene?.appState?.viewBackgroundColor as string | undefined) ??
        "#ffffff",
    },
    captureUpdate: "NEVER",
  });
}
