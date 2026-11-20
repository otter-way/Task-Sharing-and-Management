import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef } from "react";
import {
  type Editor,
  type Overwritten,
  type SaveResult,
  useAutosave,
} from "@/components/common/autosave/use-autosave";
import {
  type ProjectNote,
  type ProjectNoteSummary,
  saveProjectNote,
} from "@/fetchers/project-note/project-note-api";
import { projectNoteKeys } from "@/hooks/queries/project-note/use-project-notes";
import type { NoteEditorInstance } from "./note-editor";

type Payload = { title: string; content: ProjectNote["content"] };

// Notes can carry images, so the document is never serialised just to notice
// an edit. Every editor change bumps a counter instead, and the title plus
// that counter is the signature autosave compares.
export function useNoteAutosave({
  note,
  editor,
  me,
  enabled,
  onOverwritten,
}: {
  note: ProjectNote;
  editor: NoteEditorInstance | null;
  me: Editor;
  enabled: boolean;
  onOverwritten: (overwritten: Overwritten) => void;
}) {
  const queryClient = useQueryClient();
  const title = useRef(note.title);
  const changes = useRef(0);
  const signature = useCallback(
    () => `${changes.current}\u0000${title.current}`,
    [],
  );

  const read = useCallback(
    () =>
      editor
        ? {
            signature: signature(),
            payload: {
              title: title.current.trim(),
              content: editor.document as unknown as Payload["content"],
            },
          }
        : null,
    [editor, signature],
  );

  const send = useCallback(
    (payload: Payload, baseVersion: number) =>
      saveProjectNote(note.id, {
        baseVersion,
        ...payload,
      }) as Promise<SaveResult>,
    [note.id],
  );

  // Keep the open note and the list in step with this save, so neither looks
  // like someone else's newer version.
  const onSaved = useCallback(
    (payload: Payload, result: SaveResult) => {
      const changed = {
        title: payload.title,
        version: result.version,
        updatedAt: result.updatedAt,
        updatedBy: me,
      };
      queryClient.setQueryData<ProjectNote>(
        projectNoteKeys.note(note.projectId, note.id),
        (old) => old && { ...old, ...changed, content: payload.content },
      );
      queryClient.setQueryData<ProjectNoteSummary[]>(
        projectNoteKeys.list(note.projectId),
        (old) =>
          old
            ?.map((item) =>
              item.id === note.id ? { ...item, ...changed } : item,
            )
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
      );
    },
    [me, note.id, note.projectId, queryClient],
  );

  const autosave = useAutosave({
    enabled,
    initial: note,
    me,
    read,
    send,
    onSaved,
    onOverwritten,
  });
  const { notifyChange, adopt: adoptSaved } = autosave;

  return {
    ...autosave,
    // Seeds the saved state once the editor has loaded the note.
    start: useCallback(
      () => notifyChange(signature()),
      [notifyChange, signature],
    ),
    contentChanged: useCallback(() => {
      changes.current += 1;
      notifyChange(signature());
    }, [notifyChange, signature]),
    titleChanged: useCallback(
      (next: string) => {
        title.current = next;
        notifyChange(signature());
      },
      [notifyChange, signature],
    ),
    adopt: useCallback(
      (next: ProjectNote) => {
        title.current = next.title;
        adoptSaved(next, signature());
      },
      [adoptSaved, signature],
    ),
  };
}
