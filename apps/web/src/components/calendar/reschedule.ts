import { addDays, differenceInCalendarDays, set, startOfDay } from "date-fns";
import { parseTaskDate } from "@/lib/task-schedule";

type Dates = { startDate: string | null; dueDate: string | null };

// Moving a task to another day keeps its time of day and its length: the due
// date lands on the new day and the start date shifts by the same amount.
// Dropping it on the undated list clears both dates.
export function rescheduleDates(task: Dates, day: Date | null): Dates {
  if (!day) return { startDate: null, dueDate: null };

  const due = parseTaskDate(task.dueDate);
  const start = parseTaskDate(task.startDate);
  const anchor = due ?? start;
  const onDay = (time: Date) =>
    set(day, {
      hours: time.getHours(),
      minutes: time.getMinutes(),
      seconds: time.getSeconds(),
      milliseconds: 0,
    });

  if (!anchor) {
    return { startDate: null, dueDate: startOfDay(day).toISOString() };
  }

  const shift = differenceInCalendarDays(day, anchor);
  return {
    startDate: start
      ? (due ? addDays(start, shift) : onDay(start)).toISOString()
      : null,
    dueDate: due ? onDay(due).toISOString() : null,
  };
}
