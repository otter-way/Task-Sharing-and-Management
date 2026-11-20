import type {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/components/providers/auth-provider/hooks/use-auth";
import type { ProjectBoard } from "@/fetchers/project-board/get-project-board";
import { useGetProjectBoard } from "@/hooks/queries/project-board/use-get-project-board";
import { toast } from "@/lib/toast";
import { applyRemoteScene } from "./apply-remote-scene";
import { BoardActions } from "./board-actions";
import type { BoardElement } from "./board-element";
import { excalidrawLangCode } from "./excalidraw-lang-code";
import { exportBoardPng } from "./export-board-png";
import {
  type ConvertibleSelection,
  findConvertibleSelection,
} from "./find-convertible-selection";
import { formatSaveTime } from "./format-save-time";
import { SaveStatus } from "./save-status";
import { useConvertToTask } from "./use-convert-to-task";
import { useDocumentTheme } from "./use-document-theme";
import {
  type Overwritten,
  useWhiteboardAutosave,
} from "./use-whiteboard-autosave";
import { WhiteboardMessage } from "./whiteboard-message";

// The editor and its styles load only when a whiteboard opens.
const WhiteboardCanvas = lazy(() => import("./whiteboard-canvas"));

const DEFAULT_BACKGROUND = "#ffffff";

function sameSelection(
  a: ConvertibleSelection | null,
  b: ConvertibleSelection | null,
) {
  return (
    a?.targetId === b?.targetId &&
    a?.taskId === b?.taskId &&
    a?.text === b?.text
  );
}

type WhiteboardEditorProps = {
  initialBoard: ProjectBoard;
  projectId: string;
  workspaceId: string;
  projectName: string | undefined;
  projectSlug: string | undefined;
  canEdit: boolean;
  canCreateTasks: boolean;
  summarySlot: HTMLElement | null;
  toolbarSlot: HTMLElement | null;
  onOpenTask: (taskId: string) => void;
};

export function WhiteboardEditor({
  initialBoard,
  projectId,
  workspaceId,
  projectName,
  projectSlug,
  canEdit,
  canCreateTasks,
  summarySlot,
  toolbarSlot,
  onOpenTask,
}: WhiteboardEditorProps) {
  const { t, i18n } = useTranslation();
  const theme = useDocumentTheme();
  const { user } = useAuth();
  const { data: latestBoard } = useGetProjectBoard(projectId);
  const [api, setApi] = useState<ExcalidrawImperativeAPI | null>(null);
  const [selection, setSelection] = useState<ConvertibleSelection | null>(null);
  const [hasElements, setHasElements] = useState(
    (initialBoard.scene?.elements.length ?? 0) > 0,
  );

  const [me] = useState(() =>
    user ? { id: user.id, name: user.name ?? "" } : null,
  );
  const [initialData] = useState<ExcalidrawInitialDataState>(() => ({
    elements: (initialBoard.scene?.elements ??
      []) as unknown as ExcalidrawInitialDataState["elements"],
    appState: {
      viewBackgroundColor:
        (initialBoard.scene?.appState?.viewBackgroundColor as
          | string
          | undefined) ?? DEFAULT_BACKGROUND,
    },
    files: initialBoard.scene?.files as ExcalidrawInitialDataState["files"],
    scrollToContent: true,
  }));

  const handleOverwritten = useCallback(
    ({ by, at }: Overwritten) => {
      toast.warning(
        t("whiteboard:overwritten", {
          name: by?.name || t("whiteboard:teammate"),
          time: formatSaveTime(new Date(at), new Date(), i18n.language),
        }),
      );
    },
    [i18n.language, t],
  );

  const autosave = useWhiteboardAutosave({
    projectId,
    api,
    board: initialBoard,
    me,
    enabled: canEdit,
    onOverwritten: handleOverwritten,
  });

  const { convert, converting } = useConvertToTask({
    api,
    projectId,
    workspaceId,
    projectSlug,
    onOpenTask,
  });

  const {
    handleChange: autosaveChange,
    adopt,
    isDirty,
    baseVersion,
  } = autosave;

  const handleChange = useCallback(
    (
      elements: readonly BoardElement[],
      appState: AppState,
      files: BinaryFiles,
    ) => {
      autosaveChange(elements, appState, files);
      setHasElements(elements.some((element) => !element.isDeleted));
      // With nothing selected there is nothing to look up. Otherwise the
      // selected text may have been edited or converted, so look again.
      const next =
        Object.keys(appState.selectedElementIds).length === 0
          ? null
          : findConvertibleSelection(elements, appState.selectedElementIds);
      setSelection((current) =>
        sameSelection(current, next) ? current : next,
      );
    },
    [autosaveChange],
  );

  // A teammate saved. An untouched canvas takes their version; with local
  // edits pending, this person's save wins and the server reports whose work
  // it replaced (see handleOverwritten).
  useEffect(() => {
    if (!api || !latestBoard || latestBoard.version <= baseVersion()) return;
    if (isDirty()) return;
    let cancelled = false;
    void applyRemoteScene(api, latestBoard).then(() => {
      if (!cancelled) adopt(latestBoard);
    });
    return () => {
      cancelled = true;
    };
  }, [adopt, api, baseVersion, isDirty, latestBoard]);

  const handleLinkOpen = useCallback(
    (element: { customData?: Record<string, unknown> }, event: CustomEvent) => {
      const taskId = element.customData?.kaneoTaskId;
      if (typeof taskId !== "string") return;
      event.preventDefault();
      onOpenTask(taskId);
    },
    [onOpenTask],
  );

  const handleExport = async () => {
    if (!api) return;
    try {
      await exportBoardPng(
        api,
        t("whiteboard:export.fileName", {
          name: projectName ?? t("whiteboard:title"),
        }),
      );
    } catch {
      toast.error(t("whiteboard:export.error"));
    }
  };

  return (
    <>
      {summarySlot &&
        createPortal(
          <SaveStatus
            state={autosave.state}
            lastSave={autosave.lastSave}
            meId={me?.id}
            readOnly={!canEdit}
            onRetry={() => void autosave.saveNow()}
          />,
          summarySlot,
        )}
      {toolbarSlot &&
        createPortal(
          <BoardActions
            selection={selection}
            canConvert={canEdit && canCreateTasks}
            converting={converting}
            canExport={hasElements && api !== null}
            onConvert={(next) => void convert(next)}
            onOpenTask={onOpenTask}
            onExport={() => void handleExport()}
          />,
          toolbarSlot,
        )}
      <Suspense
        fallback={
          <WhiteboardMessage>{t("whiteboard:loading")}</WhiteboardMessage>
        }
      >
        <WhiteboardCanvas
          excalidrawAPI={setApi}
          initialData={initialData}
          onChange={handleChange}
          onLinkOpen={handleLinkOpen}
          viewModeEnabled={!canEdit}
          theme={theme}
          langCode={excalidrawLangCode(i18n.language)}
          emptyHeading={t("whiteboard:empty.heading")}
        />
      </Suspense>
    </>
  );
}
