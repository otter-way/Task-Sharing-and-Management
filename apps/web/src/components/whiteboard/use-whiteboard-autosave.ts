import type {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  type Editor,
  type Overwritten,
  type SaveResult,
  useAutosave,
} from "@/components/common/autosave/use-autosave";
import type { ProjectBoard } from "@/fetchers/project-board/get-project-board";
import saveProjectBoard from "@/fetchers/project-board/save-project-board";
import { projectBoardQueryKey } from "@/hooks/queries/project-board/use-get-project-board";
import type { BoardElement } from "./board-element";
import { sceneSignature } from "./scene-signature";
import { toSavedScene } from "./to-saved-scene";

type Scene = ReturnType<typeof toSavedScene>;

function currentSignature(api: ExcalidrawImperativeAPI) {
  return sceneSignature(
    api.getSceneElementsIncludingDeleted() as readonly BoardElement[],
    Object.keys(api.getFiles()).length,
    api.getAppState().viewBackgroundColor,
  );
}

export function useWhiteboardAutosave({
  projectId,
  api,
  board,
  me,
  enabled,
  onOverwritten,
}: {
  projectId: string;
  api: ExcalidrawImperativeAPI | null;
  board: ProjectBoard;
  me: Editor;
  enabled: boolean;
  onOverwritten: (overwritten: Overwritten) => void;
}) {
  const queryClient = useQueryClient();

  const read = useCallback(
    () =>
      api
        ? {
            signature: currentSignature(api),
            payload: toSavedScene(
              api.getSceneElementsIncludingDeleted() as readonly BoardElement[],
              api.getAppState().viewBackgroundColor,
              api.getFiles(),
            ),
          }
        : null,
    [api],
  );

  const send = useCallback(
    (scene: Scene, baseVersion: number) =>
      saveProjectBoard(projectId, { baseVersion, scene }),
    [projectId],
  );

  // Keep the cache in step so reopening the tab shows this save, and so the
  // remote-change check does not mistake it for someone else's.
  const onSaved = useCallback(
    (scene: Scene, result: SaveResult) => {
      queryClient.setQueryData<ProjectBoard>(
        projectBoardQueryKey(projectId),
        (old) =>
          old && {
            ...old,
            scene: scene as unknown as ProjectBoard["scene"],
            version: result.version,
            updatedAt: result.updatedAt,
            updatedBy: me,
          },
      );
    },
    [me, projectId, queryClient],
  );

  const autosave = useAutosave({
    enabled,
    initial: board,
    me,
    read,
    send,
    onSaved,
    onOverwritten,
  });
  const { notifyChange, adopt: adoptSaved } = autosave;

  const handleChange = useCallback(
    (
      elements: readonly BoardElement[],
      appState: AppState,
      files: BinaryFiles,
    ) => {
      notifyChange(
        sceneSignature(
          elements,
          Object.keys(files).length,
          appState.viewBackgroundColor,
        ),
      );
    },
    [notifyChange],
  );

  const adopt = useCallback(
    (next: Pick<ProjectBoard, "version" | "updatedAt" | "updatedBy">) =>
      adoptSaved(next, api ? currentSignature(api) : null),
    [adoptSaved, api],
  );

  return { ...autosave, handleChange, adopt };
}
