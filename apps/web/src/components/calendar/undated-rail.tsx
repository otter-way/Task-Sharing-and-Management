import { useDndContext, useDroppable } from "@dnd-kit/core";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { UNDATED_DROP_ID } from "./calendar-dnd-ids";
import type { CalendarRowTask } from "./calendar-task-row";
import { DraggableTaskRow } from "./draggable-task-row";

type UndatedRailProps = {
  tasks: CalendarRowTask[];
  projectSlug: string | undefined;
  canMove: boolean;
  animateLayout: boolean;
  onOpenTask: (taskId: string) => void;
};

// Open tasks without a date, ready to be dragged onto a day. Dropping a dated
// task here clears its dates: the reverse of scheduling it. Below md the rail
// sits under the week and is capped, so a long list scrolls inside it instead
// of squeezing the week out of view.
export function UndatedRail({
  tasks,
  projectSlug,
  canMove,
  animateLayout,
  onOpenTask,
}: UndatedRailProps) {
  const { t } = useTranslation();
  const { active } = useDndContext();
  const { setNodeRef, isOver } = useDroppable({ id: UNDATED_DROP_ID });
  const draggingDated =
    !!active && !tasks.some((task) => `task:${task.id}` === String(active.id));

  return (
    <aside
      ref={setNodeRef}
      aria-label={t("tasks:calendar.undated.title")}
      className={cn(
        "flex min-h-0 shrink-0 flex-col gap-1 border-border/80 p-1.5 max-md:max-h-[40%] max-md:border-t md:w-64 md:border-l",
        isOver ? "bg-accent" : "transition-colors duration-150",
      )}
    >
      <header className="flex items-center gap-1.5 px-1.5 pt-0.5 pb-1">
        <h2 className="font-medium text-foreground text-xs">
          {t("tasks:calendar.undated.title")}
        </h2>
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {tasks.length}
        </span>
      </header>
      <p className="px-1.5 text-[11px] text-muted-foreground">
        {draggingDated
          ? t("tasks:calendar.undated.dropHint")
          : tasks.length > 0
            ? t("tasks:calendar.undated.hint")
            : t("tasks:calendar.undated.empty")}
      </p>
      <ul className="flex min-h-0 flex-col gap-0.5 overflow-y-auto">
        {tasks.map((task) => (
          <DraggableTaskRow
            key={task.id}
            task={task}
            projectSlug={projectSlug}
            isDone={false}
            canMove={canMove}
            animateLayout={animateLayout}
            onOpen={onOpenTask}
          />
        ))}
      </ul>
    </aside>
  );
}
