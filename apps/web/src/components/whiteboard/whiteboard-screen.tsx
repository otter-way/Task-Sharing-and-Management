import { useState } from "react";
import { useTranslation } from "react-i18next";
import ProjectLayout from "@/components/common/project-layout";
import PageTitle from "@/components/page-title";
import TaskDetailsSheet from "@/components/task/task-details-sheet";
import { Button } from "@/components/ui/button";
import useGetProject from "@/hooks/queries/project/use-get-project";
import { useGetProjectBoard } from "@/hooks/queries/project-board/use-get-project-board";
import { useWorkspacePermission } from "@/hooks/use-workspace-permission";
import { WhiteboardEditor } from "./whiteboard-editor";
import { WhiteboardMessage } from "./whiteboard-message";

type WhiteboardScreenProps = {
  projectId: string;
  workspaceId: string;
  taskId: string | undefined;
  onOpenTask: (taskId: string) => void;
  onCloseTask: () => void;
};

export function WhiteboardScreen({
  projectId,
  workspaceId,
  taskId,
  onOpenTask,
  onCloseTask,
}: WhiteboardScreenProps) {
  const { t } = useTranslation();
  const { data: project } = useGetProject({ id: projectId, workspaceId });
  const { data: board, isError, refetch } = useGetProjectBoard(projectId);
  const permissions = useWorkspacePermission();
  // The editor renders its status and buttons into the project header row.
  const [summarySlot, setSummarySlot] = useState<HTMLDivElement | null>(null);
  const [toolbarSlot, setToolbarSlot] = useState<HTMLDivElement | null>(null);
  // The first loaded board seeds the editor once; later saves arrive through
  // the same query and are merged by the editor itself.
  const [initialBoard, setInitialBoard] = useState(board);
  if (board && !initialBoard) setInitialBoard(board);

  return (
    <ProjectLayout
      projectId={projectId}
      workspaceId={workspaceId}
      activeView="whiteboard"
      summary={<div ref={setSummarySlot} className="min-w-0" />}
      toolbar={<div ref={setToolbarSlot} className="flex items-center gap-1" />}
    >
      <PageTitle
        title={
          project
            ? t("whiteboard:pageTitle", { name: project.name })
            : undefined
        }
      />
      <div className="relative h-full min-h-0 bg-background">
        {initialBoard && !permissions.isCheckingPermissions ? (
          <WhiteboardEditor
            initialBoard={initialBoard}
            projectId={projectId}
            workspaceId={workspaceId}
            projectName={project?.name}
            projectSlug={project?.slug}
            canEdit={permissions.canUpdateTasks()}
            canCreateTasks={permissions.canCreateTasks()}
            summarySlot={summarySlot}
            toolbarSlot={toolbarSlot}
            onOpenTask={onOpenTask}
          />
        ) : isError ? (
          <WhiteboardMessage>
            <p className="font-medium text-foreground">
              {t("whiteboard:loadError")}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
            >
              {t("whiteboard:retry")}
            </Button>
          </WhiteboardMessage>
        ) : (
          <WhiteboardMessage>{t("whiteboard:loading")}</WhiteboardMessage>
        )}
      </div>
      <TaskDetailsSheet
        taskId={taskId}
        projectId={projectId}
        workspaceId={workspaceId}
        onClose={onCloseTask}
      />
    </ProjectLayout>
  );
}
