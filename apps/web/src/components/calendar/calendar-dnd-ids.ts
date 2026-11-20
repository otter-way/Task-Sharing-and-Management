import { dayKey } from "./week-model";

export const UNDATED_DROP_ID = "undated";

export type DayDropData = { day: Date };
export type TaskDragData = { taskId: string };

export function dayDropId(day: Date) {
  return `day:${dayKey(day)}`;
}

export function taskDragId(taskId: string) {
  return `task:${taskId}`;
}
