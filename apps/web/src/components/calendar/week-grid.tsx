import { motion, useReducedMotion } from "motion/react";
import { useTranslation } from "react-i18next";
import { EASE_OUT } from "@/lib/motion";
import type { CalendarRowTask } from "./calendar-task-row";
import { WeekDayCell } from "./week-day-cell";
import { dayKey } from "./week-model";

type WeekGridProps = {
  days: Date[];
  groups: CalendarRowTask[][];
  // -1 after "previous", 1 after "next", 0 on first show and "this week".
  direction: -1 | 0 | 1;
  emptyMessage: { title: string; description?: string } | null;
  projectSlug: string | undefined;
  finalStatuses: ReadonlySet<string>;
  canMove: boolean;
  animateLayout: boolean;
  onOpenTask: (taskId: string) => void;
  onMoveByDays: (taskId: string, days: number) => void;
};

// Paging weeks gives the grid one short entrance from the side it came from;
// the cells arrive together, never one by one. Each page remounts the grid, so
// the entrance restarts on every click: starting half-visible keeps the week
// readable while someone pages quickly.
const PAGE_FROM_OPACITY = 0.5;

export function WeekGrid({
  days,
  groups,
  direction,
  emptyMessage,
  ...cellProps
}: WeekGridProps) {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const first = days[0];

  return (
    <div className="relative min-h-0 min-w-0 flex-1 overflow-auto">
      <motion.div
        key={first ? dayKey(first) : "week"}
        role="group"
        aria-label={t("tasks:calendar.mode.week")}
        initial={
          direction === 0
            ? false
            : reduceMotion
              ? { opacity: PAGE_FROM_OPACITY }
              : {
                  opacity: PAGE_FROM_OPACITY,
                  transform: `translateX(${direction * 8}px)`,
                }
        }
        animate={{ opacity: 1, transform: "translateX(0px)" }}
        transition={{ duration: 0.16, ease: EASE_OUT }}
        className="grid min-h-full grid-cols-1 md:grid-cols-7 md:divide-x md:divide-border/60"
      >
        {days.map((day, index) => (
          <WeekDayCell
            key={dayKey(day)}
            day={day}
            tasks={groups[index] ?? []}
            {...cellProps}
          />
        ))}
      </motion.div>
      {emptyMessage && (
        <div className="pointer-events-none absolute inset-x-0 top-1/3 flex justify-center px-4">
          <div className="flex max-w-sm flex-col gap-1 rounded-xl border border-border/80 bg-background/95 px-4 py-3 text-center shadow-xs/5">
            <p className="font-medium text-foreground text-sm">
              {emptyMessage.title}
            </p>
            {emptyMessage.description && (
              <p className="text-muted-foreground text-sm">
                {emptyMessage.description}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
