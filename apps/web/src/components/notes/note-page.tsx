import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { formatSaveTime } from "@/components/common/autosave/format-save-time";
import { SaveStatus } from "@/components/common/autosave/save-status";
import type { Overwritten } from "@/components/common/autosave/use-autosave";
import { useAuth } from "@/components/providers/auth-provider/hooks/use-auth";
import { useCreateTaskFromText } from "@/components/shared/convert-to-task/use-create-task-from-text";
import type { ProjectNote } from "@/fetchers/project-note/project-note-api";
import { useProjectNote } from "@/hooks/queries/project-note/use-project-notes";
import { useDocumentTheme } from "@/hooks/use-document-theme";
import { toast } from "@/lib/toast";
import {
  type ChecklistTarget,
  findChecklistTarget,
  type NoteBlock,
  taskIdFromHref,
  withTaskLink,
} from "./checklist-task";
import { MAX_IMAGE_BYTES } from "./image-to-data-url";
import { NoteActions } from "./note-actions";
import type { NoteEditorInstance } from "./note-editor";
import { useNoteAutosave } from "./use-note-autosave";

// BlockNote and its styles load only when a note opens.
const NoteEditor = lazy(() => import("./note-editor"));

function sameTarget(a: ChecklistTarget | null, b: ChecklistTarget | null) {
  return (
    a?.blockId === b?.blockId && a?.taskId === b?.taskId && a?.text === b?.text
  );
}

type NotePageProps = {
  note: ProjectNote;
  workspaceId: string;
  projectSlug: string | undefined;
  canEdit: boolean;
  canCreateTasks: boolean;
  canDeleteOthers: boolean;
  summarySlot: HTMLElement | null;
  toolbarSlot: HTMLElement | null;
  onOpenTask: (taskId: string) => void;
  onDelete: () => void;
};

export function NotePage({
  note,
  workspaceId,
  projectSlug,
  canEdit,
  canCreateTasks,
  canDeleteOthers,
  summarySlot,
  toolbarSlot,
  onOpenTask,
  onDelete,
}: NotePageProps) {
  const { t, i18n } = useTranslation();
  const theme = useDocumentTheme();
  const { user } = useAuth();
  const { data: latest } = useProjectNote(note.projectId, note.id);
  const [me] = useState(() =>
    user ? { id: user.id, name: user.name ?? "" } : null,
  );
  const [editor, setEditor] = useState<NoteEditorInstance | null>(null);
  const [title, setTitle] = useState(note.title);
  const [target, setTarget] = useState<ChecklistTarget | null>(null);
  // Set while a teammate's version is being loaded, so that load is not
  // mistaken for an edit and saved straight back.
  const applyingRemote = useRef(false);

  const handleOverwritten = useCallback(
    ({ by, at }: Overwritten) => {
      toast.warning(
        t("common:autosave.overwritten", {
          name: by?.name || t("common:autosave.teammate"),
          time: formatSaveTime(new Date(at), new Date(), i18n.language),
        }),
      );
    },
    [i18n.language, t],
  );

  const autosave = useNoteAutosave({
    note,
    editor,
    me,
    enabled: canEdit,
    onOverwritten: handleOverwritten,
  });
  const { start, contentChanged, titleChanged, adopt, isDirty, baseVersion } =
    autosave;

  const { createFromText, creating } = useCreateTaskFromText({
    projectId: note.projectId,
    workspaceId,
    projectSlug,
    onOpenTask,
  });

  const handleReady = useCallback(
    (instance: NoteEditorInstance) => {
      setEditor(instance);
      start();
    },
    [start],
  );

  const refreshTarget = useCallback(() => {
    if (!editor) return;
    const blocks = editor.getSelection()?.blocks ?? [
      editor.getTextCursorPosition().block,
    ];
    const next = findChecklistTarget(blocks as unknown as NoteBlock[]);
    setTarget((current) => (sameTarget(current, next) ? current : next));
  }, [editor]);

  const handleChange = useCallback(() => {
    if (applyingRemote.current) return;
    contentChanged();
    refreshTarget();
  }, [contentChanged, refreshTarget]);

  // A teammate saved. An untouched note takes their version; with local edits
  // pending, this person's save wins and the server reports whose work it
  // replaced (see handleOverwritten).
  useEffect(() => {
    if (!editor || !latest || latest.version <= baseVersion() || isDirty()) {
      return;
    }
    applyingRemote.current = true;
    editor.replaceBlocks(
      editor.document,
      (latest.content.length > 0
        ? latest.content
        : [{ type: "paragraph" }]) as Parameters<
        NoteEditorInstance["replaceBlocks"]
      >[1],
    );
    applyingRemote.current = false;
    setTitle(latest.title);
    adopt(latest);
  }, [adopt, baseVersion, editor, isDirty, latest]);

  const convert = async (next: ChecklistTarget) => {
    if (!editor) return;
    const task = await createFromText(next.text);
    const block = task && editor.getBlock(next.blockId);
    if (!task || !block) return;
    editor.updateBlock(block, {
      content: withTaskLink(block.content, task) as Parameters<
        NoteEditorInstance["updateBlock"]
      >[1]["content"],
    });
    // Back to writing: the click moved focus to the toolbar button.
    editor.focus();
  };

  // Task links inside the note open the task beside it, like elsewhere in
  // the project, instead of leaving the page.
  const handleClickCapture = (event: React.MouseEvent) => {
    const anchor = (event.target as Element).closest("a[href]");
    const taskId = anchor && taskIdFromHref(anchor.getAttribute("href") ?? "");
    if (!taskId) return;
    event.preventDefault();
    onOpenTask(taskId);
  };

  const createdAt = new Intl.DateTimeFormat(i18n.language, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(note.createdAt));
  const isMine = note.createdBy?.id === me?.id;

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
          <NoteActions
            target={target}
            canConvert={canEdit && canCreateTasks}
            converting={creating}
            canDelete={canEdit && (isMine || canDeleteOthers)}
            onConvert={(next) => void convert(next)}
            onOpenTask={onOpenTask}
            onDelete={onDelete}
          />,
          toolbarSlot,
        )}
      <article
        className="mx-auto w-full max-w-3xl px-4 pt-8 pb-24 sm:px-8"
        onClickCapture={handleClickCapture}
      >
        <input
          value={title}
          readOnly={!canEdit}
          onChange={(event) => {
            setTitle(event.target.value);
            titleChanged(event.target.value);
          }}
          maxLength={200}
          placeholder={t("notes:titlePlaceholder")}
          aria-label={t("notes:titlePlaceholder")}
          className="w-full bg-transparent font-semibold text-2xl text-foreground tracking-tight outline-none placeholder:text-muted-foreground/60 sm:text-3xl"
        />
        <p className="mt-2 mb-6 text-muted-foreground text-xs">
          {t("notes:meta.created", {
            name: note.createdBy?.name || t("common:autosave.teammate"),
            date: createdAt,
          })}
        </p>
        <Suspense
          fallback={
            <p className="text-muted-foreground text-sm">
              {t("notes:loading")}
            </p>
          }
        >
          <NoteEditor
            initialContent={note.content}
            editable={canEdit}
            theme={theme}
            onReady={handleReady}
            onChange={handleChange}
            onSelectionChange={refreshTarget}
            onImageRejected={() =>
              toast.error(
                t("notes:imageTooLarge", {
                  size: `${MAX_IMAGE_BYTES / 1024 / 1024} MB`,
                }),
              )
            }
          />
        </Suspense>
      </article>
    </>
  );
}
