import { useDraggable } from "@dnd-kit/core";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { EASE_IN_OUT } from "@/lib/motion";
import { taskDragId, type TaskDragData } from "./calendar-dnd-ids";
import { useIsLanding } from "./calendar-landing";
import {
  type CalendarRowTask,
  CalendarTaskRowContent,
  useTaskRowTitle,
} from "./calendar-task-row";

type DraggableTaskRowProps = {
  task: CalendarRowTask;
  projectSlug: string | undefined;
  isDone: boolean;
  showKey?: boolean;
  canMove: boolean;
  // Set only for the moment after a drop, so rows slide to make room for the
  // dropped task; filtering or paging never animates the list.
  animateLayout: boolean;
  onOpen: (taskId: string) => void;
  onMoveByDays?: (taskId: string, days: number) => void;
};

export function DraggableTaskRow({
  task,
  projectSlug,
  isDone,
  showKey,
  canMove,
  animateLayout,
  onOpen,
  onMoveByDays,
}: DraggableTaskRowProps) {
  const title = useTaskRowTitle(task, projectSlug);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: taskDragId(task.id),
    data: { taskId: task.id } satisfies TaskDragData,
    disabled: !canMove,
  });
  const isLanding = useIsLanding(task.id);

  return (
    <motion.li
      layout={animateLayout ? "position" : false}
      transition={{ layout: { duration: 0.2, ease: EASE_IN_OUT } }}
    >
      <button
        ref={setNodeRef}
        type="button"
        {...attributes}
        {...listeners}
        title={title}
        onClick={() => onOpen(task.id)}
        onKeyDown={(event) => {
          // Keyboard moves are instant: they repeat quickly and need no
          // spatial cue beyond the row appearing on its new day.
          if (!canMove || !event.altKey || !onMoveByDays) return;
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
          event.preventDefault();
          onMoveByDays(task.id, event.key === "ArrowLeft" ? -1 : 1);
        }}
        className={cn(
          "flex w-full min-w-0 items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-foreground text-xs outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
          canMove && "cursor-grab active:cursor-grabbing",
          (isDragging || isLanding) && "opacity-40",
        )}
      >
        <CalendarTaskRowContent
          task={task}
          projectSlug={projectSlug}
          isDone={isDone}
          showKey={showKey}
        />
      </button>
    </motion.li>
  );
}
