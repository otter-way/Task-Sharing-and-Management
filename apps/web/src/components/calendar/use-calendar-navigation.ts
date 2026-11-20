import { addMonths, addWeeks, startOfMonth } from "date-fns";
import { useCallback, useMemo, useState } from "react";
import { formatDate } from "@/lib/format";
import type { CalendarMode } from "@/store/user-preferences";
import type { WeekStartsOn } from "./month-grid-model";
import { buildWeekDays, formatWeekRange } from "./week-model";

// One anchor date serves both ranges, so switching between week and month
// keeps the place: the week of 18 November opens November, and back.
export function useCalendarNavigation(
  mode: CalendarMode,
  weekStartsOn: WeekStartsOn,
  locale: string,
) {
  const [anchor, setAnchor] = useState(() => new Date());
  const [direction, setDirection] = useState<-1 | 0 | 1>(0);

  const step = useCallback(
    (by: -1 | 1) => {
      setDirection(by);
      setAnchor((current) =>
        mode === "week"
          ? addWeeks(current, by)
          : addMonths(startOfMonth(current), by),
      );
    },
    [mode],
  );

  const visibleMonth = useMemo(() => startOfMonth(anchor), [anchor]);
  const weekDays = useMemo(
    () => buildWeekDays(anchor, weekStartsOn),
    [anchor, weekStartsOn],
  );

  return {
    direction,
    visibleMonth,
    weekDays,
    label:
      mode === "week"
        ? formatWeekRange(weekDays, locale)
        : formatDate(visibleMonth, { month: "long", year: "numeric" }),
    previous: useCallback(() => step(-1), [step]),
    next: useCallback(() => step(1), [step]),
    today: useCallback(() => {
      setDirection(0);
      setAnchor(new Date());
    }, []),
    resetDirection: useCallback(() => setDirection(0), []),
  };
}
