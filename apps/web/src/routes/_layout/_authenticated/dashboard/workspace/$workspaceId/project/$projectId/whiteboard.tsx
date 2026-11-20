import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { WhiteboardScreen } from "@/components/whiteboard/whiteboard-screen";

type WhiteboardSearchParams = {
  taskId?: string;
};

export const Route = createFileRoute(
  "/_layout/_authenticated/dashboard/workspace/$workspaceId/project/$projectId/whiteboard",
)({
  component: RouteComponent,
  validateSearch: (
    search: Record<string, unknown>,
  ): WhiteboardSearchParams => ({
    taskId: typeof search.taskId === "string" ? search.taskId : undefined,
  }),
});

function RouteComponent() {
  const { projectId, workspaceId } = Route.useParams();
  const { taskId } = Route.useSearch();
  const navigate = useNavigate();

  // Tasks open in the side sheet so the board stays where it was.
  const handleOpenTask = useCallback(
    (nextTaskId: string) => {
      navigate({ to: ".", search: { taskId: nextTaskId }, replace: true });
    },
    [navigate],
  );

  const handleCloseTask = useCallback(() => {
    navigate({ to: ".", search: {}, replace: true });
  }, [navigate]);

  return (
    <WhiteboardScreen
      projectId={projectId}
      workspaceId={workspaceId}
      taskId={taskId}
      onOpenTask={handleOpenTask}
      onCloseTask={handleCloseTask}
    />
  );
}
