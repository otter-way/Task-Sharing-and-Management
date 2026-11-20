import { addDays, startOfDay } from "date-fns";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useRescheduleTask } from "@/hooks/mutations/task/use-reschedule-task";
import { parseTaskDate, toScheduledTasks } from "@/lib/task-schedule";
import type { CalendarMode } from "@/store/user-preferences";
import type { ProjectWithTasks } from "@/types/project";
import type Task from "@/types/task";
import { CalendarDnd } from "./calendar-dnd";
import type { CalendarTask } from "./calendar-task-bar";
import { CalendarTaskRowContent } from "./calendar-task-row";
import MonthAgenda from "./month-agenda";
import MonthGrid from "./month-grid";
import { UndatedRail } from "./undated-rail";
import { findUndatedTasks } from "./undated-tasks";
import { WeekGrid } from "./week-grid";
import { groupTasksByDay } from "./week-model";

type CalendarBoardProps = {
  mode: CalendarMode;
  project: ProjectWithTasks | undefined;
  filteredProject: ProjectWithTasks | null | undefined;
  monthTasks: CalendarTask[];
  weeks: Date[][];
  visibleMonth: Date;
  weekDays: Date[];
  direction: -1 | 0 | 1;
  maxLanes: number;
  isMobile: boolean;
  canMove: boolean;
  onOpenTask: (taskId: string) => void;
};

function allTasks(project: ProjectWithTasks | null | undefined): Task[] {
  return [
    ...(project?.columns.flatMap((column) => column.tasks) ?? []),
    ...(project?.plannedTasks ?? []),
  ];
}

export function CalendarBoard({
  mode,
  project,
  filteredProject,
  monthTasks,
  weeks,
  visibleMonth,
  weekDays,
  direction,
  maxLanes,
  isMobile,
  canMove,
  onOpenTask,
}: CalendarBoardProps) {
  const { t } = useTranslation();
  const { mutate: reschedule } = useRescheduleTask();
  const projectSlug = project?.slug;

  const tasksById = useMemo(
    () => new Map(allTasks(project).map((task) => [task.id, task])),
    [project],
  );
  const finalStatuses = useMemo(
    () =>
      new Set(
        project?.columns.filter((column) => column.isFinal).map((c) => c.id),
      ),
    [project],
  );
  const undated = useMemo(
    () => findUndatedTasks(filteredProject),
    [filteredProject],
  );
  const groups = useMemo(
    () => groupTasksByDay(toScheduledTasks(filteredProject), weekDays),
    [filteredProject, weekDays],
  );

  const shownThisWeek = groups.reduce((sum, group) => sum + group.length, 0);
  // Tells "nothing planned" apart from "filters hide everything".
  const plannedThisWeek = useMemo(
    () =>
      groupTasksByDay(toScheduledTasks(project), weekDays).reduce(
        (sum, group) => sum + group.length,
        0,
      ),
    [project, weekDays],
  );
  const emptyMessage =
    shownThisWeek > 0
      ? null
      : plannedThisWeek > 0
        ? { title: t("tasks:filterBar.noMatches") }
        : {
            title: t("tasks:calendar.emptyWeek.title"),
            description: canMove
              ? t("tasks:calendar.emptyWeek.description")
              : undefined,
          };

  const moveByDays = useCallback(
    (taskId: string, days: number) => {
      const task = tasksById.get(taskId);
      if (!task) return;
      const current =
        parseTaskDate(task.dueDate) ??
        parseTaskDate(task.startDate) ??
        startOfDay(new Date());
      reschedule({ task, day: addDays(current, days) });
    },
    [reschedule, tasksById],
  );

  const showRail = mode === "week" || !isMobile;

  return (
    <CalendarDnd
      tasksById={tasksById}
      canMove={canMove}
      renderOverlay={(task) => (
        <div className="flex w-56 min-w-0 items-center gap-1.5 px-1.5 py-1 text-foreground text-xs">
          <CalendarTaskRowContent
            task={task}
            projectSlug={projectSlug}
            isDone={finalStatuses.has(task.status)}
          />
        </div>
      )}
    >
      {({ animateLayout }) => (
        <div className="flex min-h-0 flex-1 max-md:flex-col max-md:overflow-auto">
          {mode === "week" ? (
            <WeekGrid
              days={weekDays}
              groups={groups}
              direction={direction}
              emptyMessage={emptyMessage}
              projectSlug={projectSlug}
              finalStatuses={finalStatuses}
              canMove={canMove}
              animateLayout={animateLayout}
              onOpenTask={onOpenTask}
              onMoveByDays={moveByDays}
            />
          ) : isMobile ? (
            monthTasks.length > 0 && (
              <MonthAgenda
                tasks={monthTasks}
                visibleMonth={visibleMonth}
                projectSlug={projectSlug}
                onOpenTask={onOpenTask}
              />
            )
          ) : (
            <MonthGrid
              weeks={weeks}
              tasks={monthTasks}
              visibleMonth={visibleMonth}
              maxLanes={maxLanes}
              projectSlug={projectSlug}
              canMove={canMove}
              onOpenTask={onOpenTask}
            />
          )}
          {showRail && (
            <UndatedRail
              tasks={undated}
              projectSlug={projectSlug}
              canMove={canMove}
              animateLayout={animateLayout}
              onOpenTask={onOpenTask}
            />
          )}
        </div>
      )}
    </CalendarDnd>
  );
}
