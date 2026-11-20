import {
  type Announcements,
  type CollisionDetection,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  type DropAnimation,
  defaultDropAnimationSideEffects,
  MouseSensor,
  pointerWithin,
  rectIntersection,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { isSameDay } from "date-fns";
import { useReducedMotion } from "motion/react";
import { type ReactNode, useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRescheduleTask } from "@/hooks/mutations/task/use-reschedule-task";
import { formatDate } from "@/lib/format";
import { EASE_OUT_CSS } from "@/lib/motion";
import { parseTaskDate } from "@/lib/task-schedule";
import type Task from "@/types/task";
import {
  type DayDropData,
  type TaskDragData,
  UNDATED_DROP_ID,
} from "./calendar-dnd-ids";

// The dropped task lands in its new slot over 200ms while its new neighbours
// make room with the same timing (see DraggableTaskRow), so the drop reads as
// one movement. The lifted copy grows slightly to show it left the grid.
const DROP_ANIMATION: DropAnimation = {
  duration: 200,
  easing: EASE_OUT_CSS,
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: "0.4" } },
  }),
};
const LAYOUT_WINDOW_MS = 260;

// The day under the pointer is the target. The lifted copy is wider than a
// day column, so judging by its overlap picked the neighbouring day.
const pointerFirst: CollisionDetection = (args) => {
  const hits = pointerWithin(args);
  return hits.length > 0 ? hits : rectIntersection(args);
};

type CalendarDndProps = {
  tasksById: ReadonlyMap<string, Task>;
  canMove: boolean;
  renderOverlay: (task: Task) => ReactNode;
  children: (state: { animateLayout: boolean }) => ReactNode;
};

function taskDay(task: Task) {
  return parseTaskDate(task.dueDate) ?? parseTaskDate(task.startDate);
}

export function CalendarDnd({
  tasksById,
  canMove,
  renderOverlay,
  children,
}: CalendarDndProps) {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const { mutate: reschedule } = useRescheduleTask();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [animateLayout, setAnimateLayout] = useState(false);
  const layoutTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: canMove ? 6 : 999_999 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: canMove ? 250 : 999_999, tolerance: 8 },
    }),
  );

  const titleOf = useCallback(
    (id: string | number) => {
      const taskId = String(id).replace(/^task:/, "");
      return tasksById.get(taskId)?.title ?? "";
    },
    [tasksById],
  );

  const announcements: Announcements = {
    onDragStart: ({ active }) =>
      t("tasks:calendar.dnd.picked", { title: titleOf(active.id) }),
    onDragOver: () => undefined,
    onDragEnd: ({ active, over }) => {
      if (!over) return t("tasks:calendar.dnd.cancelled");
      if (over.id === UNDATED_DROP_ID) {
        return t("tasks:calendar.dnd.movedUndated", {
          title: titleOf(active.id),
        });
      }
      const day = (over.data.current as DayDropData | undefined)?.day;
      return day
        ? t("tasks:calendar.dnd.movedTo", {
            title: titleOf(active.id),
            date: formatDate(day, { day: "numeric", month: "long" }),
          })
        : undefined;
    },
    onDragCancel: () => t("tasks:calendar.dnd.cancelled"),
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(
      (active.data.current as TaskDragData | undefined)?.taskId ?? null,
    );
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    const taskId = (active.data.current as TaskDragData | undefined)?.taskId;
    const task = taskId ? tasksById.get(taskId) : undefined;
    if (!task || !over) return;

    const day =
      over.id === UNDATED_DROP_ID
        ? null
        : ((over.data.current as DayDropData | undefined)?.day ?? undefined);
    if (day === undefined) return;
    const current = taskDay(task);
    if (day === null ? !current : current && isSameDay(current, day)) return;

    if (!reduceMotion) {
      setAnimateLayout(true);
      clearTimeout(layoutTimer.current);
      layoutTimer.current = setTimeout(
        () => setAnimateLayout(false),
        LAYOUT_WINDOW_MS,
      );
    }
    reschedule({ task, day });
  };

  const activeTask = activeId ? tasksById.get(activeId) : undefined;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerFirst}
      accessibility={{
        announcements,
        screenReaderInstructions: {
          draggable: t("tasks:calendar.dnd.instructions"),
        },
      }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      {children({ animateLayout })}
      <DragOverlay dropAnimation={reduceMotion ? null : DROP_ANIMATION}>
        {activeTask ? (
          <div className="scale-[1.02] rounded-md bg-popover shadow-lg ring-1 ring-border transition-[scale] duration-150 ease-out starting:scale-100 motion-reduce:transition-none">
            {renderOverlay(activeTask)}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
