import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import ProjectLayout from "@/components/common/project-layout";
import PageTitle from "@/components/page-title";
import { errorMessage } from "@/components/project/error-message";
import TaskDetailsSheet from "@/components/task/task-details-sheet";
import { Button } from "@/components/ui/button";
import {
  createProjectNote,
  deleteProjectNote,
  type ProjectNote,
  type ProjectNoteSummary,
} from "@/fetchers/project-note/project-note-api";
import useGetProject from "@/hooks/queries/project/use-get-project";
import {
  projectNoteKeys,
  useProjectNote,
  useProjectNotes,
} from "@/hooks/queries/project-note/use-project-notes";
import { useWorkspacePermission } from "@/hooks/use-workspace-permission";
import { cn } from "@/lib/cn";
import { toast } from "@/lib/toast";
import { DeleteNoteDialog } from "./delete-note-dialog";
import { NewNoteMenu } from "./new-note-menu";
import { NoteList } from "./note-list";
import { NotePage } from "./note-page";
import { buildNoteTemplate, type NoteTemplateId } from "./note-templates";
import { NotesEmptyState } from "./notes-empty-state";

type NotesScreenProps = {
  projectId: string;
  workspaceId: string;
  noteId: string | undefined;
  taskId: string | undefined;
  onSelectNote: (noteId: string | undefined) => void;
  onOpenTask: (taskId: string) => void;
  onCloseTask: () => void;
};

function Message({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center text-muted-foreground text-sm">
      {children}
    </div>
  );
}

export function NotesScreen({
  projectId,
  workspaceId,
  noteId,
  taskId,
  onSelectNote,
  onOpenTask,
  onCloseTask,
}: NotesScreenProps) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const { data: project } = useGetProject({ id: projectId, workspaceId });
  const notes = useProjectNotes(projectId);
  const note = useProjectNote(projectId, noteId);
  const permissions = useWorkspacePermission();
  const canEdit = permissions.canUpdateTasks();
  const [creating, setCreating] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // The open note renders its status and buttons into the project header row.
  const [summarySlot, setSummarySlot] = useState<HTMLDivElement | null>(null);
  const [toolbarSlot, setToolbarSlot] = useState<HTMLDivElement | null>(null);

  const create = async (template: NoteTemplateId) => {
    setCreating(true);
    try {
      const today = new Intl.DateTimeFormat(i18n.language, {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date());
      const created = (await createProjectNote(
        projectId,
        buildNoteTemplate(template, t, today) as Parameters<
          typeof createProjectNote
        >[1],
      )) as ProjectNote;
      queryClient.setQueryData(
        projectNoteKeys.note(projectId, created.id),
        created,
      );
      queryClient.setQueryData<ProjectNoteSummary[]>(
        projectNoteKeys.list(projectId),
        (old) => [created, ...(old ?? [])],
      );
      onSelectNote(created.id);
    } catch (error) {
      toast.error(errorMessage(error, t("notes:createError")));
    } finally {
      setCreating(false);
    }
  };

  const confirmDelete = async () => {
    if (!noteId) return;
    setDeleting(true);
    try {
      await deleteProjectNote(noteId);
      queryClient.setQueryData<ProjectNoteSummary[]>(
        projectNoteKeys.list(projectId),
        (old) => old?.filter((item) => item.id !== noteId),
      );
      setDeleteOpen(false);
      onSelectNote(undefined);
      toast.success(t("notes:delete.success"));
    } catch (error) {
      toast.error(errorMessage(error, t("notes:delete.error")));
    } finally {
      setDeleting(false);
    }
  };

  const list = notes.data ?? [];
  const hasNotes = list.length > 0;

  let body: React.ReactNode;
  if (notes.isError) {
    body = (
      <Message>
        <p className="font-medium text-foreground">{t("notes:loadError")}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void notes.refetch()}
        >
          {t("notes:retry")}
        </Button>
      </Message>
    );
  } else if (notes.isLoading || permissions.isCheckingPermissions) {
    body = <Message>{t("notes:loading")}</Message>;
  } else if (!hasNotes && !noteId) {
    body = (
      <NotesEmptyState
        canCreate={canEdit}
        creating={creating}
        onCreate={(template) => void create(template)}
      />
    );
  } else {
    let main: React.ReactNode;
    if (!noteId) {
      main = <Message>{t("notes:noneSelected")}</Message>;
    } else if (note.isError) {
      main = <Message>{t("notes:deleted")}</Message>;
    } else if (!note.data) {
      main = <Message>{t("notes:loading")}</Message>;
    } else {
      main = (
        <NotePage
          key={note.data.id}
          note={note.data}
          workspaceId={workspaceId}
          projectSlug={project?.slug}
          canEdit={canEdit}
          canCreateTasks={permissions.canCreateTasks()}
          canDeleteOthers={permissions.canDeleteTasks()}
          summarySlot={summarySlot}
          toolbarSlot={toolbarSlot}
          onOpenTask={onOpenTask}
          onDelete={() => setDeleteOpen(true)}
        />
      );
    }

    body = (
      <div className="flex h-full min-h-0">
        <aside
          className={cn(
            "flex w-full shrink-0 flex-col gap-2 overflow-y-auto border-border/80 p-2 md:w-64 md:border-r",
            noteId && "max-md:hidden",
          )}
        >
          {canEdit && (
            <div className="px-0.5">
              <NewNoteMenu
                disabled={creating}
                onCreate={(template) => void create(template)}
              />
            </div>
          )}
          <NoteList notes={list} activeId={noteId} />
        </aside>
        <main
          className={cn(
            "min-w-0 flex-1 overflow-y-auto",
            !noteId && "max-md:hidden",
          )}
        >
          {noteId && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="m-2 md:hidden"
              onClick={() => onSelectNote(undefined)}
            >
              <ArrowLeft aria-hidden="true" />
              {t("notes:backToList")}
            </Button>
          )}
          {main}
        </main>
      </div>
    );
  }

  return (
    <ProjectLayout
      projectId={projectId}
      workspaceId={workspaceId}
      activeView="notes"
      summary={<div ref={setSummarySlot} className="min-w-0" />}
      toolbar={<div ref={setToolbarSlot} className="flex items-center gap-1" />}
    >
      <PageTitle
        title={
          project ? t("notes:pageTitle", { name: project.name }) : undefined
        }
      />
      <div className="h-full min-h-0 bg-background">{body}</div>
      <DeleteNoteDialog
        title={note.data?.title || t("notes:untitled")}
        open={deleteOpen}
        deleting={deleting}
        onOpenChange={setDeleteOpen}
        onConfirm={() => void confirmDelete()}
      />
      <TaskDetailsSheet
        taskId={taskId}
        projectId={projectId}
        workspaceId={workspaceId}
        onClose={onCloseTask}
      />
    </ProjectLayout>
  );
}
