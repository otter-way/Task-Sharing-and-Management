import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { rescheduleDates } from "@/components/calendar/reschedule";
import updateTask from "@/fetchers/task/update-task";
import updateTaskDueDate from "@/fetchers/task/update-task-due-date";
import { invalidateMyWork } from "@/lib/invalidate-my-work";
import { toast } from "@/lib/toast";
import { updateBoardTaskCache } from "@/lib/update-board-task-cache";
import type Task from "@/types/task";

// Calendar drag and drop. The task moves in the cache at once so the drop
// lands where it was aimed; a failed save puts it back and says so.
export function useRescheduleTask() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ task, day }: { task: Task; day: Date | null }) => {
      const next = { ...task, ...rescheduleDates(task, day) };
      // Only the due date changes for most moves; the lighter endpoint avoids
      // rewriting fields a teammate may be editing.
      if (next.startDate === task.startDate) {
        return updateTaskDueDate(task.id, next);
      }
      return updateTask(task.id, next);
    },
    onMutate: ({ task, day }) => {
      updateBoardTaskCache(
        queryClient,
        task.projectId,
        task.id,
        rescheduleDates(task, day),
      );
    },
    onError: (_error, { task }) => {
      updateBoardTaskCache(queryClient, task.projectId, task.id, {
        startDate: task.startDate,
        dueDate: task.dueDate,
      });
      toast.error(t("tasks:calendar.rescheduleError"));
    },
    onSuccess: (_data, { task }) => {
      invalidateMyWork(queryClient);
      void queryClient.invalidateQueries({ queryKey: ["task", task.id] });
      void queryClient.invalidateQueries({
        queryKey: ["activities", task.id],
      });
    },
  });
}
