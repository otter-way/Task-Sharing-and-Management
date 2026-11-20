import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { errorMessage } from "@/components/project/error-message";
import { getInitialTaskColumn } from "@/components/shared/modals/initial-task-column";
import { useGetColumns } from "@/hooks/queries/column/use-get-columns";
import useCreateTask from "@/hooks/mutations/task/use-create-task";
import { toast } from "@/lib/toast";
import type { BoardElement } from "./board-element";
import type { ConvertibleSelection } from "./find-convertible-selection";
import { markAsTask } from "./mark-as-task";
import { taskFromText } from "./task-from-text";

export function useConvertToTask({
  api,
  projectId,
  workspaceId,
  projectSlug,
  onOpenTask,
}: {
  api: ExcalidrawImperativeAPI | null;
  projectId: string;
  workspaceId: string;
  projectSlug: string | undefined;
  onOpenTask: (taskId: string) => void;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: columns } = useGetColumns(projectId);
  const createTask = useCreateTask();
  const [converting, setConverting] = useState(false);

  const convert = async (selection: ConvertibleSelection) => {
    if (!api || converting) return;
    // Same rule as the new-task dialog: the first open column with a unique slug.
    const column = getInitialTaskColumn(columns);
    if (!column) {
      toast.error(t("whiteboard:convert.noColumn"));
      return;
    }

    setConverting(true);
    try {
      const { title, description } = taskFromText(selection.text);
      const task = await createTask.mutateAsync({
        title,
        description,
        projectId,
        status: column.slug,
        priority: "no-priority",
      });
      const key = projectSlug ? `${projectSlug}-${task.number}` : title;
      const link = router.buildLocation({
        to: "/dashboard/workspace/$workspaceId/project/$projectId/task/$taskId",
        params: { workspaceId, projectId, taskId: task.id },
      }).href;

      api.updateScene({
        elements: markAsTask(
          api.getSceneElementsIncludingDeleted() as readonly BoardElement[],
          selection.targetId,
          { id: task.id, key, link },
        ) as unknown as Parameters<
          ExcalidrawImperativeAPI["updateScene"]
        >[0]["elements"],
        captureUpdate: "IMMEDIATELY",
      });

      toast.success(t("whiteboard:convert.created", { key }), {
        action: {
          label: t("whiteboard:convert.open"),
          onClick: () => onOpenTask(task.id),
        },
      });
    } catch (error) {
      toast.error(errorMessage(error, t("whiteboard:convert.error")));
    } finally {
      setConverting(false);
    }
  };

  return { convert, converting };
}
