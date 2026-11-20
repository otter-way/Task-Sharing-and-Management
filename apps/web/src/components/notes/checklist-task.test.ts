import { describe, expect, it } from "vite-plus/test";
import {
  findChecklistTarget,
  taskIdFromHref,
  withTaskLink,
} from "./checklist-task";

const todo = (content: unknown, id = "b1") => ({
  id,
  type: "checkListItem",
  content,
});
const text = (value: string) => ({ type: "text", text: value, styles: {} });
const link = "/dashboard/workspace/w1/project/p1/task/t9";

describe("checklist task helpers", () => {
  it("reads a single to-do item's text", () => {
    expect(
      findChecklistTarget([todo([text("Veli "), text("bülteni hazırla")])]),
    ).toEqual({
      blockId: "b1",
      text: "Veli bülteni hazırla",
      taskId: null,
      taskKey: null,
    });
  });

  it("ignores other blocks, empty items and multi-block selections", () => {
    expect(
      findChecklistTarget([
        { id: "p", type: "paragraph", content: [text("x")] },
      ]),
    ).toBeNull();
    expect(findChecklistTarget([todo([text("  ")])])).toBeNull();
    expect(
      findChecklistTarget([todo([text("a")]), todo([text("b")], "b2")]),
    ).toBeNull();
  });

  it("appends the task key as a link and then reports that task", () => {
    const content = withTaskLink([text("Pano çalışması")], {
      key: "KP-3",
      link,
    });
    expect(content.at(-1)).toEqual({
      type: "link",
      href: link,
      content: [text("KP-3")],
    });
    expect(findChecklistTarget([todo(content)])).toEqual({
      blockId: "b1",
      text: "Pano çalışması",
      taskId: "t9",
      taskKey: "KP-3",
    });
  });

  it("recognises only task links", () => {
    expect(taskIdFromHref(link)).toBe("t9");
    expect(taskIdFromHref("https://example.com/task")).toBeNull();
  });
});
