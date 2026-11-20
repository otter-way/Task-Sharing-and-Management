import { expect, it } from "vite-plus/test";
import {
  isTaskLayoutView,
  resolveProjectView,
  routeForView,
  tasksViewFor,
} from "./project-views";

it("serves board and list from the board route", () => {
  expect(routeForView("list")).toBe("board");
  expect(routeForView("gantt")).toBe("gantt");
  expect(resolveProjectView("board", "list")).toBe("list");
  expect(resolveProjectView("calendar", "list")).toBe("calendar");
});

it("returns to the last task layout, falling back to board or list", () => {
  expect(tasksViewFor("calendar", "list")).toBe("calendar");
  expect(tasksViewFor("gantt", "board")).toBe("gantt");
  expect(tasksViewFor("board", "list")).toBe("list");
});

it("keeps backlog and whiteboard out of the remembered task layout", () => {
  expect(isTaskLayoutView("calendar")).toBe(true);
  expect(isTaskLayoutView("list")).toBe(true);
  expect(isTaskLayoutView("backlog")).toBe(false);
  expect(isTaskLayoutView("whiteboard")).toBe(false);
  expect(routeForView("whiteboard")).toBe("whiteboard");
});
