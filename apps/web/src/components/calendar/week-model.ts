import {
  addDays,
  differenceInCalendarDays,
  format,
  startOfWeek,
} from "date-fns";
import { localeCompareSort } from "@/lib/format";
import type { WeekStartsOn } from "./month-grid-model";

export function buildWeekDays(anchor: Date, weekStartsOn: WeekStartsOn) {
  const start = startOfWeek(anchor, { weekStartsOn });
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

export function dayKey(day: Date) {
  return format(day, "yyyy-MM-dd");
}

// The week view places a task on its due day (or its start day when it only
// has a start), one row per task, so a busy day reads as a list.
export function groupTasksByDay<T extends { scheduleEnd: Date; title: string }>(
  tasks: readonly T[],
  days: readonly Date[],
): T[][] {
  const first = days[0];
  const groups: T[][] = days.map(() => []);
  if (!first) return groups;
  for (const task of tasks) {
    const index = differenceInCalendarDays(task.scheduleEnd, first);
    if (index >= 0 && index < days.length) groups[index]?.push(task);
  }
  for (const group of groups) {
    group.sort(
      (a, b) =>
        a.scheduleEnd.getTime() - b.scheduleEnd.getTime() ||
        // Numeric and in the interface language: "7. görüşme" before "10.".
        localeCompareSort(a.title, b.title),
    );
  }
  return groups;
}

// "16–22 Kasım 2026", "30 Kasım – 6 Aralık 2026": the browser drops whatever
// the two ends share.
export function formatWeekRange(days: readonly Date[], locale: string) {
  const first = days[0];
  const last = days.at(-1);
  if (!first || !last) return "";
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).formatRange(first, last);
}
