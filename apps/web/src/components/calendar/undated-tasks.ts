type Task = { id: string; startDate: string | null; dueDate: string | null };
type Source<T> = {
  columns: Array<{ isFinal?: boolean | null; tasks: T[] }>;
  plannedTasks: T[];
};

// The planning pool: open tasks with neither date, backlog included.
// Finished work stays out; it no longer needs a day.
export function findUndatedTasks<T extends Task>(
  source: Source<T> | null | undefined,
): T[] {
  if (!source) return [];
  return [
    ...source.columns
      .filter((column) => !column.isFinal)
      .flatMap((column) => column.tasks),
    ...source.plannedTasks,
  ].filter((task) => !task.startDate && !task.dueDate);
}
