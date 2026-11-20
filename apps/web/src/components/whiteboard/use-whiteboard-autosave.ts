import type {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ProjectBoard } from "@/fetchers/project-board/get-project-board";
import saveProjectBoard from "@/fetchers/project-board/save-project-board";
import { projectBoardQueryKey } from "@/hooks/queries/project-board/use-get-project-board";
import { HttpError } from "@/lib/http-error";
import type { BoardElement } from "./board-element";
import { sceneSignature } from "./scene-signature";
import { toSavedScene } from "./to-saved-scene";

// Save shortly after the drawing settles, but never hold edits back longer
// than MAX_WAIT_MS while someone keeps drawing.
const DEBOUNCE_MS = 2000;
const MAX_WAIT_MS = 10_000;

export type SaveState =
  | "idle"
  | "pending"
  | "saving"
  | "saved"
  | "failed"
  | "tooLarge";

type Editor = { id: string; name: string } | null;
export type LastSave = { at: Date | string | null; by: Editor };
export type Overwritten = { by: Editor; at: Date | string };

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
  const baseVersion = useRef(board.version);
  // Null until the editor reports its first, freshly loaded scene.
  const savedSignature = useRef<string | null>(null);
  const latestSignature = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pendingSince = useRef<number | null>(null);
  const inFlight = useRef<Promise<void> | null>(null);
  const [state, setState] = useState<SaveState>("idle");
  const [lastSave, setLastSave] = useState<LastSave>({
    at: board.updatedAt,
    by: board.updatedBy,
  });

  const isDirty = useCallback(
    () =>
      inFlight.current !== null ||
      (latestSignature.current !== null &&
        latestSignature.current !== savedSignature.current),
    [],
  );

  const saveRef = useRef<() => Promise<void>>(async () => {});
  const schedule = useCallback(() => {
    const now = Date.now();
    pendingSince.current ??= now;
    clearTimeout(timer.current);
    const waited = now - pendingSince.current;
    timer.current = setTimeout(
      () => void saveRef.current(),
      Math.max(0, Math.min(DEBOUNCE_MS, MAX_WAIT_MS - waited)),
    );
  }, []);

  const save = useCallback(async (): Promise<void> => {
    clearTimeout(timer.current);
    pendingSince.current = null;
    if (!api || !enabled) return;
    // One request at a time; the newest scene is read after the wait.
    while (inFlight.current) await inFlight.current;
    const signature = latestSignature.current;
    if (signature === null || signature === savedSignature.current) return;

    const scene = toSavedScene(
      api.getSceneElementsIncludingDeleted() as readonly BoardElement[],
      api.getAppState().viewBackgroundColor,
      api.getFiles(),
    );
    setState("saving");

    const request = (async () => {
      try {
        const result = await saveProjectBoard(projectId, {
          baseVersion: baseVersion.current,
          scene,
        });
        baseVersion.current = result.version;
        savedSignature.current = signature;
        setLastSave({ at: result.updatedAt, by: me });
        // Keep the cache in step so reopening the tab shows this save, and so
        // the remote-change check does not mistake it for someone else's.
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
        if (result.overwritten) {
          onOverwritten({
            by: result.overwritten.updatedBy,
            at: result.overwritten.updatedAt,
          });
        }
        if (latestSignature.current === signature) {
          setState("saved");
        } else {
          setState("pending");
          schedule();
        }
      } catch (error) {
        setState(
          error instanceof HttpError && error.status === 413
            ? "tooLarge"
            : "failed",
        );
      }
    })();

    inFlight.current = request;
    await request;
    inFlight.current = null;
  }, [api, enabled, me, onOverwritten, projectId, queryClient, schedule]);

  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  const handleChange = useCallback(
    (
      elements: readonly BoardElement[],
      appState: AppState,
      files: BinaryFiles,
    ) => {
      const signature = sceneSignature(
        elements,
        Object.keys(files).length,
        appState.viewBackgroundColor,
      );
      latestSignature.current = signature;
      if (savedSignature.current === null) {
        savedSignature.current = signature;
        return;
      }
      if (!enabled || signature === savedSignature.current) return;
      setState((current) => (current === "saving" ? current : "pending"));
      schedule();
    },
    [enabled, schedule],
  );

  // Called after the canvas loads someone else's save: that scene is now the
  // saved state, and nothing local is waiting.
  const adopt = useCallback(
    (next: Pick<ProjectBoard, "version" | "updatedAt" | "updatedBy">) => {
      clearTimeout(timer.current);
      pendingSince.current = null;
      baseVersion.current = next.version;
      if (api) {
        const signature = currentSignature(api);
        savedSignature.current = signature;
        latestSignature.current = signature;
      }
      setLastSave({ at: next.updatedAt, by: next.updatedBy });
      setState("saved");
    },
    [api],
  );

  // Leaving the board saves what is pending, and the browser asks before a
  // reload or tab close would drop it.
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (enabled && isDirty()) event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => {
      window.removeEventListener("beforeunload", warn);
      if (pendingSince.current !== null) void save();
      clearTimeout(timer.current);
    };
  }, [enabled, isDirty, save]);

  return {
    state,
    lastSave,
    handleChange,
    saveNow: save,
    adopt,
    isDirty,
    baseVersion: () => baseVersion.current,
  };
}
