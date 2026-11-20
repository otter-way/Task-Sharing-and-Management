import { expect, it } from "vite-plus/test";
import type { BoardElement } from "./board-element";
import { markAsTask } from "./mark-as-task";

it("links only the target element to the task and records an edit", () => {
  const elements: BoardElement[] = [
    {
      id: "note",
      type: "rectangle",
      version: 4,
      isDeleted: false,
      customData: { color: "yellow" },
    },
    { id: "other", type: "text", version: 2, isDeleted: false },
  ];

  const [note, other] = markAsTask(elements, "note", {
    id: "task-1",
    key: "IP-12",
    link: "/task/task-1",
  });

  expect(note).toMatchObject({
    link: "/task/task-1",
    version: 5,
    customData: {
      color: "yellow",
      kaneoTaskId: "task-1",
      kaneoTaskKey: "IP-12",
    },
  });
  expect(note?.versionNonce).toEqual(expect.any(Number));
  expect(other).toBe(elements[1]);
});
