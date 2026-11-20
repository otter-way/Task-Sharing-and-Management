import { expect, it } from "vite-plus/test";
import { findUndatedTasks } from "./undated-tasks";

const task = (id: string, dueDate: string | null = null) => ({
  id,
  startDate: null,
  dueDate,
});

it("lists open and backlog tasks that have no dates", () => {
  expect(
    findUndatedTasks({
      columns: [
        { isFinal: false, tasks: [task("a"), task("b", "2026-11-18")] },
        { isFinal: true, tasks: [task("done")] },
      ],
      plannedTasks: [task("backlog")],
    }).map((item) => item.id),
  ).toEqual(["a", "backlog"]);
});
