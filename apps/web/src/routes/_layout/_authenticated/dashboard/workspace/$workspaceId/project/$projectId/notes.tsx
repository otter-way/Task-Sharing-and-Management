import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { NotesScreen } from "@/components/notes/notes-screen";

type NotesSearchParams = {
  noteId?: string;
  taskId?: string;
};

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/workspace/$workspaceId/project/$projectId/notes",
)({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): NotesSearchParams => ({
    noteId: typeof search.noteId === "string" ? search.noteId : undefined,
    taskId: typeof search.taskId === "string" ? search.taskId : undefined,
  }),
});

function RouteComponent() {
  const { projectId, workspaceId } = Route.useParams();
  const { noteId, taskId } = Route.useSearch();
  const navigate = useNavigate();

  const handleSelectNote = useCallback(
    (nextNoteId: string | undefined) => {
      navigate({ to: ".", search: nextNoteId ? { noteId: nextNoteId } : {} });
    },
    [navigate],
  );

  // Tasks open in the side sheet so the note stays where it was.
  const handleOpenTask = useCallback(
    (nextTaskId: string) => {
      navigate({
        to: ".",
        search: { noteId, taskId: nextTaskId },
        replace: true,
      });
    },
    [navigate, noteId],
  );

  const handleCloseTask = useCallback(() => {
    navigate({ to: ".", search: { noteId }, replace: true });
  }, [navigate, noteId]);

  return (
    <NotesScreen
      projectId={projectId}
      workspaceId={workspaceId}
      noteId={noteId}
      taskId={taskId}
      onSelectNote={handleSelectNote}
      onOpenTask={handleOpenTask}
      onCloseTask={handleCloseTask}
    />
  );
}
