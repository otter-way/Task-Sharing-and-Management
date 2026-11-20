import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { errorMessage } from "@/components/project/error-message";
import { getInitialTaskColumn } from "@/components/shared/modals/initial-task-column";
import { useGetColumns } from "@/hooks/queries/column/use-get-columns";
import useCreateTask from "@/hooks/mutations/task/use-create-task";
import { toast } from "@/lib/toast";
import { taskFromText } from "./task-from-text";

export type CreatedTask = { id: string; key: string; link: string };

// "Convert to task" from the whiteboard and from notes: the text's first line
// becomes the title, the task lands in the project's first open column, and
// the caller gets back what it needs to mark its source.
export function useCreateTaskFromText({
  projectId,
  workspaceId,
  projectSlug,
  onOpenTask,
}: {
  projectId: string;
  workspaceId: string;
  projectSlug: string | undefined;
  onOpenTask: (taskId: string) => void;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: columns } = useGetColumns(projectId);
  const createTask = useCreateTask();
  const [creating, setCreating] = useState(false);

  const createFromText = async (text: string): Promise<CreatedTask | null> => {
    if (creating) return null;
    // Same rule as the new-task dialog: the first open column with a unique slug.
    const column = getInitialTaskColumn(columns);
    if (!column) {
      toast.error(t("tasks:convertToTask.noColumn"));
      return null;
    }

    setCreating(true);
    try {
      const { title, description } = taskFromText(text);
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

      toast.success(t("tasks:convertToTask.created", { key }), {
        action: {
          label: t("tasks:convertToTask.open"),
          onClick: () => onOpenTask(task.id),
        },
      });
      return { id: task.id, key, link };
    } catch (error) {
      toast.error(errorMessage(error, t("tasks:convertToTask.error")));
      return null;
    } finally {
      setCreating(false);
    }
  };

  return { createFromText, creating };
}
