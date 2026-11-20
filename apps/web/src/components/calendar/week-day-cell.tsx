import { useDroppable } from "@dnd-kit/core";
import { isToday, isWeekend } from "date-fns";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import { type DayDropData, dayDropId } from "./calendar-dnd-ids";
import type { CalendarRowTask } from "./calendar-task-row";
import { DraggableTaskRow } from "./draggable-task-row";
import { dayKey } from "./week-model";

type WeekDayCellProps = {
  day: Date;
  tasks: CalendarRowTask[];
  projectSlug: string | undefined;
  finalStatuses: ReadonlySet<string>;
  canMove: boolean;
  animateLayout: boolean;
  onOpenTask: (taskId: string) => void;
  onMoveByDays: (taskId: string, days: number) => void;
};

export function WeekDayCell({
  day,
  tasks,
  projectSlug,
  finalStatuses,
  canMove,
  animateLayout,
  onOpenTask,
  onMoveByDays,
}: WeekDayCellProps) {
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({
    id: dayDropId(day),
    data: { day } satisfies DayDropData,
  });
  const today = isToday(day);

  return (
    <section
      ref={setNodeRef}
      data-day={dayKey(day)}
      aria-label={formatDate(day, {
        weekday: "long",
        day: "numeric",
        month: "long",
      })}
      className={cn(
        "flex min-h-24 min-w-0 flex-col gap-1 border-border/60 p-1.5 max-md:border-b md:min-h-0",
        isWeekend(day) && "bg-muted/25",
        isOver ? "bg-accent" : "transition-colors duration-150",
      )}
    >
      <header className="flex items-center gap-1.5 px-1.5 pt-0.5 pb-1">
        <span className="font-medium text-muted-foreground text-xs">
          {formatDate(day, { weekday: "short" })}
        </span>
        <span
          className={cn(
            "flex h-5 min-w-5 items-center justify-center rounded-full px-1 font-medium text-xs tabular-nums",
            today ? "bg-primary text-primary-foreground" : "text-foreground",
          )}
        >
          {formatDate(day, { day: "numeric" })}
        </span>
        {tasks.length > 0 && (
          <span
            className="ml-auto text-[11px] text-muted-foreground tabular-nums"
            title={t("tasks:calendar.dayCount", { count: tasks.length })}
          >
            {tasks.length}
          </span>
        )}
      </header>
      <ul className="flex min-w-0 flex-col gap-0.5">
        {tasks.map((task) => (
          <DraggableTaskRow
            key={task.id}
            task={task}
            projectSlug={projectSlug}
            isDone={finalStatuses.has(task.status)}
            showKey={false}
            canMove={canMove}
            animateLayout={animateLayout}
            onOpen={onOpenTask}
            onMoveByDays={onMoveByDays}
          />
        ))}
      </ul>
    </section>
  );
}
